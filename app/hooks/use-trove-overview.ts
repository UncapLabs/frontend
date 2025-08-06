import { useMemo } from "react";
import { useTroveData } from "./use-trove-data";
import { useFetchPrices } from "./use-fetch-prices";

// Constants
const LTV_LIQUIDATION_THRESHOLD = 1.1; // 110% collateralization ratio
const LTV_WARNING_THRESHOLD = 1.5; // 150% - warn when approaching liquidation

interface TroveMetrics {
  currentInterestRate: number;
  liquidationPrice: number;
  ltvValue: number;
  collateralizationRatio: number;
  isNearLiquidation: boolean;
  totalValue: number;
  netValue: number;
}

interface UseTroveOverviewResult {
  position: ReturnType<typeof useTroveData>['position'];
  isLoading: boolean;
  bitcoin: ReturnType<typeof useFetchPrices>['bitcoin'];
  usdu: ReturnType<typeof useFetchPrices>['usdu'];
  metrics: TroveMetrics | null;
}

export function useTroveOverview(troveId?: string): UseTroveOverviewResult {
  const { position, isLoading: isTroveLoading } = useTroveData(troveId);
  const { bitcoin, usdu } = useFetchPrices(position?.collateralAmount);

  const metrics = useMemo<TroveMetrics | null>(() => {
    if (!position) return null;

    // Calculate current interest rate
    const currentInterestRate = position.interestRate;

    // Calculate liquidation price
    const liquidationPrice = position.collateralAmount > 0
      ? (position.borrowedAmount * LTV_LIQUIDATION_THRESHOLD) / position.collateralAmount
      : 0;

    // Calculate LTV
    const ltvValue = bitcoin?.price && usdu?.price && position.collateralAmount > 0
      ? (position.borrowedAmount * usdu.price) / (position.collateralAmount * bitcoin.price) * 100
      : 0;

    // Calculate collateralization ratio (inverse of LTV)
    const collateralizationRatio = ltvValue > 0 ? 10000 / ltvValue : 0;
    const isNearLiquidation = collateralizationRatio > 0 && collateralizationRatio < LTV_WARNING_THRESHOLD * 100;

    // Calculate total and net values
    const totalValue = bitcoin?.price ? position.collateralAmount * bitcoin.price : 0;
    const netValue = bitcoin?.price && usdu?.price
      ? (position.collateralAmount * bitcoin.price) - (position.borrowedAmount * usdu.price)
      : 0;

    return {
      currentInterestRate,
      liquidationPrice,
      ltvValue,
      collateralizationRatio,
      isNearLiquidation,
      totalValue,
      netValue,
    };
  }, [position, bitcoin?.price, usdu?.price]);

  return {
    position,
    isLoading: isTroveLoading,
    bitcoin,
    usdu,
    metrics,
  };
}