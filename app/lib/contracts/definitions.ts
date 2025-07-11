import {
  TBTC_ADDRESS,
  BORROWER_OPERATIONS_ADDRESS,
  BITUSD_ADDRESS,
  TM_ADDRESS,
  PRICE_FEED_BTC,
} from "./constants";
import { BORROWER_OPERATIONS_ABI } from "./abis/borrower-operations";
import { TROVE_MANAGER_ABI } from "./abis/trove-manager";
import { TBTC_ABI } from "./abis/tbtc";
import { PRICE_FEED_ABI } from "./abis/price-feed";

export const TBTC = {
  address: TBTC_ADDRESS,
  abi: TBTC_ABI,
};

export const BorrowerOperations = {
  address: BORROWER_OPERATIONS_ADDRESS,
  abi: BORROWER_OPERATIONS_ABI,
};

export const BitUSD = {
  address: BITUSD_ADDRESS,
  // BitUSD ABI not needed for now per user request
  abi: [],
};

export const TroveManager = {
  address: TM_ADDRESS,
  abi: TROVE_MANAGER_ABI,
};

export const PriceFeed = {
  address: PRICE_FEED_BTC,
  abi: PRICE_FEED_ABI,
};
