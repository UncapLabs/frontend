export const INTEREST_RATE_SCALE_DOWN_FACTOR = 10n ** 16n;

export const ACTIVE_POOL_ADDRESS =
  "0x69d5b57b52cedf65164c2cc541ab9dde7cad92a5d11411a54564174b0ff7f01";
export const ADDRESSES_REGISTRY_ADDRESS =
  "0x019e200f75789d3d1bcc1e9fb831b2c7e0ba165aee63cbbe969048a6b107e8b7";
export const BORROWER_OPERATIONS_ADDRESS =
  "0x3c0575467094a0bd63bb06db6914e445ac4c2ae821ef2d453a58de0ec4ebc69";
export const BATCH_MANAGER_ADDRESS =
  "0x69b69bd46e65d76d4a176c7059f52a64e503b494a0f783fdee9bf81bbbdeec9";
export const COLLATERAL_REGISTRY_ADDRESS =
  "0x75609a10f4c38e50ca91c1ad89141738223db234f184d06385eece9ea531083";
export const COLL_SURPLUS_POOL_ADDRESS =
  "0x1dc6a2d741a34e95692d70fc3919c4aec28c224ee6c6b761577b3df3610da7a";
export const DEFAULT_POOL_ADDRESS =
  "0x31b284cf266487d7e6febb997a1f7e9984e5d8a14260e3ddaaa347ee7479a30";
export const GAS_POOL_ADDRESS =
  "0x294da91c1cae1ede32c239586f24ae29758e1064f089aac9873d71a10f57b8e";
export const HINT_HELPERS_ADDRESS =
  "0x284675b13dea769b29bbe286f2802c03f8379c7f85305e155e56145268f0436";
export const INTEREST_ROUTER_ADDRESS =
  "0x10c41411c83fc4e90e344c7aa0dd41d301491af4acbca123456995488f74397";
export const LIQUIDATION_MANAGER_ADDRESS =
  "0x44fa9408c67d360f931f992f0cd6fd0ef3256009482c15f042cd81883780a9a";
export const PRICE_FEED_ADDRESS =
  "0x34f8c6bd7db19f4e67be914017dae06262c08cd60394aa5c8c5019082da7842";
export const REDEMPTION_MANAGER_ADDRESS =
  "0x573bf45734261738494b4f73916815e787cf23e88b5a755f8638201a4fa8b9b";
export const SORTED_TROVES_ADDRESS =
  "0x7b47c20f1cb858f01e38ab3281dd6e2d7c28261e33b680825ec8364bbd661f5";
export const STABILITY_POOL_ADDRESS =
  "0x7f50bd9243e228ebca1b7cd969bde3f1c3eee346629fb0b6d6ef9aa545d50a3";
export const TROVE_MANAGER_ADDRESS =
  "0x07b177f752ad3bf909e4046fe3ebfd9fc7f5fda269927d806251d145afd7ed40";
export const TROVE_MANAGER_EVENTS_EMITTER_ADDRESS =
  "0x3caa40af7c45754f5271254ba564f62bf51d346a8b6dcee2dbe1ab532da056c";
export const TROVE_NFT_ADDRESS =
  "0x7b177f752ad3bf909e4046fe3ebfd9fc7f5fda269927d806251d145afd7ed40";
export const UBTC_ADDRESS =
  "0x3280c583f8e3720ba6b4c54b0527bef1254395d430a52b55fb2ee94cb9a37f1";
export const USDU_ADDRESS =
  "0x4324607a91aa6c87ea0a526ffd91e673930737fd6bcb643623c8bb053fc63b0";

export const TBTC_DECIMALS = 18;
export const TBTC_SYMBOL = "TBTC";

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
