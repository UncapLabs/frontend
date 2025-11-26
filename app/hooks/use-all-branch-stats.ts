import { COLLATERAL_LIST, type CollateralId } from "~/lib/collateral";
import { useTRPC } from "~/lib/trpc";
import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import type Big from "big.js";

// TCR data for all branches (dynamic)
export function useAllBranchTCRs() {
  const trpc = useTRPC();

  const queries = useQueries({
    queries: COLLATERAL_LIST.map((collateral) => ({
      ...trpc.branchRouter.getTCR.queryOptions(
        { branchId: collateral.id },
        {
          refetchInterval: 120000,
          staleTime: 120000,
        }
      ),
    })),
  });

  // Build result object
  const result = {} as Record<CollateralId, (typeof queries)[0]>;
  COLLATERAL_LIST.forEach((collateral, index) => {
    result[collateral.id] = queries[index];
  });

  return result;
}

// Average interest rates for all branches (dynamic)
// export function useAllAverageInterestRates() {
//   const trpc = useTRPC();

//   const queries = useQueries({
//     queries: COLLATERAL_LIST.map((collateral) => ({
//       ...trpc.interestRouter.getAverageInterestRate.queryOptions({
//         branchId: collateral.branchId,
//       }),
//     })),
//   });

//   const result = {} as Record<CollateralId, UseQueryResult<Big | undefined>>;
//   COLLATERAL_LIST.forEach((collateral, index) => {
//     result[collateral.id] = queries[index] as UseQueryResult<Big | undefined>;
//   });

//   return result;
// }

// Visualization data for all branches (dynamic)
// export function useAllInterestRateVisualization() {
//   const trpc = useTRPC();

//   const queries = useQueries({
//     queries: COLLATERAL_LIST.map((collateral) => ({
//       ...trpc.interestRouter.getInterestRateVisualizationData.queryOptions({
//         branchId: collateral.branchId,
//       }),
//       staleTime: 5 * 60 * 1000, // 5 minutes
//       refetchInterval: 2 * 60 * 1000, // 2 minutes
//     })),
//   });

//   const result = {} as Record<CollateralId, typeof queries[0]>;
//   COLLATERAL_LIST.forEach((collateral, index) => {
//     result[collateral.id] = queries[index];
//   });

//   return result;
// }
