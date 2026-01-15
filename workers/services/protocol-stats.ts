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
import {
  ALL_TROVES,
  TROVES_COUNT,
  TROVES_BY_BORROWER,
  TROVES_BY_PREVIOUS_OWNER,
} from "~/lib/graphql/documents";
import type {
  AllTrovesQuery,
  TrovesCountQuery,
  TrovesByBorrowerQuery,
  TrovesByPreviousOwnerQuery,
} from "~/lib/graphql/gql/graphql";
import {
  Trove_OrderBy,
  OrderDirection,
} from "~/lib/graphql/gql/graphql";
import { getDebtInFrontForPositions } from "./interest";

const CACHE_TTL = 30 * 60; // 30 minutes

/**
 * Get network-prefixed cache key to prevent staging/production data mixing
 */
function getCacheKey(base: string): string {
  const network = process.env.NETWORK || "sepolia";
  return `${network}:${base}`;
}

const CACHE_KEY = getCacheKey("protocol-stats");

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
  debtInFront: string | null;
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
 * When address is provided, returns all positions for that address (bypasses normal pagination)
 */
export async function getAllPositions(
  env: Env,
  options: {
    limit?: number;
    offset?: number;
    status?: string;
    sortBy?: SortField;
    sortDirection?: SortDirection;
    address?: string;
    collateralBranchId?: number;
  } = {}
): Promise<AllPositionsResult> {
  const {
    limit = ALL_POSITIONS_PAGE_SIZE,
    offset = 0,
    status = "active",
    sortBy = "debt",
    sortDirection = "desc",
    address,
    collateralBranchId,
  } = options;

  const graphqlEndpoint = env.GRAPHQL_ENDPOINT;
  const graphqlClient = createGraphQLClient(graphqlEndpoint);
  const indexer = process.env.NETWORK || "sepolia";

  // Helper to map trove data to IndexedTroveEntry (without debtInFront, added later)
  const mapTroveToEntry = (trove: AllTrovesQuery["troves"][number]) => {
    const branchId = Number(trove.collateral?.collIndex ?? 0);
    const collateral = getCollateralByBranchId(branchId);

    // For liquidated/closed troves, use previousOwner if borrower is zero address
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
  };

  let troves: AllTrovesQuery["troves"] = [];
  let total = 0;

  // If address is provided, use address-specific queries
  if (address) {
    // Normalize address to lowercase for case-insensitive matching
    const normalizedAddress = address.toLowerCase();

    // Fetch positions where user is borrower OR previousOwner (for closed/liquidated positions)
    // For closed and liquidated positions, the borrower field is reset to zero address
    // and the original owner is stored in previousOwner
    const needsPreviousOwnerQuery = status === "liquidated" || status === "closed";

    const [borrowerResult, previousOwnerResult] = await Promise.all([
      graphqlClient.request<TrovesByBorrowerQuery>(TROVES_BY_BORROWER, {
        indexer,
        borrower: normalizedAddress,
        status,
      }),
      needsPreviousOwnerQuery
        ? graphqlClient.request<TrovesByPreviousOwnerQuery>(TROVES_BY_PREVIOUS_OWNER, {
            indexer,
            previousOwner: normalizedAddress,
            status,
          })
        : Promise.resolve({ troves: [] }),
    ]);

    // Combine results, avoiding duplicates
    const seenIds = new Set<string>();
    troves = [];

    for (const trove of borrowerResult.troves || []) {
      if (!seenIds.has(trove.id)) {
        seenIds.add(trove.id);
        troves.push(trove);
      }
    }

    for (const trove of previousOwnerResult.troves || []) {
      if (!seenIds.has(trove.id)) {
        seenIds.add(trove.id);
        troves.push(trove);
      }
    }

    total = troves.length;
  } else {
    // Normal pagination flow
    const needsCalculatedSort = isCalculatedField(sortBy);
    const hasCollateralFilter = collateralBranchId !== undefined;
    const needsServerProcessing = needsCalculatedSort || hasCollateralFilter;

    // For calculated fields or collateral filtering, we need to fetch all data to sort/filter properly
    const fetchLimit = needsServerProcessing ? 1000 : limit;
    const fetchOffset = needsServerProcessing ? 0 : offset;

    // Map sort parameters to GraphQL enum values
    // When filtering by collateral, we'll re-sort server-side anyway, so use default sort
    const orderBy = needsServerProcessing
      ? Trove_OrderBy.Debt
      : (GRAPHQL_SORT_FIELDS[sortBy] || Trove_OrderBy.Debt);
    const orderDirection = sortDirection === "asc" ? OrderDirection.Asc : OrderDirection.Desc;

    const [trovesResult, countResult] = await Promise.all([
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
    ]);

    troves = trovesResult.troves || [];
    total = countResult.troves?.length || 0;
  }

  // Map troves to entries (without debtInFront initially)
  let positions = troves.map(mapTroveToEntry);

  // Apply collateral filter if specified
  const hasCollateralFilter = collateralBranchId !== undefined;
  if (hasCollateralFilter) {
    positions = positions.filter((pos) => pos.collateralBranchId === collateralBranchId);
    total = positions.length;
  }

  const pageCount = Math.ceil(total / limit);

  // Server-side sorting needed when:
  // - Address query (GraphQL doesn't support our sort params)
  // - Calculated fields (need to compute values before sorting)
  // - Collateral filtering (filter after fetch, so need to re-sort and paginate)
  const needsServerSort = address || isCalculatedField(sortBy) || hasCollateralFilter;

  if (needsServerSort) {
    const btcPriceResult = sortBy === "ltv"
      ? await getBitcoinprice(new RpcProvider({ nodeUrl: env.NODE_URL }), "WWBTC" as CollateralId)
      : null;
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
        const effectiveRate = pos.batchInterestRate || pos.interestRate;
        try {
          sortValue = new Big(effectiveRate).toNumber();
        } catch {
          sortValue = null;
        }
      } else if (sortBy === "debt") {
        try {
          sortValue = new Big(pos.debt).toNumber();
        } catch {
          sortValue = null;
        }
      } else if (sortBy === "deposit") {
        try {
          sortValue = new Big(pos.deposit).toNumber();
        } catch {
          sortValue = null;
        }
      } else if (sortBy === "createdAt") {
        sortValue = pos.createdAt;
      } else if (sortBy === "updatedAt") {
        sortValue = pos.updatedAt;
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

    // Paginate after sorting (only for non-address queries, address queries return all)
    const paginatedPositions = address
      ? positionsWithCalc
      : positionsWithCalc.slice(offset, offset + limit);
    positions = paginatedPositions.map(({ _sortValue, ...pos }) => pos);
  }

  // Calculate debt-in-front for each position
  // Use effective rate (batch rate if available, otherwise individual rate)
  // Pass raw 18-decimal rates for precise comparison
  const positionsForDebtCalc = positions.map((pos) => {
    const effectiveRate = pos.batchInterestRate || pos.interestRate;
    return {
      branchId: pos.collateralBranchId,
      interestRate: new Big(effectiveRate), // Keep raw 18-decimal value
    };
  });

  const debtInFrontMap = await getDebtInFrontForPositions(positionsForDebtCalc);

  // Add debtInFront to each position
  const positionsWithDebt: IndexedTroveEntry[] = positions.map((pos) => {
    const effectiveRate = pos.batchInterestRate || pos.interestRate;
    const rateRaw = new Big(effectiveRate); // Use raw rate for key lookup
    const key = `${pos.collateralBranchId}:${rateRaw.toString()}`;
    const debtInFront = debtInFrontMap.get(key);

    return {
      ...pos,
      debtInFront: debtInFront?.toString() ?? null,
    };
  });

  const hasMore = offset + positionsWithDebt.length < total;

  return {
    positions: positionsWithDebt,
    total,
    hasMore,
    pageCount,
  };
}
