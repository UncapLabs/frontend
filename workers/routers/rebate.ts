import { publicProcedure, router } from "../trpc";
import { z } from "zod";

// Fixed 30% rebate on interest rate
const REBATE_PERCENTAGE = 30;

export const rebateRouter = router({
  calculateRebate: publicProcedure
    .input(
      z.object({
        borrowAmount: z.number().min(0),
        interestRate: z.number().min(0.5).max(20),
      })
    )
    .query(({ input }) => {
      const { borrowAmount, interestRate } = input;
      
      // Calculate effective interest rate after 30% rebate
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
    }),
});

export type RebateRouter = typeof rebateRouter;