import type { Address } from "@starknet-react/chains";
import Big from "big.js";
import deploymentData from "../contracts/deployment_addresses.json";
import { USDU_ADDRESS, GAS_TOKEN_ADDRESS } from "../contracts/constants";

export type CollateralId = "WMWBTC"; // | "UBTC" | "GBTC";

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
  WMWBTC: createCollateral({
    id: "WMWBTC",
    symbol: "wBTC", // User-facing name
    name: "Wrapped MWBitcoin",
    decimals: 18, // Wrapped token decimals
    icon: "/wbtc.webp",
    branchId: 0,
    minCollateralizationRatio: new Big(1.1), // 110%
    addresses: {
      token: deploymentData.WMWBTC.collateral as Address,
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
    },
    underlyingToken: {
      address: deploymentData.WMWBTC.underlyingAddress as Address,
      decimals: 8,
    },
  }),
  // UBTC: createCollateral({
  //   id: "UBTC",
  //   symbol: "UBTC",
  //   name: "Universal Bitcoin",
  //   decimals: 18,
  //   icon: "/bitcoin.png",
  //   branchId: 1,
  //   minCollateralizationRatio: new Big(1.1), // 110%
  //   addresses: {
  //     token: deploymentData.UBTC.collateral as Address,
  //     addressesRegistry: deploymentData.UBTC.addressesRegistry as Address,
  //     borrowerOperations: deploymentData.UBTC.borrowerOperations as Address,
  //     troveManager: deploymentData.UBTC.troveManager as Address,
  //     troveNft: deploymentData.UBTC.troveNft as Address,
  //     stabilityPool: deploymentData.UBTC.stabilityPool as Address,
  //     sortedTroves: deploymentData.UBTC.sortedTroves as Address,
  //     activePool: deploymentData.UBTC.activePool as Address,
  //     defaultPool: deploymentData.UBTC.defaultPool as Address,
  //     collSurplusPool: deploymentData.UBTC.collSurplusPool as Address,
  //     gasPool: deploymentData.UBTC.gasPool as Address,
  //     interestRouter: deploymentData.UBTC.interestRouter as Address,
  //     liquidationManager: deploymentData.UBTC.liquidationManager as Address,
  //     redemptionManager: deploymentData.UBTC.redemptionManager as Address,
  //     batchManager: deploymentData.UBTC.batchManager as Address,
  //     priceFeed: deploymentData.UBTC.priceFeed as Address,
  //     hintHelpers: deploymentData.UBTC.hintHelpers as Address,
  //     multiTroveGetter: deploymentData.UBTC.multiTroveGetter as Address,
  //     troveManagerEventsEmitter: deploymentData.UBTC
  //       .troveManagerEventsEmitter as Address,
  //   },
  // }),
  // GBTC: createCollateral({
  //   id: "GBTC",
  //   symbol: "GBTC",
  //   name: "Grayscale Bitcoin",
  //   decimals: 18,
  //   icon: "/starknet.png",
  //   branchId: 2,
  //   minCollateralizationRatio: new Big(1.1), // 110%
  //   addresses: {
  //     token: deploymentData.GBTC.collateral as Address,
  //     addressesRegistry: deploymentData.GBTC.addressesRegistry as Address,
  //     borrowerOperations: deploymentData.GBTC.borrowerOperations as Address,
  //     troveManager: deploymentData.GBTC.troveManager as Address,
  //     troveNft: deploymentData.GBTC.troveNft as Address,
  //     stabilityPool: deploymentData.GBTC.stabilityPool as Address,
  //     sortedTroves: deploymentData.GBTC.sortedTroves as Address,
  //     activePool: deploymentData.GBTC.activePool as Address,
  //     defaultPool: deploymentData.GBTC.defaultPool as Address,
  //     collSurplusPool: deploymentData.GBTC.collSurplusPool as Address,
  //     gasPool: deploymentData.GBTC.gasPool as Address,
  //     interestRouter: deploymentData.GBTC.interestRouter as Address,
  //     liquidationManager: deploymentData.GBTC.liquidationManager as Address,
  //     redemptionManager: deploymentData.GBTC.redemptionManager as Address,
  //     batchManager: deploymentData.GBTC.batchManager as Address,
  //     priceFeed: deploymentData.GBTC.priceFeed as Address,
  //     hintHelpers: deploymentData.GBTC.hintHelpers as Address,
  //     multiTroveGetter: deploymentData.GBTC.multiTroveGetter as Address,
  //     troveManagerEventsEmitter: deploymentData.GBTC
  //       .troveManagerEventsEmitter as Address,
  //   },
  // }),
} as const;

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
  WMWBTC: 0,
  // UBTC: 1,
  // GBTC: 2,
} as const;

export const BRANCH_TO_COLLATERAL = {
  0: "WMWBTC",
  // 1: "UBTC",
  // 2: "GBTC",
} as const;

export type BranchId = 0; // | 1 | 2;

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

// Re-export wrapping utilities from the wrapping module
export {
  requiresWrapping,
  getBalanceTokenAddress,
  getBalanceDecimals,
  generateDepositCallsFromBigint,
  generateUnwrapCallFromBigint,
} from "./wrapping";

// Export flat arrays and defaults for UI components
export const COLLATERAL_LIST = Object.values(COLLATERALS) as Collateral[];
export const DEFAULT_COLLATERAL = COLLATERALS.WMWBTC;
