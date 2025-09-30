// Import deployment configuration
import deploymentData from "./deployment_addresses.json";
import type { Address } from "@starknet-react/chains";
import { z } from "zod";

export const INTEREST_RATE_SCALE_DOWN_FACTOR = 10n ** 16n;
export const MIN_DEBT = 200; // Minimum debt threshold in USDU
export const MAX_LIMIT = 1000000; // Maximum amount limit for UI inputs

// Contract addresses
export const USDU_ADDRESS = deploymentData.USDU as Address;
export const GAS_TOKEN_ADDRESS = deploymentData.gasToken as Address;

export const COLLATERAL_ADDRESSES = {
  UBTC: {
    collateral: deploymentData.UBTC.collateral as Address,
    addressesRegistry: deploymentData.UBTC.addressesRegistry as Address,
    borrowerOperations: deploymentData.UBTC.borrowerOperations as Address,
    troveManager: deploymentData.UBTC.troveManager as Address,
    troveNft: deploymentData.UBTC.troveNft as Address,
    stabilityPool: deploymentData.UBTC.stabilityPool as Address,
    sortedTroves: deploymentData.UBTC.sortedTroves as Address,
    activePool: deploymentData.UBTC.activePool as Address,
    defaultPool: deploymentData.UBTC.defaultPool as Address,
    collSurplusPool: deploymentData.UBTC.collSurplusPool as Address,
    gasPool: deploymentData.UBTC.gasPool as Address,
    interestRouter: deploymentData.UBTC.interestRouter as Address,
    liquidationManager: deploymentData.UBTC.liquidationManager as Address,
    redemptionManager: deploymentData.UBTC.redemptionManager as Address,
    batchManager: deploymentData.UBTC.batchManager as Address,
    priceFeed: deploymentData.UBTC.priceFeed as Address,
    hintHelpers: deploymentData.UBTC.hintHelpers as Address,
    multiTroveGetter: deploymentData.UBTC.multiTroveGetter as Address,
    troveManagerEventsEmitter: deploymentData.UBTC
      .troveManagerEventsEmitter as Address,
  },
  GBTC: {
    collateral: deploymentData.GBTC.collateral as Address,
    addressesRegistry: deploymentData.GBTC.addressesRegistry as Address,
    borrowerOperations: deploymentData.GBTC.borrowerOperations as Address,
    troveManager: deploymentData.GBTC.troveManager as Address,
    troveNft: deploymentData.GBTC.troveNft as Address,
    stabilityPool: deploymentData.GBTC.stabilityPool as Address,
    sortedTroves: deploymentData.GBTC.sortedTroves as Address,
    activePool: deploymentData.GBTC.activePool as Address,
    defaultPool: deploymentData.GBTC.defaultPool as Address,
    collSurplusPool: deploymentData.GBTC.collSurplusPool as Address,
    gasPool: deploymentData.GBTC.gasPool as Address,
    interestRouter: deploymentData.GBTC.interestRouter as Address,
    liquidationManager: deploymentData.GBTC.liquidationManager as Address,
    redemptionManager: deploymentData.GBTC.redemptionManager as Address,
    batchManager: deploymentData.GBTC.batchManager as Address,
    priceFeed: deploymentData.GBTC.priceFeed as Address,
    hintHelpers: deploymentData.GBTC.hintHelpers as Address,
    multiTroveGetter: deploymentData.GBTC.multiTroveGetter as Address,
    troveManagerEventsEmitter: deploymentData.GBTC
      .troveManagerEventsEmitter as Address,
  },
  WMWBTC: {
    collateral: deploymentData.WMWBTC.collateral as Address,
    addressesRegistry: deploymentData.WMWBTC.addressesRegistry as Address,
    borrowerOperations: deploymentData.WMWBTC.borrowerOperations as Address,
    troveManager: deploymentData.WMWBTC.troveManager as Address,
    troveNft: deploymentData.WMWBTC.troveNft as Address,
    stabilityPool: deploymentData.WMWBTC.stabilityPool as Address,
    sortedTroves: deploymentData.WMWBTC.sortedTroves as Address,
    activePool: deploymentData.WMWBTC.activePool as Address,
    defaultPool: deploymentData.WMWBTC.defaultPool as Address,
    collSurplusPool: deploymentData.WMWBTC.collSurplusPool as Address,
    gasPool: deploymentData.WMWBTC.gasPool as Address,
    interestRouter: deploymentData.WMWBTC.interestRouter as Address,
    liquidationManager: deploymentData.WMWBTC.liquidationManager as Address,
    redemptionManager: deploymentData.WMWBTC.redemptionManager as Address,
    batchManager: deploymentData.WMWBTC.batchManager as Address,
    priceFeed: deploymentData.WMWBTC.priceFeed as Address,
    hintHelpers: deploymentData.WMWBTC.hintHelpers as Address,
    multiTroveGetter: deploymentData.WMWBTC.multiTroveGetter as Address,
    troveManagerEventsEmitter: deploymentData.WMWBTC
      .troveManagerEventsEmitter as Address,
    underlyingAddress: deploymentData.WMWBTC.underlyingAddress as Address,
  },
} as const;

// Token definitions
export const UBTC_TOKEN = {
  address: COLLATERAL_ADDRESSES.UBTC.collateral,
  symbol: "UBTC",
  decimals: 18,
  icon: "/bitcoin.png",
  collateralType: "UBTC" as CollateralType,
} as const;

export const GBTC_TOKEN = {
  address: COLLATERAL_ADDRESSES.GBTC.collateral,
  symbol: "GBTC",
  decimals: 18,
  icon: "/bitcoin.png",
  collateralType: "GBTC" as CollateralType,
} as const;

export const WMWBTC_TOKEN = {
  address: COLLATERAL_ADDRESSES.WMWBTC.collateral,
  symbol: "wBTC", // User-facing name (what they hold in their wallet)
  decimals: 18, // Wrapped token is 18 decimals (used internally)
  icon: "/bitcoin.png",
  collateralType: "WMWBTC" as CollateralType, // Internal identifier for contract routing
  underlyingDecimals: 8, // Underlying token is 8 decimals
  underlyingAddress: COLLATERAL_ADDRESSES.WMWBTC.underlyingAddress,
} as const;

export const USDU_TOKEN = {
  address: USDU_ADDRESS,
  symbol: "USDU",
  decimals: 18,
  icon: "/usdu.png",
} as const;

export const STRK_TOKEN = {
  address: GAS_TOKEN_ADDRESS,
  symbol: "STRK",
  decimals: 18,
  icon: "/starknet.png",
} as const;

// Collateral types and branch mapping
export type CollateralType = "UBTC" | "GBTC" | "WMWBTC";
export type BranchId = 0 | 1 | 2;

// Zod schema for CollateralType validation (used in tRPC routers)
export const CollateralTypeSchema = z.enum(["UBTC", "GBTC", "WMWBTC"]);

// Mapping between collateral types and branch IDs
export const COLLATERAL_TO_BRANCH: Record<CollateralType, BranchId> = {
  UBTC: 0,
  GBTC: 1,
  WMWBTC: 2,
} as const;

export const BRANCH_TO_COLLATERAL: Record<BranchId, CollateralType> = {
  0: "UBTC",
  1: "GBTC",
  2: "WMWBTC",
} as const;

// Helper functions
export function getBranchId(collateralType: CollateralType): BranchId {
  return COLLATERAL_TO_BRANCH[collateralType];
}

export function getCollateralType(branchId: BranchId): CollateralType {
  return BRANCH_TO_COLLATERAL[branchId];
}

// Available collateral tokens
export const COLLATERAL_TOKENS = [UBTC_TOKEN, GBTC_TOKEN, WMWBTC_TOKEN];

// Token lookup map by address for O(1) access
export const COLLATERAL_TOKENS_BY_ADDRESS = Object.fromEntries(
  COLLATERAL_TOKENS.map((token) => [token.address, token])
) as Record<string, typeof UBTC_TOKEN | typeof GBTC_TOKEN | typeof WMWBTC_TOKEN>;

// Helper function to get contract addresses for a specific collateral type
export function getCollateralAddresses(collateralType: CollateralType) {
  return COLLATERAL_ADDRESSES[collateralType];
}

// Helper function to check if a collateral type requires wrapping
export function requiresWrapping(collateralType: CollateralType): boolean {
  return collateralType === "WMWBTC";
}

// Helper function to get the token address for balance queries
// For wrapped tokens, returns the underlying address; otherwise returns the collateral address
export function getBalanceTokenAddress(collateralType: CollateralType): Address {
  if (collateralType === "WMWBTC") {
    return WMWBTC_TOKEN.underlyingAddress;
  }
  return COLLATERAL_ADDRESSES[collateralType].collateral;
}

// Helper function to get the correct decimals for balance display
export function getBalanceDecimals(collateralType: CollateralType): number {
  if (collateralType === "WMWBTC") {
    return WMWBTC_TOKEN.underlyingDecimals;
  }
  return 18;
}
