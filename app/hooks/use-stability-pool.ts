import { useMemo, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { contractCall } from "~/lib/contracts/calls";
import {
  type CollateralId,
  TOKENS,
  getCollateralAddresses,
  getCollateral,
} from "~/lib/collateral";
import { useTransaction } from "~/hooks/use-transaction";
import { useTransactionState } from "./use-transaction-state";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { bigToBigint } from "~/lib/decimal";
import { useTRPC } from "~/lib/trpc";
import Big from "big.js";
import type { Call } from "starknet";
import {
  generateUnwrapCallFromBigint,
  requiresWrapping,
} from "~/lib/collateral/wrapping";

// Deposit form data structure
export interface DepositFormData {
  depositAmount?: Big;
  collateralType: CollateralId;
  rewardsClaimed?: {
    usdu: Big;
    collateral: Big;
  };
}

// Withdraw form data structure
export interface WithdrawFormData {
  withdrawAmount?: Big;
  collateralType: CollateralId;
  rewardsClaimed?: {
    usdu: Big;
    collateral: Big;
  };
}

interface UseDepositToStabilityPoolParams {
  amount?: Big;
  doClaim?: boolean;
  collateralType: CollateralId;
  onSuccess?: () => void;
  rewards?: {
    usdu: Big;
    collateral: Big;
  };
}

/**
 * Hook for depositing USDU into the Stability Pool
 */
export function useDepositToStabilityPool({
  amount,
  doClaim = true, // Default to claiming rewards
  collateralType,
  onSuccess,
  rewards,
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
    if (!address || !amount || amount.lte(0)) {
      return undefined;
    }

    const amountBigInt = bigToBigint(amount, 18);
    const addresses = getCollateralAddresses(collateralType);
    const collateral = getCollateral(collateralType);

    const callList: Call[] = [
      // 1. Approve USDU spending to Stability Pool
      contractCall.token.approve(
        TOKENS.USDU.address,
        addresses.stabilityPool,
        amountBigInt
      ),
      // 2. Deposit to Stability Pool
      contractCall.stabilityPool.deposit(amountBigInt, doClaim, collateralType),
    ];

    // For wrapped collateral: add unwrap call after claiming to return underlying token
    if (doClaim && requiresWrapping(collateral) && rewards?.collateral) {
      const collateralRewardsBigint = bigToBigint(
        rewards.collateral,
        collateral.decimals
      );
      if (collateralRewardsBigint > 0n) {
        callList.push(
          generateUnwrapCallFromBigint(collateral, collateralRewardsBigint)
        );
      }
    }

    return callList;
  }, [address, amount, doClaim, collateralType, rewards]);

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
        rewardsClaimed: doClaim ? rewards : undefined,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address && amount) {
        const transactionData = {
          hash,
          type: "deposit" as const,
          description: createTransactionDescription("deposit", {
            amount: amount.toString(),
            token: "USDU",
          }),
          details: {
            amount: amount.toString(),
            pool: collateralType,
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
  amount?: Big;
  doClaim?: boolean;
  collateralType: CollateralId;
  onSuccess?: () => void;
  rewards?: {
    usdu: Big;
    collateral: Big;
  };
}

/**
 * Hook for withdrawing USDU from the Stability Pool
 */
export function useWithdrawFromStabilityPool({
  amount,
  doClaim = true, // Default to claiming rewards
  collateralType,
  onSuccess,
  rewards,
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
    // Allow amount to be 0 for claiming rewards without withdrawing
    if (!address || amount === undefined || amount.lt(0)) {
      return undefined;
    }

    const amountBigInt = bigToBigint(amount, 18);
    const collateral = getCollateral(collateralType);

    const callList: Call[] = [
      contractCall.stabilityPool.withdraw(
        amountBigInt,
        doClaim,
        collateralType
      ),
    ];

    // For wrapped collateral: add unwrap call after claiming to return underlying token
    if (doClaim && requiresWrapping(collateral) && rewards?.collateral) {
      const collateralRewardsBigint = bigToBigint(
        rewards.collateral,
        collateral.decimals
      );
      if (collateralRewardsBigint > 0n) {
        callList.push(
          generateUnwrapCallFromBigint(collateral, collateralRewardsBigint)
        );
      }
    }

    return callList;
  }, [address, amount, doClaim, collateralType, rewards]);

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
        rewardsClaimed: doClaim ? rewards : undefined,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address && amount) {
        const transactionData = {
          hash,
          type: "withdraw" as const,
          description: createTransactionDescription("withdraw", {
            amount: amount.toString(),
            token: "USDU",
          }),
          details: {
            amount: amount.toString(),
            pool: collateralType,
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
      userAddress: address!,
    }),
    enabled: !!address,
    refetchInterval: 30000,
  });

  // Return default structure if no data
  if (!data) {
    return {
      // UBTC: null,
      // GBTC: null,
      WWBTC: null,
    };
  }

  return data;
}
