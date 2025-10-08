import type { Abi } from "starknet";

// // Import all ABI JSON files
import AddressesRegistryAbi from "./abis/AddressesRegistry.json";
import BorrowerOperationsAbi from "./abis/BorrowerOperations.json";
import CollSurplusPoolAbi from "./abis/CollSurplusPool.json";
import HintHelpersAbi from "./abis/HintHelpers.json";
import PriceFeedAbi from "./abis/WBTCPriceFeed.json";
import StabilityPoolAbi from "./abis/StabilityPool.json";
import TroveManagerAbi from "./abis/TroveManager.json";
import UBTCAbi from "./abis/UBTC.json";
import USDUAbi from "./abis/USDU.json";
import CollateralWrapperAbi from "./abis/CollateralWrapper.json";

// // Export all ABIs with proper typing
export const ADDRESSES_REGISTRY_ABI = AddressesRegistryAbi as Abi;
export const BORROWER_OPERATIONS_ABI = BorrowerOperationsAbi as Abi;
export const COLL_SURPLUS_POOL_ABI = CollSurplusPoolAbi as Abi;
export const HINT_HELPERS_ABI = HintHelpersAbi as Abi;
export const PRICE_FEED_ABI = PriceFeedAbi as Abi;
export const STABILITY_POOL_ABI = StabilityPoolAbi as Abi;
export const TROVE_MANAGER_ABI = TroveManagerAbi as Abi;
export const UBTC_ABI = UBTCAbi as Abi;
export const USDU_ABI = USDUAbi as Abi;
export const COLLATERAL_WRAPPER_ABI = CollateralWrapperAbi as Abi;
