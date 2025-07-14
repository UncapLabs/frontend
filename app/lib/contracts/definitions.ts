import {
  UBTC_ADDRESS,
  BORROWER_OPERATIONS_ADDRESS,
  USDU_ADDRESS,
  TROVE_MANAGER_ADDRESS,
  PRICE_FEED_ADDRESS,
} from "./constants";
import {
  BORROWER_OPERATIONS_ABI,
  TROVE_MANAGER_ABI,
  UBTC_ABI,
  USDU_ABI,
  PRICE_FEED_ABI,
} from ".";

export const TBTC = {
  address: UBTC_ADDRESS,
  abi: UBTC_ABI,
};

export const BorrowerOperations = {
  address: BORROWER_OPERATIONS_ADDRESS,
  abi: BORROWER_OPERATIONS_ABI,
};

export const USDU = {
  address: USDU_ADDRESS,
  abi: USDU_ABI,
};

export const TroveManager = {
  address: TROVE_MANAGER_ADDRESS,
  abi: TROVE_MANAGER_ABI,
};

export const PriceFeed = {
  address: PRICE_FEED_ADDRESS,
  abi: PRICE_FEED_ABI,
};
