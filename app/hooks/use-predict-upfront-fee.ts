import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import type { CollateralType } from "~/lib/contracts/constants";
import { bigToBigint } from "~/lib/decimal";

// For opening a new trove
interface OpenTroveParams {
  type: "open";
  collateralType: CollateralType;
  borrowedAmount?: bigint;
  interestRate?: bigint;
  enabled?: boolean;
}

// For adjusting an existing trove
interface AdjustTroveParams {
  type: "adjust";
  collateralType: CollateralType;
  troveId?: bigint;
  debtIncrease?: bigint;
  enabled?: boolean;
}

type UsePredictUpfrontFeeParams = OpenTroveParams | AdjustTroveParams;

export function usePredictUpfrontFee(params: UsePredictUpfrontFeeParams) {
  const trpc = useTRPC();

  const isOpenType = params.type === "open";
  const isAdjustType = params.type === "adjust";

  // Extract params for open type
  const openParams = isOpenType ? params : null;
  const borrowedAmount = openParams?.borrowedAmount;
  const interestRate = openParams?.interestRate;
  const openEnabled = openParams?.enabled ?? true;

  // Extract params for adjust type
  const adjustParams = isAdjustType ? params : null;
  const troveId = adjustParams?.troveId;
  const debtIncrease = adjustParams?.debtIncrease;
  const adjustEnabled = adjustParams?.enabled ?? true;

  // Call both hooks but control with enabled
  const openQuery = useQuery(
    trpc.feesRouter.predictOpenTroveUpfrontFee.queryOptions(
      {
        collateralType: params.collateralType,
        borrowedAmount: borrowedAmount?.toString() || "0",
        interestRate: interestRate?.toString() || "0",
      },
      {
        enabled:
          isOpenType && openEnabled && !!borrowedAmount && !!interestRate,
        staleTime: 30000,
        refetchInterval: 60000,
      }
    )
  );

  const adjustQuery = useQuery(
    trpc.feesRouter.predictAdjustTroveUpfrontFee.queryOptions(
      {
        collateralType: params.collateralType,
        troveId: troveId?.toString() || "0",
        debtIncrease: debtIncrease?.toString() || "0",
      },
      {
        enabled: isAdjustType && adjustEnabled && !!troveId && !!debtIncrease,
        staleTime: 30000,
        refetchInterval: 60000,
      }
    )
  );

  // Return the appropriate query results
  const activeQuery = isOpenType ? openQuery : adjustQuery;
  
  // Convert Big instance from API to bigint for contract calls
  const upfrontFee = activeQuery.data?.upfrontFee
    ? bigToBigint(activeQuery.data.upfrontFee, 18)
    : undefined;

  return {
    upfrontFee,
    isLoading: activeQuery.isLoading,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
  };
}

// Export convenience functions for specific use cases
export function usePredictOpenTroveUpfrontFee(
  params: Omit<OpenTroveParams, "type">
) {
  return usePredictUpfrontFee({ ...params, type: "open" });
}

export function usePredictAdjustTroveUpfrontFee(
  params: Omit<AdjustTroveParams, "type">
) {
  return usePredictUpfrontFee({ ...params, type: "adjust" });
}
