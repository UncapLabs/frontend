import { useQueryState } from "nuqs";
import {
  TBTC_TOKEN,
  COLLATERAL_TOKENS_BY_ADDRESS,
} from "~/lib/contracts/constants";

export function useCollateralToken() {
  const [selectedTokenAddress, setSelectedTokenAddress] = useQueryState(
    "collateral",
    {
      defaultValue: TBTC_TOKEN.address,
    }
  );

  const selectedCollateralToken =
    COLLATERAL_TOKENS_BY_ADDRESS[selectedTokenAddress] || TBTC_TOKEN;

  return {
    selectedCollateralToken,
    selectedTokenAddress,
    setSelectedTokenAddress,
  };
}