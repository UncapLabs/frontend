// Import deployment configuration
import deploymentData from "./deployment_addresses.json";
import type { Address } from "@starknet-react/chains";

export const INTEREST_RATE_SCALE_DOWN_FACTOR = 10n ** 16n;

// Collateral types and branch mapping
export type CollateralType = "UBTC" | "GBTC";
export type BranchId = 0 | 1;

// Mapping between collateral types and branch IDs
export const COLLATERAL_TO_BRANCH: Record<CollateralType, BranchId> = {
  UBTC: 0,
  GBTC: 1,
} as const;

export const BRANCH_TO_COLLATERAL: Record<BranchId, CollateralType> = {
  0: "UBTC",
  1: "GBTC",
} as const;

// Helper functions
export function getBranchId(collateralType: CollateralType): BranchId {
  return COLLATERAL_TO_BRANCH[collateralType];
}

export function getCollateralType(branchId: BranchId): CollateralType {
  return BRANCH_TO_COLLATERAL[branchId];
}

// Contract addresses by collateral type
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
    troveManagerEventsEmitter: deploymentData.UBTC.troveManagerEventsEmitter as Address,
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
    troveManagerEventsEmitter: deploymentData.GBTC.troveManagerEventsEmitter as Address,
  },
} as const;

// Global addresses (same for all collaterals)
export const USDU_ADDRESS = deploymentData.USDU as Address;
export const GAS_TOKEN_ADDRESS = deploymentData.gasToken as Address;
export const COLLATERAL_REGISTRY_ADDRESS = deploymentData.collateralRegistry as Address;

export const USDU_DECIMALS = 18;
export const USDU_SYMBOL = "USDU";
export const MIN_DEBT = 2000; // Minimum debt threshold in USDU

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

export const USDU_TOKEN = {
  address: USDU_ADDRESS,
  symbol: "USDU",
  decimals: 18,
  icon: "/usdu.png",
} as const;

// Available collateral tokens
export const COLLATERAL_TOKENS = [UBTC_TOKEN, GBTC_TOKEN];

// Token lookup map by address for O(1) access
export const COLLATERAL_TOKENS_BY_ADDRESS = Object.fromEntries(
  COLLATERAL_TOKENS.map((token) => [token.address, token])
) as Record<string, typeof UBTC_TOKEN | typeof GBTC_TOKEN>;

// Helper function to get contract addresses for a specific collateral type
export function getCollateralAddresses(collateralType: CollateralType) {
  return COLLATERAL_ADDRESSES[collateralType];
}
