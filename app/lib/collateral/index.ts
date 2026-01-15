import type { Address } from "@starknet-react/chains";
import Big from "big.js";
import { z } from "zod";
import deploymentData from "../contracts/deployment_addresses";
import { USDU_ADDRESS, GAS_TOKEN_ADDRESS } from "../contracts/constants";

// CollateralId type
export type CollateralId = "WWBTC" | "TBTC" | "SOLVBTC";

// Base Token type - can be used for any token (collateral, stablecoin, etc.)
export interface Token {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
}

// Collateral-specific addresses
export interface CollateralAddresses {
  token: Address;
  addressesRegistry: Address;
  borrowerOperations: Address;
  troveManager: Address;
  troveNft: Address;
  stabilityPool: Address;
  sortedTroves: Address;
  activePool: Address;
  defaultPool: Address;
  collSurplusPool: Address;
  gasPool: Address;
  interestRouter: Address;
  liquidationManager: Address;
  redemptionManager: Address;
  batchManager: Address;
  priceFeed: Address;
  hintHelpers: Address;
  multiTroveGetter: Address;
  troveManagerEventsEmitter: Address;
}

export interface UnderlyingToken {
  address: Address;
  decimals: number;
}

// Collateral extends Token with additional properties
export interface Collateral extends Omit<Token, "address"> {
  id: CollateralId;
  branchId: number;
  minCollateralizationRatio: Big;
  addresses: CollateralAddresses;
  underlyingToken?: UnderlyingToken;
  defaultInterestManager?: Address;
  // Helper to get the token address for compatibility
  get address(): Address;
}

// Helper function to create a Collateral object with getter
function createCollateral(config: Omit<Collateral, "address">): Collateral {
  return {
    ...config,
    get address() {
      return this.addresses.token;
    },
  };
}

// Main collateral definitions
export const COLLATERALS = {
  WWBTC: createCollateral({
    id: "WWBTC",
    symbol: "WBTC", // User-facing name
    name: "Wrapped Bitcoin",
    decimals: 18, // Wrapped token decimals
    icon: "/wbtc.png",
    branchId: 0,
    minCollateralizationRatio: new Big(1.15), // 115%
    addresses: {
      token: deploymentData.WWBTC.collateral as Address,
      addressesRegistry: deploymentData.WWBTC.addressesRegistry as Address,
      borrowerOperations: deploymentData.WWBTC.borrowerOperations as Address,
      troveManager: deploymentData.WWBTC.troveManager as Address,
      troveNft: deploymentData.WWBTC.troveNft as Address,
      stabilityPool: deploymentData.WWBTC.stabilityPool as Address,
      sortedTroves: deploymentData.WWBTC.sortedTroves as Address,
      activePool: deploymentData.WWBTC.activePool as Address,
      defaultPool: deploymentData.WWBTC.defaultPool as Address,
      collSurplusPool: deploymentData.WWBTC.collSurplusPool as Address,
      gasPool: deploymentData.WWBTC.gasPool as Address,
      interestRouter: deploymentData.WWBTC.interestRouter as Address,
      liquidationManager: deploymentData.WWBTC.liquidationManager as Address,
      redemptionManager: deploymentData.WWBTC.redemptionManager as Address,
      batchManager: deploymentData.WWBTC.batchManager as Address,
      priceFeed: deploymentData.WWBTC.priceFeed as Address,
      hintHelpers: deploymentData.WWBTC.hintHelpers as Address,
      multiTroveGetter: deploymentData.WWBTC.multiTroveGetter as Address,
      troveManagerEventsEmitter: deploymentData.WWBTC
        .troveManagerEventsEmitter as Address,
    },
    defaultInterestManager: deploymentData.WWBTC
      .defaultInterestManager as Address,
    underlyingToken: {
      address: deploymentData.WWBTC.underlyingAddress as Address,
      decimals: 8,
    },
  }),
  TBTC: createCollateral({
    id: "TBTC",
    symbol: "tBTC",
    name: "tBTC",
    decimals: 18,
    icon: "/tbtc.webp",
    branchId: 1,
    minCollateralizationRatio: new Big(1.25), // 125%
    addresses: {
      token: deploymentData.TBTC.collateral as Address,
      addressesRegistry: deploymentData.TBTC.addressesRegistry as Address,
      borrowerOperations: deploymentData.TBTC.borrowerOperations as Address,
      troveManager: deploymentData.TBTC.troveManager as Address,
      troveNft: deploymentData.TBTC.troveNft as Address,
      stabilityPool: deploymentData.TBTC.stabilityPool as Address,
      sortedTroves: deploymentData.TBTC.sortedTroves as Address,
      activePool: deploymentData.TBTC.activePool as Address,
      defaultPool: deploymentData.TBTC.defaultPool as Address,
      collSurplusPool: deploymentData.TBTC.collSurplusPool as Address,
      gasPool: deploymentData.TBTC.gasPool as Address,
      interestRouter: deploymentData.TBTC.interestRouter as Address,
      liquidationManager: deploymentData.TBTC.liquidationManager as Address,
      redemptionManager: deploymentData.TBTC.redemptionManager as Address,
      batchManager: deploymentData.TBTC.batchManager as Address,
      priceFeed: deploymentData.TBTC.priceFeed as Address,
      hintHelpers: deploymentData.TBTC.hintHelpers as Address,
      multiTroveGetter: deploymentData.TBTC.multiTroveGetter as Address,
      troveManagerEventsEmitter: deploymentData.TBTC
        .troveManagerEventsEmitter as Address,
    },
    defaultInterestManager: deploymentData.TBTC
      .defaultInterestManager as Address,
  }),
  SOLVBTC: createCollateral({
    id: "SOLVBTC",
    symbol: "SolvBTC",
    name: "Solv BTC",
    decimals: 18,
    icon: "/SolvBTC.png",
    branchId: 2,
    minCollateralizationRatio: new Big(1.25), // 125%
    addresses: {
      token: deploymentData.SOLVBTC.collateral as Address,
      addressesRegistry: deploymentData.SOLVBTC.addressesRegistry as Address,
      borrowerOperations: deploymentData.SOLVBTC.borrowerOperations as Address,
      troveManager: deploymentData.SOLVBTC.troveManager as Address,
      troveNft: deploymentData.SOLVBTC.troveNft as Address,
      stabilityPool: deploymentData.SOLVBTC.stabilityPool as Address,
      sortedTroves: deploymentData.SOLVBTC.sortedTroves as Address,
      activePool: deploymentData.SOLVBTC.activePool as Address,
      defaultPool: deploymentData.SOLVBTC.defaultPool as Address,
      collSurplusPool: deploymentData.SOLVBTC.collSurplusPool as Address,
      gasPool: deploymentData.SOLVBTC.gasPool as Address,
      interestRouter: deploymentData.SOLVBTC.interestRouter as Address,
      liquidationManager: deploymentData.SOLVBTC.liquidationManager as Address,
      redemptionManager: deploymentData.SOLVBTC.redemptionManager as Address,
      batchManager: deploymentData.SOLVBTC.batchManager as Address,
      priceFeed: deploymentData.SOLVBTC.priceFeed as Address,
      hintHelpers: deploymentData.SOLVBTC.hintHelpers as Address,
      multiTroveGetter: deploymentData.SOLVBTC.multiTroveGetter as Address,
      troveManagerEventsEmitter: deploymentData.SOLVBTC
        .troveManagerEventsEmitter as Address,
    },
    defaultInterestManager: deploymentData.SOLVBTC
      .defaultInterestManager as Address,
  }),
} as const;

// Create Zod schema dynamically from COLLATERALS for backend validation
// This ensures schema stays in sync with COLLATERALS automatically
export const CollateralIdSchema = z.enum(
  Object.keys(COLLATERALS) as [CollateralId, ...CollateralId[]]
);

// Non-collateral tokens (USDU, STRK, etc.)
export const TOKENS = {
  USDU: {
    address: USDU_ADDRESS,
    symbol: "USDU",
    name: "USDU Stablecoin",
    decimals: 18,
    icon: "/usdu.png",
  } as Token,
  STRK: {
    address: GAS_TOKEN_ADDRESS,
    symbol: "STRK",
    name: "Starknet Token",
    decimals: 18,
    icon: "/starknet.png",
  } as Token,
} as const;

// Branch ID mappings (for contract interactions)
export const COLLATERAL_TO_BRANCH = {
  WWBTC: 0,
  TBTC: 1,
  SOLVBTC: 2,
} as const;

export const BRANCH_TO_COLLATERAL = {
  0: "WWBTC",
  1: "TBTC",
  2: "SOLVBTC",
} as const;

export type BranchId = 0 | 1 | 2;

// Helper functions
export function getCollateral(id: CollateralId): Collateral {
  return COLLATERALS[id];
}

export function getBranchIdForCollateral(id: CollateralId): number {
  return COLLATERALS[id].branchId;
}

// Alias for consistency with constants.ts (to be deprecated)
export function getBranchId(collateralId: CollateralId): BranchId {
  return COLLATERAL_TO_BRANCH[collateralId];
}

export function getCollateralByBranchId(
  branchId: number
): Collateral | undefined {
  return Object.values(COLLATERALS).find(
    (c: Collateral) => c.branchId === branchId
  );
}

export function getCollateralByAddress(
  address: string
): Collateral | undefined {
  return Object.values(COLLATERALS).find(
    (c: Collateral) => c.addresses.token.toLowerCase() === address.toLowerCase()
  );
}

// Get all addresses for a specific collateral (helper for contract calls)
export function getCollateralAddresses(collateralId: CollateralId) {
  return COLLATERALS[collateralId].addresses;
}

// Export flat arrays and defaults for UI components
export const COLLATERAL_LIST = Object.values(COLLATERALS) as Collateral[];
export const DEFAULT_COLLATERAL = COLLATERALS.WWBTC;
