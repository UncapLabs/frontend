import { useMemo } from "react";
import Big from "big.js";

interface PositionMetricsParams {
  collateralAmount?: Big | null;
  borrowAmount?: Big | null;
  bitcoinPrice?: Big;
  usduPrice?: Big;
  minCollateralizationRatio: number;
}

interface PositionMetrics {
  ltvValue: Big;
  liquidationPrice: Big;
  totalValue: Big;
  netValue: Big;
  collateralRatio: Big;
  liquidationRisk?: "Low" | "Medium" | "High";
}

export function usePositionMetrics({
  collateralAmount,
  borrowAmount,
  bitcoinPrice,
  usduPrice = new Big(1),
  minCollateralizationRatio,
}: PositionMetricsParams): PositionMetrics {
  return useMemo(() => {
    // Convert null to 0 for calculations
    const collateral = collateralAmount ?? new Big(0);
    const debt = borrowAmount ?? new Big(0);
    const zeroBig = new Big(0);
    const minRatioBig = new Big(minCollateralizationRatio);
    
    const totalValue = collateral.gt(zeroBig) && bitcoinPrice 
      ? collateral.times(bitcoinPrice) 
      : zeroBig;
    
    const netValue = collateral.gt(zeroBig) && debt.gt(zeroBig) && bitcoinPrice
      ? collateral.times(bitcoinPrice).minus(debt.times(usduPrice))
      : zeroBig;
    
    const liquidationPrice = collateral.gt(zeroBig) && debt.gt(zeroBig)
      ? debt.times(minRatioBig).div(collateral)
      : zeroBig;
    
    const ltvValue = collateral.gt(zeroBig) && debt.gt(zeroBig) && bitcoinPrice
      ? debt.times(usduPrice).div(collateral.times(bitcoinPrice)).times(100)
      : zeroBig;
    
    const collateralRatio = debt.gt(zeroBig) && collateral.gt(zeroBig) && bitcoinPrice
      ? collateral.times(bitcoinPrice).div(debt.times(usduPrice)).times(100)
      : zeroBig;
    
    const liquidationRisk: "Low" | "Medium" | "High" | undefined = 
      liquidationPrice.gt(zeroBig) && bitcoinPrice
        ? bitcoinPrice.div(liquidationPrice).gt(2)
          ? "Low"
          : bitcoinPrice.div(liquidationPrice).gt(1.5)
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
