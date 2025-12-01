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

const CACHE_KEY = "protocol-stats";
const CACHE_TTL = 30 * 60; // 30 minutes

export const ALL_POSITIONS_PAGE_SIZE = 25;

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

/**
 * Fetches all positions (troves) from the indexer with pagination
 */
export async function getAllPositions(
  env: Env,
  options: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}
): Promise<AllPositionsResult> {
  const {
    limit = ALL_POSITIONS_PAGE_SIZE,
    offset = 0,
    status = "active",
  } = options;

  const graphqlEndpoint = env.GRAPHQL_ENDPOINT;
  const graphqlClient = createGraphQLClient(graphqlEndpoint);
  const indexer = process.env.NETWORK || "sepolia";

  // Fetch troves and count in parallel
  const [trovesResult, countResult] = await Promise.all([
    graphqlClient.request<AllTrovesQuery>(ALL_TROVES, {
      indexer,
      first: limit,
      skip: offset,
      status,
    }),
    graphqlClient.request<TrovesCountQuery>(TROVES_COUNT, {
      indexer,
      status,
    }),
  ]);

  const troves = trovesResult.troves || [];
  const total = countResult.troves?.length || 0;
  const pageCount = Math.ceil(total / limit);
  const hasMore = offset + troves.length < total;

  // Map troves to our IndexedTroveEntry format
  const positions: IndexedTroveEntry[] = troves.map((trove) => {
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
    };
  });

  return {
    positions,
    total,
    hasMore,
    pageCount,
  };
}
