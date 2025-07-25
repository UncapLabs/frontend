import { RpcProvider } from "starknet";
import {
  TROVE_BY_ID,
  TROVES_AS_BORROWER,
  TROVES_AS_PREVIOUS_OWNER,
} from "~/lib/graphql/documents";
import type {
  TrovesAsBorrowerQuery,
  TrovesAsPreviousOwnerQuery,
  TroveByIdQuery,
} from "~/lib/graphql/gql/graphql";
import type { GraphQLClient } from "graphql-request";
import {
  UBTC_TOKEN,
  GBTC_TOKEN,
  type CollateralType,
} from "~/lib/contracts/constants";
import { getBitcoinprice } from "workers/services/utils";
import { contractCall } from "~/lib/contracts/calls";

const USDU_DECIMALS = 18;
const MCR_VALUE = 1.1;
const CCR_VALUE = 1.5;
const INTEREST_RATE_SCALE_DOWN_FACTOR = 10n ** 16n;
const TROVE_STATUS_ZOMBIE = 5n;

// Prefixed trove ID format: "branchId:troveId"
type PrefixedTroveId = string;
type BranchId = string; // "0" for UBTC, "1" for GBTC

// Helper functions for prefixed trove IDs
function isPrefixedTroveId(id: string | null): id is PrefixedTroveId {
  if (!id) return false;
  const parts = id.split(":");
  return parts.length === 2 && !isNaN(Number(parts[0]));
}

function parsePrefixedTroveId(prefixedId: PrefixedTroveId): {
  branchId: BranchId;
  troveId: string;
} {
  const [branchId, troveId] = prefixedId.split(":");
  if (!branchId || !troveId) {
    throw new Error(`Invalid prefixed trove ID: ${prefixedId}`);
  }
  return { branchId, troveId };
}

function getPrefixedTroveId(
  branchId: BranchId,
  troveId: string
): PrefixedTroveId {
  return `${branchId}:${troveId}`;
}

export interface IndexedTrove {
  id: string;
  borrower: string;
  closedAt: number | null;
  createdAt: number;
  mightBeLeveraged: boolean;
  status: string;
}

export interface Position {
  id: string;
  collateralAsset: string;
  collateralAmount: number;
  collateralValue: number;
  borrowedAsset: string;
  borrowedAmount: number;
  healthFactor: number;
  liquidationPrice: number;
  debtLimit: number;
  interestRate: number;
  status: "active" | "zombie" | "closed" | "non-existent";
  batchManager: string | null;
}

const formatBigIntToNumber = (value: bigint, decimals: number): number => {
  if (decimals === 0) return Number(value);
  const factor = Math.pow(10, decimals);
  return Number(value.toString()) / factor;
};

const formatInterestRateForDisplay = (rawValue: bigint): number => {
  return Number(rawValue) / Number(INTEREST_RATE_SCALE_DOWN_FACTOR);
};

export async function getIndexedTroveById(
  graphqlClient: GraphQLClient,
  fullTroveId: string
): Promise<IndexedTrove | null> {
  const { trove } = await graphqlClient.request<TroveByIdQuery>(TROVE_BY_ID, {
    id: fullTroveId,
  });

  return !trove
    ? null
    : {
        id: trove.id,
        borrower:
          trove.status === "liquidated" && trove.previousOwner
            ? trove.previousOwner
            : trove.borrower,
        closedAt:
          trove.closedAt === null || trove.closedAt === undefined
            ? null
            : Number(trove.closedAt) * 1000,
        createdAt: Number(trove.createdAt) * 1000,
        mightBeLeveraged: trove.mightBeLeveraged || false,
        status: trove.status,
      };
}

export async function getIndexedTrovesByAccount(
  graphqlClient: GraphQLClient,
  account: string
): Promise<IndexedTrove[]> {
  // Execute both queries in parallel to get all troves associated with the account
  const [borrowerResult, previousOwnerResult] = await Promise.all([
    graphqlClient.request<TrovesAsBorrowerQuery>(TROVES_AS_BORROWER, {
      account: account.toLowerCase(),
    }),
    graphqlClient.request<TrovesAsPreviousOwnerQuery>(
      TROVES_AS_PREVIOUS_OWNER,
      {
        account: account.toLowerCase(),
      }
    ),
  ]);

  // Combine results from both queries
  const allTroves = [
    ...(borrowerResult.troves || []),
    ...(previousOwnerResult.troves || []),
  ];

  return allTroves.map((trove) => ({
    id: trove.id,
    // For liquidated troves, the borrower is the previousOwner (the account that was liquidated)
    borrower:
      trove.status === "liquidated" && trove.previousOwner
        ? trove.previousOwner
        : trove.borrower,
    closedAt:
      trove.closedAt === null || trove.closedAt === undefined
        ? null
        : Number(trove.closedAt) * 1000,
    createdAt: Number(trove.createdAt) * 1000,
    mightBeLeveraged: trove.mightBeLeveraged || false,
    status: trove.status,
  }));
}

export async function fetchPositionById(
  provider: RpcProvider,
  graphqlClient: GraphQLClient,
  fullId: PrefixedTroveId | null,
  maybeIndexedTrove?: IndexedTrove
): Promise<Position | null> {
  if (!isPrefixedTroveId(fullId)) return null;

  const { branchId, troveId } = parsePrefixedTroveId(fullId);
  const troveIdBigInt = BigInt(troveId);

  // Get the appropriate contracts based on branchId
  const collateralType: CollateralType = branchId === "0" ? "UBTC" : "GBTC";
  const collateralToken = branchId === "0" ? UBTC_TOKEN : GBTC_TOKEN;

  try {
    const bitcoinPrice = await getBitcoinprice();

    // Prepare contract calls using the calls abstraction
    const batchManagerCall =
      contractCall.borrowerOperations.interestBatchManagerOf(
        troveIdBigInt,
        collateralType
      );
    const troveDataCall = contractCall.troveManager.getLatestTroveData(
      troveIdBigInt,
      collateralType
    );
    const troveStatusCall = contractCall.troveManager.getTroveStatus(
      troveIdBigInt,
      collateralType
    );

    // Fetch indexed trove data and on-chain data in parallel
    const [indexedTrove, [batchManager, latestTroveData, troveStatus]] =
      await Promise.all([
        maybeIndexedTrove ?? getIndexedTroveById(graphqlClient, fullId),
        Promise.all([
          provider.callContract(batchManagerCall),
          provider.callContract(troveDataCall),
          provider.callContract(troveStatusCall),
        ]),
      ]);

    if (!indexedTrove) {
      console.warn(`No indexed trove found for troveId: ${troveId}`);
      return null;
    }

    // Parse the contract call responses
    const batchManagerAddress = batchManager[0];
    
    // Parse u256 values from the raw data
    // Each u256 is represented as two fields (low, high)
    // According to the ABI, LatestTroveData struct has fields in this order:
    // 1. entire_debt (u256) - indices 0,1
    // 2. entire_coll (u256) - indices 2,3
    // 3. annual_interest_rate (u256) - indices 4,5
    // 4. weighted_recorded_debt (u256) - indices 6,7
    // 5. pending_interest (u256) - indices 8,9
    // 6. accrued_interest (u256) - indices 10,11
    // 7. accrued_interest_borrow_fee (u256) - indices 12,13
    // 8. accrued_batch_management_fee (u256) - indices 14,15
    // 9. accrued_interest_router_fee (u256) - indices 16,17
    // 10. last_interest_rate_adj_time (u64) - index 18
    
    const parseU256 = (low: string, high: string): bigint => {
      return BigInt(low) + (BigInt(high) << 128n);
    };
    
    const troveData = {
      entire_debt: parseU256(latestTroveData[0], latestTroveData[1]),
      entire_coll: parseU256(latestTroveData[2], latestTroveData[3]),
      annual_interest_rate: parseU256(latestTroveData[4], latestTroveData[5]),
    };

    if (
      !troveData ||
      typeof troveData.entire_coll === "undefined" ||
      typeof troveData.entire_debt === "undefined"
    ) {
      console.warn(`Incomplete trove data for troveId: ${troveId}`);
      return null;
    }

    // Extract values
    const collateralAmount = formatBigIntToNumber(
      troveData.entire_coll,
      collateralToken.decimals
    );
    const borrowedAmount = formatBigIntToNumber(
      troveData.entire_debt,
      USDU_DECIMALS
    );

    // Calculate Bitcoin price (handle Starknet format)
    const bitcoinPriceNumber =
      Number(bitcoinPrice?.[0] || bitcoinPrice || 0) / 1e18;
    const collateralValue = collateralAmount * bitcoinPriceNumber;

    // Calculate derived values
    const healthFactor =
      borrowedAmount > 0
        ? collateralValue / borrowedAmount / MCR_VALUE
        : Infinity;

    const liquidationPrice =
      collateralAmount > 0
        ? (borrowedAmount * MCR_VALUE) / collateralAmount
        : 0;

    const debtLimit = collateralValue / CCR_VALUE;
    const interestRate = formatInterestRateForDisplay(
      troveData.annual_interest_rate
    );

    // Check batch manager
    const isZeroAddress =
      batchManagerAddress === "0x0" || BigInt(batchManagerAddress) === 0n;

    // Check if zombie (for status enrichment)
    // troveStatus is returned as an array from callContract
    const onChainStatusValue = BigInt(troveStatus[0] || 0);
    const isZombie = onChainStatusValue === TROVE_STATUS_ZOMBIE;

    return {
      id: fullId,
      collateralAsset: collateralToken.symbol,
      collateralAmount,
      collateralValue,
      borrowedAsset: "USDU",
      borrowedAmount,
      healthFactor,
      liquidationPrice,
      debtLimit,
      interestRate,
      status: isZombie ? "zombie" : (indexedTrove.status as Position["status"]),
      batchManager: isZeroAddress ? null : batchManagerAddress,
    };
  } catch (error) {
    console.error(`Error fetching data for trove ${fullId}:`, error);
    return null;
  }
}

export async function fetchLoansByAccount(
  provider: RpcProvider,
  graphqlClient: GraphQLClient,
  account: string | null | undefined
): Promise<Position[]> {
  if (!account) return [];

  const troves = await getIndexedTrovesByAccount(graphqlClient, account);

  const results = await Promise.all(
    troves.map((trove) => {
      if (!isPrefixedTroveId(trove.id)) {
        throw new Error(`Invalid prefixed trove ID: ${trove.id}`);
      }
      return fetchPositionById(provider, graphqlClient, trove.id, trove);
    })
  );

  return results.filter((result): result is Position => result !== null);
}
