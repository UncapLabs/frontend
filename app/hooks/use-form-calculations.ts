import { useMemo } from "react";
import {
  computeDebtLimit,
  computeHealthFactor,
  computeLiquidationPrice,
} from "~/lib/utils/calc";

export function useFormCalculations(
  collateralAmount: number | undefined,
  borrowAmount: number | undefined,
  bitcoinPrice: number | undefined,
  usduPrice: number | undefined
) {
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
      usduPrice || 0
    );
  }, [collateralAmount, borrowAmount, usduPrice]);

  return {
    debtLimit,
    healthFactor,
    liquidationPrice,
  };
}
