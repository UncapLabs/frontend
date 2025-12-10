import { RpcProvider } from "starknet";
import { contractRead } from "~/lib/contracts/calls";
import {
  COLLATERAL_LIST,
  type CollateralId,
  getCollateralByBranchId,
} from "~/lib/collateral";
import { getBitcoinprice } from "./utils";
import { bigintToBig } from "~/lib/decimal";
import Big from "big.js";
import { createGraphQLClient } from "~/lib/graphql/client";
import { ALL_TROVES, TROVES_COUNT } from "~/lib/graphql/documents";
import type {
  AllTrovesQuery,
  TrovesCountQuery,
} from "~/lib/graphql/gql/graphql";
import {
  Trove_OrderBy,
  OrderDirection,
} from "~/lib/graphql/gql/graphql";

const CACHE_KEY = "protocol-stats";
const CACHE_TTL = 30 * 60; // 30 minutes

export const ALL_POSITIONS_PAGE_SIZE = 50;

export interface ProtocolStats {
  totalCollateralUSD: string;
  totalUsduCirculation: string;
}

export interface IndexedTroveEntry {
  id: string;
  troveId: string;
  borrower: string;
  debt: string;
  deposit: string;
  interestRate: string;
  status: string;
  collateralSymbol: string;
  collateralBranchId: number;
  createdAt: number;
  updatedAt: number;
  closedAt: number | null;
  redeemedColl: string | null;
  redeemedDebt: string | null;
  liquidationTx: string | null;
  batchManager: string | null;
  batchInterestRate: string | null;
}

export interface AllPositionsResult {
  positions: IndexedTroveEntry[];
  total: number;
  hasMore: boolean;
  pageCount: number;
}

/**
 * Fetches aggregated protocol stats (total collateral USD and USDU in circulation)
 * Results are cached in KV store for 30 minutes
 */
export async function getProtocolStats(env: Env): Promise<ProtocolStats> {
  // Try to get from KV cache first
  const cached = await env.CACHE.get(CACHE_KEY, "json");
  if (cached) {
    return cached as ProtocolStats;
  }

  const provider = new RpcProvider({ nodeUrl: env.NODE_URL });

  // Fetch data for all collaterals in parallel
  const branchDataPromises = COLLATERAL_LIST.map(async (collateral) => {
    const branchId = collateral.id as CollateralId;

    // Get price and branch data in parallel
    const [priceResult, branchData] = await Promise.all([
      getBitcoinprice(provider, branchId),
      contractRead.troveManager.getBranchTCR(provider, branchId),
    ]);

    const priceBig = bigintToBig(priceResult, 18);
    const totalCollateralBig = bigintToBig(branchData.totalCollateral, 18);
    const totalDebtBig = bigintToBig(branchData.totalDebt, 18);

    // Calculate collateral value in USD
    const collateralValueInUSD = totalCollateralBig.times(priceBig);

    return {
      totalCollateralUSD: collateralValueInUSD,
      totalDebt: totalDebtBig,
    };
  });

  const branchResults = await Promise.all(branchDataPromises);

  // Sum up totals across all branches
  let totalCollateralUSD = new Big(0);
  let totalUsduCirculation = new Big(0);

  for (const branch of branchResults) {
    totalCollateralUSD = totalCollateralUSD.plus(branch.totalCollateralUSD);
    totalUsduCirculation = totalUsduCirculation.plus(branch.totalDebt);
  }

  const result: ProtocolStats = {
    totalCollateralUSD: totalCollateralUSD.toString(),
    totalUsduCirculation: totalUsduCirculation.toString(),
  };

  // Cache the result in KV store
  await env.CACHE.put(CACHE_KEY, JSON.stringify(result), {
    expirationTtl: CACHE_TTL,
  });

  return result;
}

// Valid sort fields - some map to GraphQL, others are calculated
export type SortField = "debt" | "deposit" | "interestRate" | "createdAt" | "updatedAt" | "ltv" | "liquidationPrice";
export type SortDirection = "asc" | "desc";

// Fields that can be sorted by the GraphQL indexer
const GRAPHQL_SORT_FIELDS: Record<string, Trove_OrderBy> = {
  debt: Trove_OrderBy.Debt,
  deposit: Trove_OrderBy.Deposit,
  interestRate: Trove_OrderBy.InterestRate,
  createdAt: Trove_OrderBy.CreatedAt,
  updatedAt: Trove_OrderBy.UpdatedAt,
};

// Fields that require server-side calculation and sorting
// interestRate is included because we need to sort by effective rate (batchInterestRate || interestRate)
const CALCULATED_SORT_FIELDS = ["ltv", "liquidationPrice", "interestRate"] as const;

const DECIMALS_18 = new Big(10).pow(18);

function isCalculatedField(field: string): boolean {
  return CALCULATED_SORT_FIELDS.includes(field as typeof CALCULATED_SORT_FIELDS[number]);
}

// Calculate LTV: (Debt / (Deposit * BTC Price)) * 100
function calculateLTV(debt: string, deposit: string, btcPrice: Big): number | null {
  try {
    const bigDebt = new Big(debt).div(DECIMALS_18);
    const bigDeposit = new Big(deposit).div(DECIMALS_18);
    if (bigDeposit.lte(0) || bigDebt.lte(0)) return null;
    const collateralValue = bigDeposit.times(btcPrice);
    if (collateralValue.lte(0)) return null;
    return bigDebt.div(collateralValue).times(100).toNumber();
  } catch {
    return null;
  }
}

// Calculate Liquidation Price: (Debt * MCR) / Deposit
function calculateLiquidationPrice(debt: string, deposit: string, mcr: Big): number | null {
  try {
    const bigDebt = new Big(debt).div(DECIMALS_18);
    const bigDeposit = new Big(deposit).div(DECIMALS_18);
    if (bigDeposit.lte(0) || bigDebt.lte(0)) return null;
    return bigDebt.times(mcr).div(bigDeposit).toNumber();
  } catch {
    return null;
  }
}

/**
 * Fetches all positions (troves) from the indexer with pagination
 * For calculated fields (LTV, liquidation price), fetches all data, calculates, sorts, then paginates
 */
export async function getAllPositions(
  env: Env,
  options: {
    limit?: number;
    offset?: number;
    status?: string;
    sortBy?: SortField;
    sortDirection?: SortDirection;
  } = {}
): Promise<AllPositionsResult> {
  const {
    limit = ALL_POSITIONS_PAGE_SIZE,
    offset = 0,
    status = "active",
    sortBy = "debt",
    sortDirection = "desc",
  } = options;

  const graphqlEndpoint = env.GRAPHQL_ENDPOINT;
  const graphqlClient = createGraphQLClient(graphqlEndpoint);
  const indexer = process.env.NETWORK || "sepolia";

  const needsCalculatedSort = isCalculatedField(sortBy);

  // For calculated fields, we need to fetch all data to sort properly
  // For GraphQL-supported fields, we can use server-side sorting with pagination
  const fetchLimit = needsCalculatedSort ? 1000 : limit; // Fetch more for calculated sort
  const fetchOffset = needsCalculatedSort ? 0 : offset;

  // Map sort parameters to GraphQL enum values (use debt as default for calculated fields)
  const orderBy = needsCalculatedSort
    ? Trove_OrderBy.Debt
    : (GRAPHQL_SORT_FIELDS[sortBy] || Trove_OrderBy.Debt);
  const orderDirection = sortDirection === "asc" ? OrderDirection.Asc : OrderDirection.Desc;

  // Fetch troves and count in parallel
  const [trovesResult, countResult, btcPriceResult] = await Promise.all([
    graphqlClient.request<AllTrovesQuery>(ALL_TROVES, {
      indexer,
      first: fetchLimit,
      skip: fetchOffset,
      status,
      orderBy,
      orderDirection,
    }),
    graphqlClient.request<TrovesCountQuery>(TROVES_COUNT, {
      indexer,
      status,
    }),
    // Fetch BTC price if we need to calculate LTV
    needsCalculatedSort && sortBy === "ltv"
      ? getBitcoinprice(new RpcProvider({ nodeUrl: env.NODE_URL }), "WWBTC" as CollateralId)
      : Promise.resolve(null),
  ]);

  const troves = trovesResult.troves || [];
  const total = countResult.troves?.length || 0;
  const pageCount = Math.ceil(total / limit);

  // Map troves to our IndexedTroveEntry format
  let positions: IndexedTroveEntry[] = troves.map((trove) => {
    const branchId = Number(trove.collateral?.collIndex ?? 0);
    const collateral = getCollateralByBranchId(branchId);

    // For liquidated/closed troves, use previousOwner if borrower is zero address
    // The borrower field becomes the zero address after liquidation or closure
    const isZeroBorrower =
      !trove.borrower ||
      trove.borrower === "0x0" ||
      trove.borrower.match(/^0x0+$/);
    const actualBorrower =
      isZeroBorrower && trove.previousOwner && !trove.previousOwner.match(/^0x0+$/)
        ? trove.previousOwner
        : trove.borrower;

    return {
      id: trove.id,
      troveId: trove.troveId,
      borrower: actualBorrower,
      debt: trove.debt,
      deposit: trove.deposit,
      interestRate: trove.interestRate,
      status: trove.status,
      collateralSymbol: collateral?.symbol || "Unknown",
      collateralBranchId: branchId,
      createdAt: Number(trove.createdAt) * 1000,
      updatedAt: Number(trove.updatedAt) * 1000,
      closedAt: trove.closedAt ? Number(trove.closedAt) * 1000 : null,
      redeemedColl: trove.redeemedColl || null,
      redeemedDebt: trove.redeemedDebt || null,
      liquidationTx: trove.liquidationTx || null,
      batchManager: trove.interestBatch?.batchManager || null,
      batchInterestRate: trove.interestBatch?.annualInterestRate || null,
    };
  });

  // If sorting by a calculated field, calculate values, sort, then paginate
  if (needsCalculatedSort) {
    const btcPrice = btcPriceResult ? bigintToBig(btcPriceResult, 18) : null;

    // Calculate sort values and sort
    const positionsWithCalc = positions.map((pos) => {
      const collateral = getCollateralByBranchId(pos.collateralBranchId);
      const mcr = collateral?.minCollateralizationRatio || new Big(1.15);

      let sortValue: number | null = null;
      if (sortBy === "ltv" && btcPrice) {
        sortValue = calculateLTV(pos.debt, pos.deposit, btcPrice);
      } else if (sortBy === "liquidationPrice") {
        sortValue = calculateLiquidationPrice(pos.debt, pos.deposit, mcr);
      } else if (sortBy === "interestRate") {
        // Use effective interest rate: batchInterestRate if available, otherwise interestRate
        const effectiveRate = pos.batchInterestRate || pos.interestRate;
        try {
          sortValue = new Big(effectiveRate).toNumber();
        } catch {
          sortValue = null;
        }
      }

      return { ...pos, _sortValue: sortValue };
    });

    // Sort by calculated value (nulls at end)
    positionsWithCalc.sort((a, b) => {
      if (a._sortValue === null && b._sortValue === null) return 0;
      if (a._sortValue === null) return 1;
      if (b._sortValue === null) return -1;
      const diff = a._sortValue - b._sortValue;
      return sortDirection === "asc" ? diff : -diff;
    });

    // Paginate after sorting
    const paginatedPositions = positionsWithCalc.slice(offset, offset + limit);
    // Remove the temporary sort value
    positions = paginatedPositions.map(({ _sortValue, ...pos }) => pos);
  }

  const hasMore = offset + positions.length < total;

  return {
    positions,
    total,
    hasMore,
    pageCount,
  };
}
