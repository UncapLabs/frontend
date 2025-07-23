import {
  UBTC_TOKEN,
  COLLATERAL_TOKENS_BY_ADDRESS,
} from "~/lib/contracts/constants";

export function useCollateralToken(selectedTokenAddress: string) {
  const selectedCollateralToken =
    COLLATERAL_TOKENS_BY_ADDRESS[selectedTokenAddress] || UBTC_TOKEN;

  return {
    selectedCollateralToken,
  };
}
