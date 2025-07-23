import {
  USDU_ADDRESS,
  getCollateralAddresses,
  type CollateralType,
} from "./constants";
import {
  BORROWER_OPERATIONS_ABI,
  TROVE_MANAGER_ABI,
  UBTC_ABI,
  USDU_ABI,
  PRICE_FEED_ABI,
} from ".";

// Helper function to create contract definitions for a specific collateral type
export function getContractDefinitions(collateralType: CollateralType) {
  const addresses = getCollateralAddresses(collateralType);
  
  return {
    collateral: {
      address: addresses.collateral,
      abi: UBTC_ABI, // All collaterals use same ERC20 ABI
    },
    borrowerOperations: {
      address: addresses.borrowerOperations,
      abi: BORROWER_OPERATIONS_ABI,
    },
    troveManager: {
      address: addresses.troveManager,
      abi: TROVE_MANAGER_ABI,
    },
    priceFeed: {
      address: addresses.priceFeed,
      abi: PRICE_FEED_ABI,
    },
  };
}

// Global contract definitions (same for all collaterals)
export const USDU = {
  address: USDU_ADDRESS,
  abi: USDU_ABI,
};