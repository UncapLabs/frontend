import { useMemo } from "react";

// Fixed 40% rebate on interest rate - hardcoded since it's a constant program value
const REBATE_PERCENTAGE = 40;

export function useCalculatedRebate(
  borrowAmount: number | undefined,
  interestRate: number
) {
  return useMemo(() => {
    if (!borrowAmount || borrowAmount <= 0) {
      return null;
    }

    // Calculate effective interest rate after 40% rebate
    const effectiveInterestRate = interestRate * (1 - REBATE_PERCENTAGE / 100);

    // Calculate yearly costs
    const yearlyInterestUSD = (borrowAmount * interestRate) / 100;
    const effectiveYearlyInterestUSD = (borrowAmount * effectiveInterestRate) / 100;
    const yearlyRebateUSD = yearlyInterestUSD - effectiveYearlyInterestUSD;

    return {
      rebatePercentage: REBATE_PERCENTAGE,
      interestRate,
      effectiveInterestRate,
      yearlyInterestUSD,
      effectiveYearlyInterestUSD,
      yearlyRebateUSD,
    };
  }, [borrowAmount, interestRate]);
}
