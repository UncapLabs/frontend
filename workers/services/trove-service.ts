import { RpcProvider } from "starknet";
import {
  TROVE_BY_ID,
  TROVES_AS_BORROWER,
  TROVES_AS_PREVIOUS_OWNER,
  NEXT_OWNER_INDEX_BY_BORROWER,
} from "~/lib/graphql/documents";
import type {
  TrovesAsBorrowerQuery,
  TrovesAsPreviousOwnerQuery,
  TroveByIdQuery,
  NextOwnerIndexesByBorrowerQuery,
} from "~/lib/graphql/gql/graphql";
import type { GraphQLClient } from "graphql-request";
import {
  UBTC_TOKEN,
  GBTC_TOKEN,
  type CollateralType,
  getBranchId,
  getCollateralType,
  type BranchId,
} from "~/lib/contracts/constants";
import {
  formatBigIntToNumber,
  formatInterestRateForDisplay,
  isPrefixedTroveId,
  parsePrefixedTroveId,
} from "workers/services/utils";
import { contractRead } from "~/lib/contracts/calls";
import { DEFAULT_RETRY_OPTIONS, retryWithBackoff } from "./retry";

const USDU_DECIMALS = 18;
const MCR_VALUE = 1.1;
const CCR_VALUE = 1.5;
const TROVE_STATUS_ZOMBIE = 5n;

// Prefixed trove ID format: "branchId:troveId"
type PrefixedTroveId = string;

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
  console.log(
    `[getIndexedTrovesByAccount] Fetching troves for account: ${account}`
  );

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

  console.log(borrowerResult);

  console.log(
    `[getIndexedTrovesByAccount] Borrower troves: ${
      borrowerResult.troves?.length || 0
    }`
  );
  console.log(
    `[getIndexedTrovesByAccount] Previous owner troves: ${
      previousOwnerResult.troves?.length || 0
    }`
  );

  // Combine results from both queries
  const allTroves = [
    ...(borrowerResult.troves || []),
    ...(previousOwnerResult.troves || []),
  ];

  const result = allTroves.map((trove) => ({
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

  console.log(
    `[getIndexedTrovesByAccount] Returning ${result.length} total troves`
  );

  return result;
}

export async function fetchPositionById(
  provider: RpcProvider,
  graphqlClient: GraphQLClient,
  fullId: PrefixedTroveId | null,
  maybeIndexedTrove?: IndexedTrove
): Promise<Position | null> {
  console.log(`[fetchPositionById] Starting fetch for: ${fullId}`);

  if (!isPrefixedTroveId(fullId)) {
    console.error(`[fetchPositionById] Invalid prefixed trove ID: ${fullId}`);
    return null;
  }

  const { branchId, troveId } = parsePrefixedTroveId(fullId);
  const troveIdBigInt = BigInt(troveId);

  console.log(
    `[fetchPositionById] Parsed - branchId: ${branchId}, troveId: ${troveId}`
  );
  console.log(
    `[fetchPositionById] Indexed trove provided: ${!!maybeIndexedTrove}`
  );

  // Get the appropriate contracts based on branchId
  const collateralType = getCollateralType(Number(branchId) as BranchId);
  const collateralToken = collateralType === "UBTC" ? UBTC_TOKEN : GBTC_TOKEN;

  try {
    // Fetch indexed trove data and on-chain data in parallel
    console.log(`[fetchPositionById] Fetching on-chain data...`);

    let indexedTrove, batchManagerAddress, troveData, troveStatus;

    try {
      [indexedTrove, batchManagerAddress, troveData, troveStatus] =
        await Promise.all([
          maybeIndexedTrove ??
            getIndexedTroveById(graphqlClient, fullId).catch((err) => {
              console.warn(
                `[fetchPositionById] Failed to get indexed trove: ${err.message}`
              );
              return null;
            }),
          contractRead.borrowerOperations
            .getInterestBatchManagerOf(provider, troveIdBigInt, collateralType)
            .catch((err) => {
              console.error(
                `[fetchPositionById] Failed to get batch manager: ${err.message}`
              );
              throw err;
            }),
          contractRead.troveManager
            .getLatestTroveData(provider, troveIdBigInt, collateralType)
            .catch((err) => {
              console.error(
                `[fetchPositionById] Failed to get trove data: ${err.message}`
              );
              throw err;
            }),
          contractRead.troveManager
            .getTroveStatus(provider, troveIdBigInt, collateralType)
            .catch((err) => {
              console.error(
                `[fetchPositionById] Failed to get trove status: ${err.message}`
              );
              throw err;
            }),
        ]);
    } catch (error) {
      console.error(
        `[fetchPositionById] Failed to fetch on-chain data for ${fullId}:`,
        error
      );
      throw error; // Re-throw to allow retries
    }

    // Log if no indexed trove found, but continue with on-chain data
    if (!indexedTrove) {
      console.info(
        `[fetchPositionById] No indexed trove found for troveId: ${troveId}, using on-chain data only`
      );
    }

    console.log(`[fetchPositionById] Trove data received:`, {
      entire_debt: troveData?.entire_debt?.toString(),
      entire_coll: troveData?.entire_coll?.toString(),
      annual_interest_rate: troveData?.annual_interest_rate?.toString(),
    });

    if (
      !troveData ||
      typeof troveData.entire_coll === "undefined" ||
      typeof troveData.entire_debt === "undefined"
    ) {
      console.error(
        `[fetchPositionById] Incomplete trove data for troveId: ${troveId}`,
        troveData
      );
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

    // No longer calculating USD value - just use BTC amount

    // Calculate derived values
    const healthFactor =
      borrowedAmount > 0
        ? collateralAmount / borrowedAmount / MCR_VALUE
        : Infinity;

    const liquidationPrice =
      collateralAmount > 0
        ? (borrowedAmount * MCR_VALUE) / collateralAmount
        : 0;

    const debtLimit = collateralAmount / CCR_VALUE;
    const interestRate = formatInterestRateForDisplay(
      troveData.annual_interest_rate
    );

    // Check batch manager
    const isZeroAddress =
      batchManagerAddress === "0x0" || BigInt(batchManagerAddress) === 0n;

    // Check if zombie (for status enrichment)
    const isZombie = troveStatus === TROVE_STATUS_ZOMBIE;

    return {
      id: fullId,
      collateralAsset: collateralToken.symbol,
      collateralAmount,
      collateralValue: collateralAmount, // Using BTC amount directly
      borrowedAsset: "USDU",
      borrowedAmount,
      healthFactor,
      liquidationPrice,
      debtLimit,
      interestRate,
      status: isZombie
        ? "zombie"
        : (indexedTrove?.status as Position["status"]) ?? "active",
      batchManager: isZeroAddress ? null : batchManagerAddress,
    };
  } catch (error) {
    console.error(`Error fetching data for trove ${fullId}:`, error);
    return null;
  }
}

interface PositionWithError {
  position: Position | null;
  error?: {
    troveId: string;
    message: string;
    code?: string;
  };
}

export async function fetchLoansByAccount(
  provider: RpcProvider,
  graphqlClient: GraphQLClient,
  account: string | null | undefined
): Promise<{ positions: Position[]; errors: PositionWithError["error"][] }> {
  console.log(
    `[fetchLoansByAccountEnhanced] Starting fetch for account: ${account}`
  );

  if (!account) return { positions: [], errors: [] };

  const troves = await getIndexedTrovesByAccount(graphqlClient, account);

  console.log(
    `[fetchLoansByAccountEnhanced] Found ${troves.length} indexed troves:`,
    troves.map((t) => ({ id: t.id, status: t.status }))
  );

  // Process troves with individual error handling
  const results = await Promise.allSettled(
    troves.map(async (trove) => {
      if (!isPrefixedTroveId(trove.id)) {
        console.error(
          `[fetchLoansByAccountEnhanced] Invalid prefixed trove ID: ${trove.id}`
        );
        return {
          position: null,
          error: {
            troveId: trove.id,
            message: `Invalid prefixed trove ID: ${trove.id}`,
            code: "INVALID_TROVE_ID",
          },
        } as PositionWithError;
      }

      // Retry individual trove fetches
      const position = await retryWithBackoff(
        () => fetchPositionById(provider, graphqlClient, trove.id, trove),
        {
          ...DEFAULT_RETRY_OPTIONS,
          maxRetries: 2, // Less aggressive for individual troves
        },
        `Trove ${trove.id}`
      );

      if (!position) {
        return {
          position: null,
          error: {
            troveId: trove.id,
            message: `Failed to fetch position after retries`,
            code: "FETCH_FAILED",
          },
        } as PositionWithError;
      }

      return { position } as PositionWithError;
    })
  );

  const positions: Position[] = [];
  const errors: PositionWithError["error"][] = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      if (result.value.position) {
        positions.push(result.value.position);
      } else if (result.value.error) {
        errors.push(result.value.error);
      }
    } else {
      // Handle promise rejection
      errors.push({
        troveId: "unknown",
        message: result.reason?.message || "Unknown error",
        code: "PROMISE_REJECTED",
      });
    }
  });

  console.log(
    `[fetchLoansByAccountEnhanced] Returning ${positions.length} valid positions, ${errors.length} errors`
  );

  return { positions, errors };
}

export async function getNextOwnerIndex(
  graphqlClient: GraphQLClient,
  borrower: string,
  collateralType: CollateralType
): Promise<number> {
  const branchId = getBranchId(collateralType);

  try {
    const { borrowerinfo } =
      await graphqlClient.request<NextOwnerIndexesByBorrowerQuery>(
        NEXT_OWNER_INDEX_BY_BORROWER,
        { id: borrower.toLowerCase() }
      );

    return Number(borrowerinfo?.nextOwnerIndexes[branchId] ?? 0);
  } catch (error) {
    // If borrowerinfo doesn't exist (user has never opened a vault), return 0
    console.log(
      `No borrowerinfo found for ${borrower}, returning nextOwnerIndex: 0`
    );
    return 0;
  }
}
