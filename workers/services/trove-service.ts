import { RpcProvider, Contract, type GetTransactionReceiptResponse } from "starknet";
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
  getCollateralAddresses,
} from "~/lib/contracts/constants";
import {
  formatBigIntToNumber,
  formatInterestRateForDisplay,
  getBitcoinprice,
  isPrefixedTroveId,
  parsePrefixedTroveId,
} from "workers/services/utils";
import { contractRead } from "~/lib/contracts/calls";
import TroveManagerEventsEmitterAbi from "~/lib/contracts/abis/TroveManagerEventsEmitter.json";

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
  console.log(`[getIndexedTrovesByAccount] Fetching troves for account: ${account}`);
  
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

  console.log(`[getIndexedTrovesByAccount] Borrower troves: ${borrowerResult.troves?.length || 0}`);
  console.log(`[getIndexedTrovesByAccount] Previous owner troves: ${previousOwnerResult.troves?.length || 0}`);

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
  
  console.log(`[getIndexedTrovesByAccount] Returning ${result.length} total troves`);
  
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
  
  console.log(`[fetchPositionById] Parsed - branchId: ${branchId}, troveId: ${troveId}`);
  console.log(`[fetchPositionById] Indexed trove provided: ${!!maybeIndexedTrove}`);

  // Get the appropriate contracts based on branchId
  const collateralType = getCollateralType(Number(branchId) as BranchId);
  const collateralToken = collateralType === "UBTC" ? UBTC_TOKEN : GBTC_TOKEN;

  try {
    const bitcoinPrice = await getBitcoinprice();

    // Fetch indexed trove data and on-chain data in parallel
    console.log(`[fetchPositionById] Fetching on-chain data...`);
    
    let indexedTrove, batchManagerAddress, troveData, troveStatus;
    
    try {
      [indexedTrove, batchManagerAddress, troveData, troveStatus] =
        await Promise.all([
          maybeIndexedTrove ?? getIndexedTroveById(graphqlClient, fullId).catch(err => {
            console.warn(`[fetchPositionById] Failed to get indexed trove: ${err.message}`);
            return null;
          }),
          contractRead.borrowerOperations.getInterestBatchManagerOf(
            provider,
            troveIdBigInt,
            collateralType
          ).catch(err => {
            console.error(`[fetchPositionById] Failed to get batch manager: ${err.message}`);
            throw err;
          }),
          contractRead.troveManager.getLatestTroveData(
            provider,
            troveIdBigInt,
            collateralType
          ).catch(err => {
            console.error(`[fetchPositionById] Failed to get trove data: ${err.message}`);
            throw err;
          }),
          contractRead.troveManager.getTroveStatus(
            provider,
            troveIdBigInt,
            collateralType
          ).catch(err => {
            console.error(`[fetchPositionById] Failed to get trove status: ${err.message}`);
            throw err;
          }),
        ]);
    } catch (error) {
      console.error(`[fetchPositionById] Failed to fetch on-chain data for ${fullId}:`, error);
      return null;
    }

    // Log if no indexed trove found, but continue with on-chain data
    if (!indexedTrove) {
      console.info(`[fetchPositionById] No indexed trove found for troveId: ${troveId}, using on-chain data only`);
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
      console.error(`[fetchPositionById] Incomplete trove data for troveId: ${troveId}`, troveData);
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
    const isZombie = troveStatus === TROVE_STATUS_ZOMBIE;

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
      status: isZombie ? "zombie" : (indexedTrove?.status as Position["status"] ?? "active"),
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
  console.log(`[fetchLoansByAccount] Starting fetch for account: ${account}`);
  
  if (!account) return [];

  const troves = await getIndexedTrovesByAccount(graphqlClient, account);
  
  console.log(`[fetchLoansByAccount] Found ${troves.length} indexed troves:`, 
    troves.map(t => ({ id: t.id, status: t.status }))
  );

  const results = await Promise.all(
    troves.map((trove) => {
      if (!isPrefixedTroveId(trove.id)) {
        console.error(`[fetchLoansByAccount] Invalid prefixed trove ID: ${trove.id}`);
        throw new Error(`Invalid prefixed trove ID: ${trove.id}`);
      }
      return fetchPositionById(provider, graphqlClient, trove.id, trove);
    })
  );
  
  const validResults = results.filter((result): result is Position => result !== null);
  
  console.log(`[fetchLoansByAccount] Returning ${validResults.length} valid positions out of ${results.length} total`);
  
  return validResults;
}

export async function getNextOwnerIndex(
  graphqlClient: GraphQLClient,
  borrower: string,
  collateralType: CollateralType
): Promise<number> {
  const branchId = getBranchId(collateralType);

  const { borrowerinfo } =
    await graphqlClient.request<NextOwnerIndexesByBorrowerQuery>(
      NEXT_OWNER_INDEX_BY_BORROWER,
      { id: borrower.toLowerCase() }
    );

  return Number(borrowerinfo?.nextOwnerIndexes[branchId] ?? 0);
}

/**
 * Parse TroveOperation events from a transaction receipt to extract trove IDs
 * @param receipt The transaction receipt
 * @param collateralType The collateral type for the trove
 * @returns Array of prefixed trove IDs found in the events
 */
export function parseTroveOperationEvents(
  receipt: GetTransactionReceiptResponse,
  collateralType: CollateralType
): string[] {
  const troveIds: string[] = [];
  
  try {
    // Get the TroveManagerEventsEmitter contract address for this collateral type
    const addresses = getCollateralAddresses(collateralType);
    const branchId = getBranchId(collateralType);
    
    // Create contract instance to parse events
    const contract = new Contract(
      TroveManagerEventsEmitterAbi,
      addresses.troveManagerEventsEmitter,
      {} as any // Provider not needed for event parsing
    );
    
    // Parse events from the receipt
    const events = contract.parseEvents(receipt);
    
    // Look for TroveOperation events
    for (const event of events) {
      if (event.TroveOperation) {
        const troveId = event.TroveOperation.trove_id;
        if (troveId) {
          // Convert BigInt to hex string and create prefixed ID
          const troveIdHex = `0x${troveId.toString(16)}`;
          const prefixedId = `${branchId}:${troveIdHex}`;
          troveIds.push(prefixedId);
        }
      }
    }
  } catch (error) {
    console.error("Error parsing TroveOperation events:", error);
  }
  
  return [...new Set(troveIds)]; // Remove duplicates
}
