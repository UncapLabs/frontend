import type { CollateralType } from "~/lib/contracts/constants";
import Big from "big.js";

interface CollateralConfig {
  minCollateralizationRatio: Big;
}

// Configuration for different collateral types
export const COLLATERAL_CONFIG: Record<CollateralType, CollateralConfig> = {
  UBTC: {
    minCollateralizationRatio: new Big(1.1), // 110%
  },
  GBTC: {
    minCollateralizationRatio: new Big(1.1), // 110%
  },
  WMWBTC: {
    minCollateralizationRatio: new Big(1.1), // 110%
  },
};

export function getMinCollateralizationRatio(
  collateralType: CollateralType
): Big {
  return COLLATERAL_CONFIG[collateralType].minCollateralizationRatio;
}
