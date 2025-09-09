import type { CollateralType } from "~/lib/contracts/constants";

interface CollateralConfig {
  minCollateralizationRatio: number;
}

// Configuration for different collateral types
export const COLLATERAL_CONFIG: Record<CollateralType, CollateralConfig> = {
  UBTC: {
    minCollateralizationRatio: 1.1, // 110%
  },
  GBTC: {
    minCollateralizationRatio: 1.1, // 110%
  },
};

export function getMinCollateralizationRatio(
  collateralType: CollateralType
): number {
  return COLLATERAL_CONFIG[collateralType].minCollateralizationRatio;
}
