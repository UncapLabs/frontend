import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import type { CollateralType } from "~/lib/contracts/constants";

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

  // Handle open trove case
  if (params.type === "open") {
    const { collateralType, borrowedAmount, interestRate, enabled = true } = params;
    
    const { data, isLoading, error, refetch } = useQuery(
      trpc.feesRouter.predictOpenTroveUpfrontFee.queryOptions(
        {
          collateralType,
          borrowedAmount: borrowedAmount?.toString() || "0",
          interestRate: interestRate?.toString() || "0",
        },
        { 
          enabled: enabled && !!borrowedAmount && !!interestRate,
          staleTime: 30000,
          refetchInterval: 60000,
        }
      )
    );

    const upfrontFee = data?.upfrontFee ? BigInt(data.upfrontFee) : undefined;

    return {
      upfrontFee,
      isLoading,
      error,
      refetch,
    };
  }

  // Handle adjust trove case
  const { collateralType, troveId, debtIncrease, enabled = true } = params;
  
  const { data, isLoading, error, refetch } = useQuery(
    trpc.feesRouter.predictAdjustTroveUpfrontFee.queryOptions(
      {
        collateralType,
        troveId: troveId?.toString() || "0",
        debtIncrease: debtIncrease?.toString() || "0",
      },
      { 
        enabled: enabled && !!troveId && !!debtIncrease,
        staleTime: 30000,
        refetchInterval: 60000,
      }
    )
  );

  const upfrontFee = data?.upfrontFee ? BigInt(data.upfrontFee) : undefined;

  return {
    upfrontFee,
    isLoading,
    error,
    refetch,
  };
}

// Export convenience functions for specific use cases
export function usePredictOpenTroveUpfrontFee(params: Omit<OpenTroveParams, "type">) {
  return usePredictUpfrontFee({ ...params, type: "open" });
}

export function usePredictAdjustTroveUpfrontFee(params: Omit<AdjustTroveParams, "type">) {
  return usePredictUpfrontFee({ ...params, type: "adjust" });
}