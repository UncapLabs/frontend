// Import deployment configuration
import deploymentData from "./deployment_addresses";
import type { Address } from "@starknet-react/chains";

export const MIN_DEBT = 200; // Minimum debt threshold in USDU
export const MAX_LIMIT = 1000000; // Maximum amount limit for UI inputs

// Contract addresses
export const USDU_ADDRESS = deploymentData.USDU as Address;
export const GAS_TOKEN_ADDRESS = deploymentData.gasToken as Address;
export const CLAIM_DISTRIBUTOR_ADDRESS =
  deploymentData.claimDistributor as Address;
