import type { Abi } from "starknet";

// Import all ABI JSON files
import ActivePoolAbi from "./abis/ActivePool.json";
import AddressesRegistryAbi from "./abis/AddressesRegistry.json";
import BatchManagerAbi from "./abis/BatchManager.json";
import BorrowerOperationsAbi from "./abis/BorrowerOperations.json";
import CollSurplusPoolAbi from "./abis/CollSurplusPool.json";
import CollateralRegistryAbi from "./abis/CollateralRegistry.json";
import DefaultPoolAbi from "./abis/DefaultPool.json";
import GasPoolAbi from "./abis/GasPool.json";
import HintHelpersAbi from "./abis/HintHelpers.json";
import InterestRouterMockAbi from "./abis/InterestRouterMock.json";
import LiquidationManagerAbi from "./abis/LiquidationManager.json";
import PriceFeedAbi from "./abis/PriceFeed.json";
import RedemptionManagerAbi from "./abis/RedemptionManager.json";
import SortedTrovesAbi from "./abis/SortedTroves.json";
import StabilityPoolAbi from "./abis/StabilityPool.json";
import TroveManagerEventsEmitterAbi from "./abis/TroveManagerEventsEmitter.json";
import TroveManagerAbi from "./abis/TroveManager.json";
import TroveNFTAbi from "./abis/TroveNFT.json";
import UBTCAbi from "./abis/UBTC.json";
import USDUAbi from "./abis/USDU.json";

// Export all ABIs with proper typing
export const ACTIVE_POOL_ABI = ActivePoolAbi as Abi;
export const ADDRESSES_REGISTRY_ABI = AddressesRegistryAbi as Abi;
export const BATCH_MANAGER_ABI = BatchManagerAbi as Abi;
export const BORROWER_OPERATIONS_ABI = BorrowerOperationsAbi as Abi;
export const COLL_SURPLUS_POOL_ABI = CollSurplusPoolAbi as Abi;
export const COLLATERAL_REGISTRY_ABI = CollateralRegistryAbi as Abi;
export const DEFAULT_POOL_ABI = DefaultPoolAbi as Abi;
export const GAS_POOL_ABI = GasPoolAbi as Abi;
export const HINT_HELPERS_ABI = HintHelpersAbi as Abi;
export const INTEREST_ROUTER_MOCK_ABI = InterestRouterMockAbi as Abi;
export const LIQUIDATION_MANAGER_ABI = LiquidationManagerAbi as Abi;
export const PRICE_FEED_ABI = PriceFeedAbi as Abi;
export const REDEMPTION_MANAGER_ABI = RedemptionManagerAbi as Abi;
export const SORTED_TROVES_ABI = SortedTrovesAbi as Abi;
export const STABILITY_POOL_ABI = StabilityPoolAbi as Abi;
export const TROVE_MANAGER_EVENTS_EMITTER_ABI =
  TroveManagerEventsEmitterAbi as Abi;
export const TROVE_MANAGER_ABI = TroveManagerAbi as Abi;
export const TROVE_NFT_ABI = TroveNFTAbi as Abi;
export const UBTC_ABI = UBTCAbi as Abi;
export const USDU_ABI = USDUAbi as Abi;

// Create a map for dynamic access
export const CONTRACT_ABIS = {
  ActivePool: ACTIVE_POOL_ABI,
  AddressesRegistry: ADDRESSES_REGISTRY_ABI,
  BatchManager: BATCH_MANAGER_ABI,
  BorrowerOperations: BORROWER_OPERATIONS_ABI,
  CollSurplusPool: COLL_SURPLUS_POOL_ABI,
  CollateralRegistry: COLLATERAL_REGISTRY_ABI,
  DefaultPool: DEFAULT_POOL_ABI,
  GasPool: GAS_POOL_ABI,
  HintHelpers: HINT_HELPERS_ABI,
  InterestRouterMock: INTEREST_ROUTER_MOCK_ABI,
  LiquidationManager: LIQUIDATION_MANAGER_ABI,
  PriceFeed: PRICE_FEED_ABI,
  RedemptionManager: REDEMPTION_MANAGER_ABI,
  SortedTroves: SORTED_TROVES_ABI,
  StabilityPool: STABILITY_POOL_ABI,
  TroveManagerEventsEmitter: TROVE_MANAGER_EVENTS_EMITTER_ABI,
  TroveManager: TROVE_MANAGER_ABI,
  TroveNFT: TROVE_NFT_ABI,
  UBTC: UBTC_ABI,
  USDU: USDU_ABI,
} as const;

export type ContractName = keyof typeof CONTRACT_ABIS;

/**
 * Get the ABI for a specific contract
 * @param contractName - The name of the contract
 * @returns The ABI for the contract
 * @throws Error if the contract ABI is not found
 */
export function getContractAbi(contractName: ContractName): Abi {
  const abi = CONTRACT_ABIS[contractName];
  if (!abi) {
    throw new Error(`Unknown contract: ${contractName}`);
  }
  return abi;
}

/**
 * Check if a contract ABI exists
 * @param contractName - The name of the contract to check
 * @returns true if the ABI exists, false otherwise
 */
export function hasContractAbi(
  contractName: string
): contractName is ContractName {
  return contractName in CONTRACT_ABIS;
}
