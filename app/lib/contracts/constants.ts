export const INTEREST_RATE_SCALE_DOWN_FACTOR = 10n ** 16n;

export const ACTIVE_POOL_ADDRESS =
  "0x2c9b8fc34f3f1e4d6b8f5fb3afa3aadc8bde58c2a0091cc0c4da348d0d027c1";
export const ADDRESSES_REGISTRY_ADDRESS =
  "0x34978dcd16f256980a779651b2650fcb2ccc804eebcbfb1ddffeb37ada127a";
export const BORROWER_OPERATIONS_ADDRESS =
  "0x72b5f3080db8eef1de9259fa15d8ebc75fd09e879ef00807a803b35cc9ae557";
export const BATCH_MANAGER_ADDRESS =
  "0x3de09f5d60331c477e45914a2804b1f14e83164439de1d59fa8f35103844289";
export const COLLATERAL_REGISTRY_ADDRESS =
  "0x60eec0dc8463b822df20f33f4856caa157d141a4f5d33a96ab65fb14974bfad";
export const COLL_SURPLUS_POOL_ADDRESS =
  "0x59d51fa64bbd34699b1c0c6a5d5a5eb73490ebdb02da8bb923e3ae9ef043ad8";
export const DEFAULT_POOL_ADDRESS =
  "0x6b09b7b93ec5eecc2de20cd2d9003feec51d9f035eb662cbf12764ff4f28a8c";
export const GAS_POOL_ADDRESS =
  "0x2495894854caa77ba9086bc9892eb7637ec9bd5be37b06b3072792fafbfd1d7";
export const HINT_HELPERS_ADDRESS =
  "0x2e757c8f14cc62563c208ca9b2f8e4dfee0b9985e48e4fda70bd8fadee0c2b0";
export const INTEREST_ROUTER_ADDRESS =
  "0x57defda9c41863d61e1a706b6f7fde00fb8b18609201ad069bfedf28c4e3c7";
export const LIQUIDATION_MANAGER_ADDRESS =
  "0x5dd81ee886d367cf110fbcb769215781952b7eb52e6b48b08f702d56b04112d";
export const PRICE_FEED_ADDRESS =
  "0x205f164bd08db90fcc192bba9c014c9b2d1c521bf3d160ceb4dc7005fdb7597";
export const REDEMPTION_MANAGER_ADDRESS =
  "0x1e3b2bc52b77ec517659ca452eb49bcd31b24ebb5dc7285dd5ebb3a5f84f1c1";
export const SORTED_TROVES_ADDRESS =
  "0xe440bc171a9d73f5cd768f52cbc2f239b460641fe403aea88d2965b6b054ea";
export const STABILITY_POOL_ADDRESS =
  "0x837961ff5e61ac10f7ee9c9cc007ca4fe571099e9cfa360173b197b51186c7";
export const TROVE_MANAGER_ADDRESS =
  "0xe8f8b358592da79b2347b06a76b4d7a17996370de6f823c025fdac0e409fcb";
export const TROVE_MANAGER_EVENTS_EMITTER_ADDRESS =
  "0x74243f37fe2ebb3469499d8ee8480a443c115cdd381014be004fc1291ecbaae";
export const TROVE_NFT_ADDRESS =
  "0x6292ac6f1d36bec2f05b96d01a35f57ac3f5d77b86f69801e7d868733b907b3";
export const UBTC_ADDRESS =
  "0xf4990c9bf1ddba101219db901bcfec96c8d2ff5f247853f27b46f919c512df";
export const USDU_ADDRESS =
  "0x2dbff489c3c186bffd62518970c41f6819c7d2636049717f9758624962c8c79";

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

export const LBTC_ADDRESS = "0x123..."; // TODO: Replace with actual LBTC address
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
