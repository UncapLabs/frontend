import { useMemo } from "react";
import Big from "big.js";

// Fixed 40% rebate on interest rate - hardcoded since it's a constant program value
const REBATE_PERCENTAGE = 40;

export function useCalculatedRebate(
  borrowAmount: Big | undefined,
  interestRate: number
) {
  return useMemo(() => {
    if (!borrowAmount || borrowAmount.lte(0)) {
      return null;
    }

    // Use Big for precise calculations
    const interestRateBig = new Big(interestRate);
    const rebatePercentageBig = new Big(REBATE_PERCENTAGE);
    
    // Calculate effective interest rate after 40% rebate
    const effectiveInterestRate = interestRateBig.times(
      new Big(1).minus(rebatePercentageBig.div(100))
    );

    // Calculate yearly costs - all returned as Big
    const yearlyInterestUSD = borrowAmount.times(interestRateBig).div(100);
    const effectiveYearlyInterestUSD =
      borrowAmount.times(effectiveInterestRate).div(100);
    const yearlyRebateUSD = yearlyInterestUSD.minus(effectiveYearlyInterestUSD);

    return {
      rebatePercentage: REBATE_PERCENTAGE,
      interestRate: Number(interestRateBig.toString()),
      effectiveInterestRate: Number(effectiveInterestRate.toString()),
      yearlyInterestUSD,
      effectiveYearlyInterestUSD,
      yearlyRebateUSD,
    };
  }, [borrowAmount, interestRate]);
}
