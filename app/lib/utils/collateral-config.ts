import type { CollateralType } from "~/lib/contracts/constants";

interface CollateralConfig {
  minCollateralizationRatio: number;
  symbol: string;
}

// Configuration for different collateral types
export const COLLATERAL_CONFIG: Record<CollateralType, CollateralConfig> = {
  UBTC: {
    minCollateralizationRatio: 1.1, // 110%
    symbol: "UBTC",
  },
  GBTC: {
    minCollateralizationRatio: 1.1, // 110% - can be adjusted independently
    symbol: "GBTC", 
  },
};

export function getMinCollateralizationRatio(collateralType: CollateralType): number {
  return COLLATERAL_CONFIG[collateralType].minCollateralizationRatio;
}

export function getCollateralSymbol(collateralType: CollateralType): string {
  return COLLATERAL_CONFIG[collateralType].symbol;
}