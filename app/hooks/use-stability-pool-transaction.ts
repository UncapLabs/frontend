import { useMemo } from "react";
import {
  useDepositToStabilityPool,
  useWithdrawFromStabilityPool,
} from "~/hooks/use-stability-pool";
import type { CollateralType } from "~/lib/contracts/constants";

type ActionType = "deposit" | "withdraw";

interface UseStabilityPoolTransactionParams {
  action: ActionType;
  amount: number | undefined;
  doClaim: boolean;
  collateralType: CollateralType;
}

export function useStabilityPoolTransaction({
  action,
  amount,
  doClaim,
  collateralType,
}: UseStabilityPoolTransactionParams) {
  const depositHook = useDepositToStabilityPool({
    amount,
    doClaim,
    collateralType,
  });

  const withdrawHook = useWithdrawFromStabilityPool({
    amount,
    doClaim,
    collateralType,
  });

  return useMemo(() => {
    const isDeposit = action === "deposit";
    const activeHook = isDeposit ? depositHook : withdrawHook;

    return {
      send: activeHook[isDeposit ? "deposit" : "withdraw"],
      isPending: activeHook.isPending,
      isSending: activeHook.isSending,
      error: activeHook.error,
      transactionHash: activeHook.transactionHash,
      isReady: activeHook.isReady,
      currentState: activeHook.currentState,
      formData: activeHook.formData,
      reset: activeHook.reset,
      // Keep original hooks accessible if needed
      depositHook: isDeposit ? activeHook : null,
      withdrawHook: !isDeposit ? activeHook : null,
    };
  }, [action, depositHook, withdrawHook]);
}