import { useMemo } from "react";

interface PositionMetricsParams {
  collateralAmount?: number | null;
  borrowAmount?: number | null;
  bitcoinPrice?: number;
  usduPrice?: number;
  minCollateralizationRatio: number;
}

interface PositionMetrics {
  ltvValue: number;
  liquidationPrice: number;
  totalValue: number;
  netValue: number;
  collateralRatio: number;
  liquidationRisk?: "Low" | "Medium" | "High";
}

export function usePositionMetrics({
  collateralAmount,
  borrowAmount,
  bitcoinPrice,
  usduPrice = 1,
  minCollateralizationRatio,
}: PositionMetricsParams): PositionMetrics {
  return useMemo(() => {
    // Convert null to 0 for calculations
    const collateral = collateralAmount ?? 0;
    const debt = borrowAmount ?? 0;
    
    const totalValue = collateral && bitcoinPrice 
      ? collateral * bitcoinPrice 
      : 0;
    
    const netValue = collateral && debt && bitcoinPrice
      ? (collateral * bitcoinPrice) - (debt * usduPrice)
      : 0;
    
    const liquidationPrice = collateral > 0 && debt > 0
      ? (debt * minCollateralizationRatio) / collateral
      : 0;
    
    const ltvValue = collateral > 0 && debt && bitcoinPrice
      ? (debt * usduPrice) / (collateral * bitcoinPrice) * 100
      : 0;
    
    const collateralRatio = debt > 0 && collateral && bitcoinPrice
      ? ((collateral * bitcoinPrice) / (debt * usduPrice)) * 100
      : 0;
    
    const liquidationRisk: "Low" | "Medium" | "High" | undefined = 
      liquidationPrice > 0 && bitcoinPrice
        ? bitcoinPrice / liquidationPrice > 2
          ? "Low"
          : bitcoinPrice / liquidationPrice > 1.5
          ? "Medium"
          : "High"
        : undefined;

    return {
      ltvValue,
      liquidationPrice,
      totalValue,
      netValue,
      collateralRatio,
      liquidationRisk,
    };
  }, [collateralAmount, borrowAmount, bitcoinPrice, usduPrice, minCollateralizationRatio]);
}

export function getRedemptionRisk(interestRate?: number): "Low" | "Medium" | "High" | undefined {
  if (interestRate === undefined) return undefined;
  return interestRate < 5 ? "High" : interestRate < 10 ? "Medium" : "Low";
}