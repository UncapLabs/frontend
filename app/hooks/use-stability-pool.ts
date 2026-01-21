import { useMemo, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { contractCall } from "~/lib/contracts/calls";
import {
  type CollateralId,
  type Token,
  TOKENS,
  COLLATERAL_LIST,
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
  getBalanceDecimals,
} from "~/lib/collateral/wrapping";
import { useSwapQuote } from "./use-swap-quote";
import { buildSwapCalls } from "~/lib/contracts/swap-calls";

// Output token options for collateral rewards
export type CollateralOutputToken = "COLLATERAL" | "USDU";

// Deposit form data structure
export interface DepositFormData {
  depositAmount?: Big;
  collateralType: CollateralId;
  rewardsClaimed?: {
    usdu: Big;
    collateral: Big;
  };
  collateralOutputToken?: CollateralOutputToken;
  expectedUsduAmount?: string;
}

// Withdraw form data structure
export interface WithdrawFormData {
  withdrawAmount?: Big;
  collateralType: CollateralId;
  rewardsClaimed?: {
    usdu: Big;
    collateral: Big;
  };
  collateralOutputToken?: CollateralOutputToken;
  expectedUsduAmount?: string;
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
  collateralOutputToken?: CollateralOutputToken;
}

// Helper to get the sell token for swapping collateral rewards
function getCollateralSellToken(collateralId: CollateralId): Token {
  const collateral = getCollateral(collateralId);
  // For wrapped collateral, swap the underlying (e.g., WBTC)
  // For non-wrapped, swap the collateral token directly
  if (collateral.underlyingToken) {
    // WWBTC -> use WBTC token
    if (collateralId === "WWBTC") {
      return TOKENS.WBTC;
    }
    // For other wrapped tokens, create a Token object
    return {
      address: collateral.underlyingToken.address,
      symbol: collateral.symbol,
      name: collateral.name,
      decimals: collateral.underlyingToken.decimals,
      icon: collateral.icon,
    };
  }
  // Non-wrapped collateral (tBTC, SolvBTC)
  return {
    address: collateral.addresses.token,
    symbol: collateral.symbol,
    name: collateral.name,
    decimals: collateral.decimals,
    icon: collateral.icon,
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
  collateralOutputToken = "COLLATERAL",
}: UseDepositToStabilityPoolParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();
  const collateral = getCollateral(collateralType);

  // Transaction state management
  const transactionState = useTransactionState<DepositFormData>({
    initialFormData: {
      depositAmount: undefined,
      collateralType,
      collateralOutputToken,
    },
  });

  // Get the sell token for swapping (underlying token for wrapped collateral)
  const sellToken = getCollateralSellToken(collateralType);

  // Calculate collateral amount in underlying decimals for swap quote
  const collateralAmountBigint = useMemo(() => {
    if (!rewards?.collateral || rewards.collateral.lte(0)) return undefined;
    // Get the underlying decimals for the swap
    const underlyingDecimals = getBalanceDecimals(collateral);
    return bigToBigint(rewards.collateral, underlyingDecimals);
  }, [rewards?.collateral, collateral]);

  // Fetch swap quote when swapping collateral to USDU
  const {
    quote: swapQuote,
    expectedOutputAmount: expectedUsduAmount,
    isLoading: isQuoteLoading,
    error: quoteError,
  } = useSwapQuote({
    sellToken,
    buyToken: TOKENS.USDU,
    sellAmount: collateralAmountBigint,
    enabled:
      doClaim &&
      collateralOutputToken === "USDU" &&
      !!rewards?.collateral &&
      rewards.collateral.gt(0),
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
  const transaction = useTransaction();

  // Create a wrapped send function that manages state transitions
  const deposit = useCallback(async () => {
    if (!calls) return;

    let finalCalls = calls;

    // If swapping collateral to USDU and we have a quote, append swap calls
    if (
      collateralOutputToken === "USDU" &&
      swapQuote &&
      address &&
      rewards?.collateral?.gt(0)
    ) {
      try {
        const swapResult = await buildSwapCalls({
          quote: swapQuote,
          takerAddress: address,
          sellSymbol: sellToken.symbol,
          buySymbol: TOKENS.USDU.symbol,
        });
        finalCalls = [...calls, ...swapResult.calls];
      } catch (error) {
        console.error("Failed to build swap calls:", error);
        throw new Error("Failed to prepare swap transaction");
      }
    }

    const hash = await transaction.send(finalCalls);

    if (hash) {
      // Transaction was sent successfully, move to pending
      transactionState.updateFormData({
        depositAmount: amount,
        collateralType,
        rewardsClaimed: doClaim ? rewards : undefined,
        collateralOutputToken,
        expectedUsduAmount:
          collateralOutputToken === "USDU"
            ? expectedUsduAmount?.toString()
            : undefined,
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
            ...(doClaim &&
            rewards &&
            (rewards.usdu.gt(0) || rewards.collateral.gt(0))
              ? {
                  usduRewards: rewards.usdu.toString(),
                  collateralRewards: rewards.collateral.toString(),
                  collateralToken: getCollateral(collateralType).symbol,
                  collateralOutputToken,
                  ...(collateralOutputToken === "USDU" && expectedUsduAmount
                    ? { expectedUsduFromSwap: expectedUsduAmount.toString() }
                    : {}),
                }
              : {}),
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
    doClaim,
    rewards,
    collateralOutputToken,
    swapQuote,
    sellToken,
    expectedUsduAmount,
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

  // Determine if we're ready to send
  // For USDU output, also need a valid quote if there are collateral rewards
  const hasCollateralRewards = rewards?.collateral && rewards.collateral.gt(0);
  const isReady =
    !!calls &&
    (collateralOutputToken === "COLLATERAL" ||
      !hasCollateralRewards ||
      (collateralOutputToken === "USDU" && !!swapQuote));

  return {
    ...transaction,
    ...transactionState,
    deposit,
    isReady,
    isSending: transaction.isSending,
    // Swap quote info for UI
    expectedUsduAmount,
    isQuoteLoading,
    quoteError,
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
  collateralOutputToken?: CollateralOutputToken;
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
  collateralOutputToken = "COLLATERAL",
}: UseWithdrawFromStabilityPoolParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();
  const collateral = getCollateral(collateralType);

  // Transaction state management
  const transactionState = useTransactionState<WithdrawFormData>({
    initialFormData: {
      withdrawAmount: undefined,
      collateralType,
      collateralOutputToken,
    },
  });

  // Get the sell token for swapping (underlying token for wrapped collateral)
  const sellToken = getCollateralSellToken(collateralType);

  // Calculate collateral amount in underlying decimals for swap quote
  const collateralAmountBigint = useMemo(() => {
    if (!rewards?.collateral || rewards.collateral.lte(0)) return undefined;
    // Get the underlying decimals for the swap
    const underlyingDecimals = getBalanceDecimals(collateral);
    return bigToBigint(rewards.collateral, underlyingDecimals);
  }, [rewards?.collateral, collateral]);

  // Fetch swap quote when swapping collateral to USDU
  const {
    quote: swapQuote,
    expectedOutputAmount: expectedUsduAmount,
    isLoading: isQuoteLoading,
    error: quoteError,
  } = useSwapQuote({
    sellToken,
    buyToken: TOKENS.USDU,
    sellAmount: collateralAmountBigint,
    enabled:
      doClaim &&
      collateralOutputToken === "USDU" &&
      !!rewards?.collateral &&
      rewards.collateral.gt(0),
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
  const transaction = useTransaction();

  // Create a wrapped send function that manages state transitions
  const withdraw = useCallback(async () => {
    if (!calls) return;

    let finalCalls = calls;

    // If swapping collateral to USDU and we have a quote, append swap calls
    if (
      collateralOutputToken === "USDU" &&
      swapQuote &&
      address &&
      rewards?.collateral?.gt(0)
    ) {
      try {
        const swapResult = await buildSwapCalls({
          quote: swapQuote,
          takerAddress: address,
          sellSymbol: sellToken.symbol,
          buySymbol: TOKENS.USDU.symbol,
        });
        finalCalls = [...calls, ...swapResult.calls];
      } catch (error) {
        console.error("Failed to build swap calls:", error);
        throw new Error("Failed to prepare swap transaction");
      }
    }

    const hash = await transaction.send(finalCalls);

    if (hash) {
      // Transaction was sent successfully, move to pending
      transactionState.updateFormData({
        withdrawAmount: amount,
        collateralType,
        rewardsClaimed: doClaim ? rewards : undefined,
        collateralOutputToken,
        expectedUsduAmount:
          collateralOutputToken === "USDU"
            ? expectedUsduAmount?.toString()
            : undefined,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address && amount !== undefined) {
        // Determine if this is a claim-only transaction (amount = 0 with rewards)
        const isClaimOnly = amount.eq(0) && doClaim && rewards && (rewards.usdu.gt(0) || rewards.collateral.gt(0));

        const transactionData = {
          hash,
          type: (isClaimOnly ? "claim" : "withdraw") as "claim" | "withdraw",
          description: isClaimOnly
            ? createTransactionDescription("claim", {
                rewards,
                pool: collateralType,
              })
            : createTransactionDescription("withdraw", {
                amount: amount.toString(),
                token: "USDU",
              }),
          details: isClaimOnly
            ? {
                pool: collateralType,
                usduRewards: rewards?.usdu.toString(),
                collateralRewards: rewards?.collateral.toString(),
                collateralToken: getCollateral(collateralType).symbol,
                collateralOutputToken,
                ...(collateralOutputToken === "USDU" && expectedUsduAmount
                  ? { expectedUsduFromSwap: expectedUsduAmount.toString() }
                  : {}),
              }
            : {
                amount: amount.toString(),
                pool: collateralType,
                ...(doClaim && rewards && (rewards.usdu.gt(0) || rewards.collateral.gt(0)) ? {
                  usduRewards: rewards.usdu.toString(),
                  collateralRewards: rewards.collateral.toString(),
                  collateralToken: getCollateral(collateralType).symbol,
                  collateralOutputToken,
                  ...(collateralOutputToken === "USDU" && expectedUsduAmount
                    ? { expectedUsduFromSwap: expectedUsduAmount.toString() }
                    : {}),
                } : {}),
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
    doClaim,
    rewards,
    collateralOutputToken,
    swapQuote,
    sellToken,
    expectedUsduAmount,
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

  // Determine if we're ready to send
  // For USDU output, also need a valid quote if there are collateral rewards
  const hasCollateralRewards = rewards?.collateral && rewards.collateral.gt(0);
  const isReady =
    !!calls &&
    (collateralOutputToken === "COLLATERAL" ||
      !hasCollateralRewards ||
      (collateralOutputToken === "USDU" && !!swapQuote));

  return {
    ...transaction,
    ...transactionState,
    withdraw,
    isReady,
    isSending: transaction.isSending,
    // Swap quote info for UI
    expectedUsduAmount,
    isQuoteLoading,
    quoteError,
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
    retry: 0, // No retries on frontend - backend handles retries for RPC calls
  });

  // Return default structure if no data - dynamically build for all collaterals
  if (!data) {
    const result = {} as Record<CollateralId, null>;
    COLLATERAL_LIST.forEach((collateral) => {
      result[collateral.id] = null;
    });
    return result;
  }

  return data;
}
