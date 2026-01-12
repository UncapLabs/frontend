import { useMemo } from "react";
import Big from "big.js";

export function useCalculatedRebate(
  borrowAmount: Big | undefined,
  interestRate: number,
  rebateRate: number = 0.4 // e.g., 0.4 = 40% rebate (from API)
) {
  return useMemo(() => {
    if (!borrowAmount || borrowAmount.lte(0)) {
      return null;
    }

    // Convert rebate rate (0.4) to percentage (40)
    const rebatePercentage = rebateRate * 100;

    // Use Big for precise calculations
    const interestRateBig = new Big(interestRate);
    const rebatePercentageBig = new Big(rebatePercentage);

    // Calculate effective interest rate after rebate
    const effectiveInterestRate = interestRateBig.times(
      new Big(1).minus(rebatePercentageBig.div(100))
    );

    // Calculate yearly costs - all returned as Big
    const yearlyInterestUSD = borrowAmount.times(interestRateBig).div(100);
    const effectiveYearlyInterestUSD =
      borrowAmount.times(effectiveInterestRate).div(100);
    const yearlyRebateUSD = yearlyInterestUSD.minus(effectiveYearlyInterestUSD);

    return {
      rebatePercentage,
      interestRate: Number(interestRateBig.toString()),
      effectiveInterestRate: Number(effectiveInterestRate.toString()),
      yearlyInterestUSD,
      effectiveYearlyInterestUSD,
      yearlyRebateUSD,
    };
  }, [borrowAmount, interestRate, rebateRate]);
}
