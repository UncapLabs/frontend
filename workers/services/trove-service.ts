import { RpcProvider, CairoCustomEnum } from "starknet";
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
  type CollateralId,
  getBranchIdForCollateral,
  getCollateral,
  getCollateralByBranchId,
  COLLATERALS,
  TOKENS,
} from "~/lib/collateral";
import {
  isPrefixedTroveId,
  parsePrefixedTroveId,
} from "workers/services/utils";
import { contractRead } from "~/lib/contracts/calls";
import { DEFAULT_RETRY_OPTIONS, retryWithBackoff } from "./retry";
import Big from "big.js";
import { bigintToBig } from "~/lib/decimal";

// Prefixed trove ID format: "branchId:troveId"
type PrefixedTroveId = string;

// Map contract status to our frontend status
function mapTroveStatus(status: any): Position["status"] {
  // Status comes as a CairoCustomEnum, we need to find which variant is active
  // The active variant is the one that doesn't have undefined value

  let activeVariant: string | null = null;

  // Check if status has the expected structure
  if (status && status.variant) {
    // Find the variant that has a non-undefined value
    for (const [key, value] of Object.entries(status.variant)) {
      if (value !== undefined) {
        activeVariant = key;
        break;
      }
    }
  } else if (status instanceof CairoCustomEnum) {
    // Try using the activeVariant method if it's already a CairoCustomEnum
    try {
      activeVariant = status.activeVariant();
    } catch (e) {
      console.warn("Failed to get active variant from CairoCustomEnum:", e);
    }
  }

  switch (activeVariant) {
    case "NonExistent":
      return "non-existent";
    case "Active":
      return "active";
    case "ClosedByOwner":
      return "closed";
    case "ClosedByLiquidation":
      return "liquidated";
    case "Zombie":
      // Zombie status in contract maps to "redeemed" in frontend
      // Frontend determines zombie state by checking debt < MIN_DEBT
      return "redeemed";
    default:
      console.warn(
        `Unknown trove status: ${activeVariant}, raw status:`,
        status
      );
      return "non-existent";
  }
}

export interface IndexedTrove {
  id: string;
  borrower: string;
  closedAt: number | null;
  createdAt: number;
  mightBeLeveraged: boolean;
  status: string;
  redemptionCount?: number;
  redeemedColl?: string;
  redeemedDebt?: string;
}

export interface Position {
  id: string;
  collateralAsset: string;
  collateralAmount: Big;
  collateralValue: Big;
  borrowedAsset: string;
  borrowedAmount: Big;
  redemptionCount: number;
  redeemedColl: Big;
  redeemedDebt: Big;
  interestRate: Big;
  liquidationPrice: Big;
  status: "active" | "closed" | "non-existent" | "liquidated" | "redeemed";
  batchManager: string | null;
  lastInterestRateAdjTime: number; // Unix timestamp in seconds
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
        redemptionCount: trove.redemptionCount || 0,
        redeemedColl: trove.redeemedColl || "0",
        redeemedDebt: trove.redeemedDebt || "0",
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
    redemptionCount: trove.redemptionCount || 0,
    redeemedColl: trove.redeemedColl || "0",
    redeemedDebt: trove.redeemedDebt || "0",
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
  if (!isPrefixedTroveId(fullId)) {
    console.error(`[fetchPositionById] Invalid prefixed trove ID: ${fullId}`);
    return null;
  }

  const { branchId, troveId } = parsePrefixedTroveId(fullId);
  const troveIdBigInt = BigInt(troveId);

  // Get the appropriate contracts based on branchId
  const collateralToken = getCollateralByBranchId(Number(branchId))!;
  const collateralId = collateralToken.id;

  try {
    // Fetch indexed trove data and on-chain data in parallel
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
            .getInterestBatchManagerOf(provider, troveIdBigInt, collateralId)
            .catch((err) => {
              console.error(
                `[fetchPositionById] Failed to get batch manager: ${err.message}`
              );
              throw err;
            }),
          contractRead.troveManager
            .getLatestTroveData(provider, troveIdBigInt, collateralId)
            .catch((err) => {
              console.error(
                `[fetchPositionById] Failed to get trove data: ${err.message}`
              );
              throw err;
            }),
          contractRead.troveManager
            .getTroveStatus(provider, troveIdBigInt, collateralId)
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

    // Extract values using Big for precision
    const collateralAmount = bigintToBig(
      troveData.entire_coll,
      collateralToken.decimals
    );
    const borrowedAmount = bigintToBig(
      troveData.entire_debt,
      TOKENS.USDU.decimals
    );

    // Convert interest rate from bigint (18 decimals) to percentage
    // The value is stored with 18 decimals, but represents a rate like 0.05 for 5%
    // So we need to scale down by 16 to get the percentage value (5.0 instead of 0.05)
    const interestRateDecimal = bigintToBig(troveData.annual_interest_rate, 18);
    const interestRate = interestRateDecimal.times(100); // Convert to percentage

    // Check batch manager
    const isZeroAddress =
      batchManagerAddress === "0x0" || BigInt(batchManagerAddress) === 0n;

    // Get collateral decimals for conversion
    const collDecimals = collateralToken.decimals;

    // Calculate liquidation price using Big
    const collateral = getCollateral(collateralId);
    const minCollateralizationRatio = collateral.minCollateralizationRatio;
    const liquidationPrice =
      collateralAmount.gt(0) && borrowedAmount.gt(0)
        ? borrowedAmount.times(minCollateralizationRatio).div(collateralAmount)
        : new Big(0);

    return {
      id: fullId,
      collateralAsset: collateralToken.symbol,
      collateralAmount,
      collateralValue: collateralAmount, // Using BTC amount directly
      borrowedAsset: "USDU",
      borrowedAmount,
      redemptionCount: indexedTrove?.redemptionCount ?? 0,
      redeemedColl: indexedTrove?.redeemedColl
        ? bigintToBig(BigInt(indexedTrove.redeemedColl), collDecimals)
        : new Big(0),
      redeemedDebt: indexedTrove?.redeemedDebt
        ? bigintToBig(BigInt(indexedTrove.redeemedDebt), TOKENS.USDU.decimals)
        : new Big(0),
      interestRate,
      liquidationPrice,
      status: mapTroveStatus(troveStatus),
      batchManager: isZeroAddress ? null : batchManagerAddress,
      lastInterestRateAdjTime: Number(troveData.last_interest_rate_adj_time),
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
  if (!account) return { positions: [], errors: [] };

  const troves = await getIndexedTrovesByAccount(graphqlClient, account);

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
  collateralType: CollateralId
): Promise<number> {
  const branchId = getBranchIdForCollateral(collateralType);

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
      `No borrowerinfo found for ${borrower}, returning nextOwnerIndex: 0. Error: ${error}`
    );
    return 0;
  }
}

export async function getCollateralSurplus(
  provider: RpcProvider,
  borrower: string
): Promise<{
  UBTC: Big;
  GBTC: Big;
  WMWBTC: Big;
}> {
  try {
    // Fetch surplus for all collateral types in parallel
    const [ubtcSurplusRaw, gbtcSurplusRaw, wmwbtcSurplusRaw] =
      await Promise.all([
        contractRead.collSurplusPool.getCollateral(provider, borrower, "UBTC"),
        contractRead.collSurplusPool.getCollateral(provider, borrower, "GBTC"),
        contractRead.collSurplusPool.getCollateral(
          provider,
          borrower,
          "WMWBTC"
        ),
      ]);

    // Convert from blockchain integers to human-readable Big decimals
    return {
      UBTC: bigintToBig(ubtcSurplusRaw, COLLATERALS.UBTC.decimals),
      GBTC: bigintToBig(gbtcSurplusRaw, COLLATERALS.GBTC.decimals),
      WMWBTC: bigintToBig(wmwbtcSurplusRaw, COLLATERALS.WMWBTC.decimals),
    };
  } catch (error) {
    console.error(`Error fetching collateral surplus for ${borrower}:`, error);
    return {
      UBTC: new Big(0),
      GBTC: new Big(0),
      WMWBTC: new Big(0),
    };
  }
}
