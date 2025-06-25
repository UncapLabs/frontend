import { useMemo } from "react";
import {
  computeBorrowAmountFromLTV,
  computeDebtLimit,
  computeHealthFactor,
  computeLiquidationPrice,
  computeLTVFromBorrowAmount,
  MAX_LTV,
} from "~/lib/utils/calc";

export function useFormCalculations(
  collateralAmount: number | undefined,
  borrowAmount: number | undefined,
  bitcoinPrice: number | undefined,
  bitUSDPrice: number | undefined
) {
  const ltvValue = useMemo(() => {
    if (
      collateralAmount &&
      collateralAmount > 0 &&
      borrowAmount !== undefined &&
      bitcoinPrice &&
      bitcoinPrice > 0
    ) {
      const ltv =
        borrowAmount > 0
          ? computeLTVFromBorrowAmount(borrowAmount, collateralAmount, bitcoinPrice)
          : 0;
      return Math.round(ltv * 100);
    }
    return 0;
  }, [collateralAmount, borrowAmount, bitcoinPrice]);

  const debtLimit = useMemo(() => {
    return computeDebtLimit(collateralAmount || 0, bitcoinPrice || 0);
  }, [collateralAmount, bitcoinPrice]);

  const healthFactor = useMemo(() => {
    return computeHealthFactor(
      collateralAmount || 0,
      borrowAmount || 0,
      bitcoinPrice || 0
    );
  }, [collateralAmount, borrowAmount, bitcoinPrice]);

  const liquidationPrice = useMemo(() => {
    return computeLiquidationPrice(
      collateralAmount || 0,
      borrowAmount || 0,
      bitUSDPrice || 0
    );
  }, [collateralAmount, borrowAmount, bitUSDPrice]);

  const computeBorrowFromLTV = useMemo(() => {
    return (ltvPercentage: number) => {
      const cappedLTV = Math.min(ltvPercentage, MAX_LTV * 100);
      return computeBorrowAmountFromLTV(
        cappedLTV,
        collateralAmount || 0,
        bitcoinPrice || 0
      );
    };
  }, [collateralAmount, bitcoinPrice]);

  return {
    ltvValue,
    debtLimit,
    healthFactor,
    liquidationPrice,
    computeBorrowFromLTV,
  };
}