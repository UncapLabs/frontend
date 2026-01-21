import { useMemo } from "react";
import {
  useDepositToStabilityPool,
  useWithdrawFromStabilityPool,
  type CollateralOutputToken,
} from "~/hooks/use-stability-pool";
import type { CollateralId } from "~/lib/collateral";
import Big from "big.js";

type ActionType = "deposit" | "withdraw" | "claim";

interface UseStabilityPoolTransactionParams {
  action: ActionType;
  amount: Big | undefined;
  doClaim: boolean;
  collateralType: CollateralId;
  rewards?: {
    usdu: Big;
    collateral: Big;
  };
  collateralOutputToken?: CollateralOutputToken;
}

export function useStabilityPoolTransaction({
  action,
  amount,
  doClaim,
  collateralType,
  rewards,
  collateralOutputToken = "COLLATERAL",
}: UseStabilityPoolTransactionParams) {
  // Determine amounts for each hook based on action
  // For deposits: only pass amount to deposit hook
  // For withdrawals: only pass amount to withdraw hook
  // For claims: pass 0 to withdraw hook
  const depositAmount = action === "deposit" ? amount : undefined;
  const withdrawAmount = action === "withdraw" ? amount : (action === "claim" ? new Big(0) : undefined);
  
  // Always call both hooks - we cannot conditionally call hooks
  const depositHook = useDepositToStabilityPool({
    amount: depositAmount,
    doClaim,
    collateralType,
    rewards,
    collateralOutputToken,
  });

  const withdrawHook = useWithdrawFromStabilityPool({
    amount: withdrawAmount,
    doClaim,
    collateralType,
    rewards,
    collateralOutputToken,
  });

  return useMemo(() => {
    const isDeposit = action === "deposit";
    
    // Select the appropriate hook data based on action
    if (isDeposit) {
      return {
        send: depositHook.deposit,
        isPending: depositHook.isPending,
        isSending: depositHook.isSending,
        error: depositHook.error,
        transactionHash: depositHook.transactionHash,
        isReady: depositHook.isReady,
        currentState: depositHook.currentState,
        formData: depositHook.formData,
        reset: depositHook.reset,
        depositHook,
        withdrawHook: null,
        // Swap quote info
        expectedUsduAmount: depositHook.expectedUsduAmount,
        isQuoteLoading: depositHook.isQuoteLoading,
        quoteError: depositHook.quoteError,
      };
    } else {
      // For both "withdraw" and "claim" actions
      return {
        send: withdrawHook.withdraw,
        isPending: withdrawHook.isPending,
        isSending: withdrawHook.isSending,
        error: withdrawHook.error,
        transactionHash: withdrawHook.transactionHash,
        isReady: withdrawHook.isReady,
        currentState: withdrawHook.currentState,
        formData: withdrawHook.formData,
        reset: withdrawHook.reset,
        depositHook: null,
        withdrawHook,
        // Swap quote info
        expectedUsduAmount: withdrawHook.expectedUsduAmount,
        isQuoteLoading: withdrawHook.isQuoteLoading,
        quoteError: withdrawHook.quoteError,
      };
    }
  }, [action, depositHook, withdrawHook]);
}
