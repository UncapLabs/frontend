import { useMemo, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { contractCall } from "~/lib/contracts/calls";
import { 
  type CollateralType,
  USDU_TOKEN,
  getCollateralAddresses 
} from "~/lib/contracts/constants";
import { useTransaction } from "~/hooks/use-transaction";
import { useTransactionState } from "./use-transaction-state";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { decimalToBigint } from "~/lib/decimal";
import { useTRPC } from "~/lib/trpc";

// Deposit form data structure
export interface DepositFormData {
  depositAmount?: number;
  collateralType: CollateralType;
}

// Withdraw form data structure  
export interface WithdrawFormData {
  withdrawAmount?: number;
  collateralType: CollateralType;
}

interface UseDepositToStabilityPoolParams {
  amount?: number;
  doClaim?: boolean;
  collateralType: CollateralType;
  onSuccess?: () => void;
}

/**
 * Hook for depositing USDU into the Stability Pool
 */
export function useDepositToStabilityPool({
  amount,
  doClaim = true, // Default to claiming rewards
  collateralType,
  onSuccess,
}: UseDepositToStabilityPoolParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();

  // Transaction state management
  const transactionState = useTransactionState<DepositFormData>({
    initialFormData: {
      depositAmount: undefined,
      collateralType,
    },
  });

  // Prepare the calls
  const calls = useMemo(() => {
    if (!address || !amount || amount <= 0) {
      return undefined;
    }

    const amountBigInt = decimalToBigint(amount, 18);
    const addresses = getCollateralAddresses(collateralType);
    
    return [
      // 1. Approve USDU spending to Stability Pool
      contractCall.token.approve(
        USDU_TOKEN.address,
        addresses.stabilityPool,
        amountBigInt
      ),
      // 2. Deposit to Stability Pool
      contractCall.stabilityPool.deposit(amountBigInt, doClaim, collateralType)
    ];
  }, [address, amount, doClaim, collateralType]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  // Create a wrapped send function that manages state transitions
  const deposit = useCallback(async () => {
    if (!calls) return;
    
    const hash = await transaction.send();

    if (hash) {
      // Transaction was sent successfully, move to pending
      transactionState.updateFormData({
        depositAmount: amount,
        collateralType,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address) {
        const transactionData = {
          hash,
          type: "deposit" as const,
          description: createTransactionDescription("deposit", {
            amount,
            token: "USDU",
          }),
          details: {
            depositAmount: amount,
            collateralType,
          },
        };

        transactionStore.addTransaction(address, transactionData);
      }
    }
  }, [
    calls,
    transaction,
    transactionState,
    transactionStore,
    amount,
    collateralType,
    address,
  ]);

  // Check if we need to update state based on transaction status
  if (transactionState.currentState === "pending") {
    if (transaction.isSuccess) {
      transactionState.setSuccess();
      if (onSuccess) {
        onSuccess();
      }
    } else if (transaction.isError && transaction.error) {
      transactionState.setError(transaction.error);
    }
  }

  return {
    ...transaction,
    ...transactionState,
    deposit,
    isReady: !!calls,
    isSending: transaction.isSending,
  };
}

interface UseWithdrawFromStabilityPoolParams {
  amount?: number;
  doClaim?: boolean;
  collateralType: CollateralType;
  onSuccess?: () => void;
}

/**
 * Hook for withdrawing USDU from the Stability Pool
 */
export function useWithdrawFromStabilityPool({
  amount,
  doClaim = true, // Default to claiming rewards
  collateralType,
  onSuccess,
}: UseWithdrawFromStabilityPoolParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();

  // Transaction state management
  const transactionState = useTransactionState<WithdrawFormData>({
    initialFormData: {
      withdrawAmount: undefined,
      collateralType,
    },
  });

  // Prepare the calls
  const calls = useMemo(() => {
    if (!address || !amount || amount <= 0) {
      return undefined;
    }

    const amountBigInt = decimalToBigint(amount, 18);
    return [contractCall.stabilityPool.withdraw(amountBigInt, doClaim, collateralType)];
  }, [address, amount, doClaim, collateralType]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  // Create a wrapped send function that manages state transitions
  const withdraw = useCallback(async () => {
    if (!calls) return;
    
    const hash = await transaction.send();

    if (hash) {
      // Transaction was sent successfully, move to pending
      transactionState.updateFormData({
        withdrawAmount: amount,
        collateralType,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address) {
        const transactionData = {
          hash,
          type: "withdraw" as const,
          description: createTransactionDescription("withdraw", {
            amount,
            token: "USDU",
          }),
          details: {
            withdrawAmount: amount,
            collateralType,
          },
        };

        transactionStore.addTransaction(address, transactionData);
      }
    }
  }, [
    calls,
    transaction,
    transactionState,
    transactionStore,
    amount,
    collateralType,
    address,
  ]);

  // Check if we need to update state based on transaction status
  if (transactionState.currentState === "pending") {
    if (transaction.isSuccess) {
      transactionState.setSuccess();
      if (onSuccess) {
        onSuccess();
      }
    } else if (transaction.isError && transaction.error) {
      transactionState.setError(transaction.error);
    }
  }

  return {
    ...transaction,
    ...transactionState,
    withdraw,
    isReady: !!calls,
    isSending: transaction.isSending,
  };
}

/**
 * Hook to fetch all user stability pool positions across all collateral types using tRPC
 */
export function useAllStabilityPoolPositions() {
  const { address } = useAccount();
  const trpc = useTRPC();
  
  const { data } = useQuery({
    ...trpc.stabilityPoolRouter.getAllPositions.queryOptions({ 
      userAddress: address! 
    }),
    enabled: !!address,
    refetchInterval: 30000,
  });
  
  // Return default structure if no data
  if (!data) {
    return {
      UBTC: {
        userDeposit: 0,
        rewards: { usdu: 0, collateral: 0 },
        totalDeposits: 0,
        poolShare: 0,
      },
      GBTC: {
        userDeposit: 0,
        rewards: { usdu: 0, collateral: 0 },
        totalDeposits: 0,
        poolShare: 0,
      },
    };
  }
  
  return data;
}