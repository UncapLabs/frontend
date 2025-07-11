export const INTEREST_RATE_SCALE_DOWN_FACTOR = 10n ** 16n;

export const TBTC_ADDRESS =
  "0x48308747f280d4d48910f920cd4959bd405cf504b4ee09cae7e9fc8ed1f1d67";

export const BITUSD_ADDRESS =
  "0x6feeca6bdb67f098e4c728b3c942d4b714b13a3a6ff3e7ebc902c25a408d13b";

export const PRICE_FEED_BTC =
  "0x4db7a80e186f604fa30e173448d41047e2753be00918c932e689565930a18b6";

export const TBTC_DECIMALS = 18;
export const TBTC_SYMBOL = "TBTC";

export const TBTC_NAME = "Testnet Bitcoin";

export const BORROWER_OPERATIONS_ADDRESS =
  "0x78c4cf9487ed62e1d0493e2ced5fba1a7967821b724570b43168cc1c3ee5125";
export const AP_ADDRESS =
  "0x3c48071797a190796702afc65662193dd64a3c0f804f4bb10585bddc854e7da";
export const COLL_SURPLUS_ADDRESS =
  "0x22af123449ea2128ebf55e28fd3e42fb7c6c2f6d2fdbfcce270e617656c1947";
export const DEFAULT_POOL_ADDRESS =
  "0x42bc9a14c28f61bbdd58bb869878089d66ba81b535b80896f35ff5fbe5f020e";
export const SORTED_TROVES_ADDRESS =
  "0x567b1898ed5d0c605e885630c97ced5e0c621fae596813cbd9e1c96cefb4ca8";
export const TM_ADDRESS =
  "0x4a4f2b83d0fbd3413a49c489f9f66f57127414b4a5dd8d12eef74b926d0fa77";
export const TROVE_NFT_ADDRESS =
  "0x2b953c32396151e9e043647bad6e3537a7c9d691f7f1d621dea1b8258065b9";
export const STABILITY_POOL_ADDRESS =
  "0x674956bd771f47d57ad4f8078ad6db2ba7ff37d5622627097dc935fcfb3ec73";

// Token definitions
export const TBTC_TOKEN = {
  address: TBTC_ADDRESS,
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
  address: BITUSD_ADDRESS,
  symbol: "bitUSD",
  decimals: 18,
  icon: "/bitusd.png",
} as const;
