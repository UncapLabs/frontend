// Import deployment configuration
import deploymentData from "./addresses.json";
import type { Address } from "@starknet-react/chains";

export const INTEREST_RATE_SCALE_DOWN_FACTOR = 10n ** 16n;

// Contract addresses loaded from deployment file
export const ACTIVE_POOL_ADDRESS = deploymentData.ActivePool as Address;
export const ADDRESSES_REGISTRY_ADDRESS =
  deploymentData.AddressesRegistry as Address;
export const BORROWER_OPERATIONS_ADDRESS =
  deploymentData.BorrowerOperations as Address;
export const BATCH_MANAGER_ADDRESS = deploymentData.BatchManager as Address;
export const COLLATERAL_REGISTRY_ADDRESS =
  deploymentData.CollateralRegistry as Address;
export const COLL_SURPLUS_POOL_ADDRESS =
  deploymentData.CollSurplusPool as Address;
export const DEFAULT_POOL_ADDRESS = deploymentData.DefaultPool as Address;
export const GAS_POOL_ADDRESS = deploymentData.GasPool as Address;
export const HINT_HELPERS_ADDRESS = deploymentData.HintHelpers as Address;
export const INTEREST_ROUTER_ADDRESS = deploymentData.InterestRouter as Address;
export const LIQUIDATION_MANAGER_ADDRESS =
  deploymentData.LiquidationManager as Address;
export const PRICE_FEED_ADDRESS = deploymentData.PriceFeed as Address;
export const REDEMPTION_MANAGER_ADDRESS =
  deploymentData.RedemptionManager as Address;
export const SORTED_TROVES_ADDRESS = deploymentData.SortedTroves as Address;
export const STABILITY_POOL_ADDRESS = deploymentData.StabilityPool as Address;
export const TROVE_MANAGER_ADDRESS = deploymentData.TroveManager as Address;
export const TROVE_MANAGER_EVENTS_EMITTER_ADDRESS =
  deploymentData.TroveManagerEventsEmitter as Address;
export const TROVE_NFT_ADDRESS = deploymentData.TroveNFT as Address;
export const UBTC_ADDRESS = deploymentData.UBTC as Address;
export const USDU_ADDRESS = deploymentData.USDU as Address;

export const TBTC_DECIMALS = 18;
export const TBTC_SYMBOL = "TBTC";
export const USDU_DECIMALS = 18;
export const USDU_SYMBOL = "USDU";

export const TBTC_NAME = "Testnet Bitcoin";

// Token definitions
export const TBTC_TOKEN = {
  address: UBTC_ADDRESS,
  symbol: TBTC_SYMBOL,
  decimals: TBTC_DECIMALS,
  icon: "/bitcoin.png",
} as const;

export const LBTC_ADDRESS = "0x123" as Address; // TODO: Replace with actual LBTC address when available
export const LBTC_TOKEN = {
  address: LBTC_ADDRESS,
  symbol: "LBTC",
  decimals: 18,
  icon: "/bitcoin.png",
} as const;

export const BITUSD_TOKEN = {
  address: USDU_ADDRESS,
  symbol: "bitUSD",
  decimals: 18,
  icon: "/bitusd.png",
} as const;
