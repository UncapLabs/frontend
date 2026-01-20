import { useMemo, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useNextOwnerIndex } from "./use-next-owner-index";
import { useTransaction } from "./use-transaction";
import { useTransactionState } from "./use-transaction-state";
import type { Collateral, CollateralId } from "~/lib/collateral";
import { DEFAULT_COLLATERAL } from "~/lib/collateral";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { getTroveId, getPrefixedTroveId } from "~/lib/utils/trove-id";
import { bigToBigint } from "~/lib/decimal";
import Big from "big.js";
import { generateDepositCallsFromBigint } from "~/lib/collateral/wrapping";
import { useSwapQuote, type OutputToken } from "./use-swap-quote";
import { buildSwapCalls } from "~/lib/contracts/swap-calls";

const DEFAULT_INTEREST_RATE = new Big(2.5);

export interface BorrowFormData {
  collateralAmount?: Big;
  borrowAmount?: Big;
  interestRate: Big;
  selectedCollateralToken: string;
  rateMode: "manual" | "managed";
  interestBatchManager?: string;
  outputToken: OutputToken;
  expectedUsdcAmount?: bigint;
}

interface UseBorrowParams {
  collateralAmount?: Big;
  borrowAmount?: Big;
  interestRate: Big;
  collateral?: Collateral;
  onSuccess?: () => void;
  rateMode?: "manual" | "managed";
  interestBatchManagerAddress?: string;
  outputToken?: OutputToken;
}

export function useBorrow({
  collateralAmount,
  borrowAmount,
  interestRate,
  collateral,
  onSuccess,
  rateMode = "manual",
  interestBatchManagerAddress,
  outputToken = "USDU",
}: UseBorrowParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();

  // Get the USDU amount in bigint for swap quote
  const usduAmount = borrowAmount ? bigToBigint(borrowAmount, 18) : undefined;

  // Fetch swap quote when outputToken is USDC
  const {
    quote: swapQuote,
    expectedUsdcAmount,
    isLoading: isQuoteLoading,
    error: quoteError,
  } = useSwapQuote({
    usduAmount,
    outputToken,
    enabled: !!borrowAmount && borrowAmount.gt(0),
  });

  const defaultBatchManager =
    rateMode === "managed"
      ? interestBatchManagerAddress ??
        collateral?.defaultInterestManager ??
        collateral?.addresses.batchManager
      : undefined;

  const { nextOwnerIndex, isLoading: isLoadingNextOwnerIndex } =
    useNextOwnerIndex({
      address,
      collateralType: collateral?.id as CollateralId,
    });

  // Transaction state management
  const transactionState = useTransactionState<BorrowFormData>({
    initialFormData: {
      collateralAmount: undefined,
      borrowAmount: undefined,
      interestRate: DEFAULT_INTEREST_RATE, // Default to 2.5% APR as Big instance
      selectedCollateralToken: collateral?.symbol || DEFAULT_COLLATERAL.id,
      rateMode,
      interestBatchManager: defaultBatchManager,
      outputToken,
    },
  });

  // Prepare the calls
  const calls = useMemo(() => {
    if (
      !address ||
      !collateralAmount ||
      !borrowAmount ||
      !collateral ||
      isLoadingNextOwnerIndex ||
      nextOwnerIndex === undefined
    ) {
      return undefined;
    }

    // Get addresses for this collateral
    const addresses = collateral.addresses;

    // Convert to bigint for contract calls
    // For wrapped tokens, user input is in underlying decimals (e.g., 8)
    // For standard tokens, use collateral decimals (18)
    const inputDecimals =
      collateral.underlyingToken?.decimals || collateral.decimals;
    const collAmountBigint = bigToBigint(collateralAmount, inputDecimals);

    // Convert to wrapped decimals (18) for contract
    const wrappedAmount = collateral.underlyingToken
      ? collAmountBigint *
        10n ** (BigInt(collateral.decimals) - BigInt(inputDecimals))
      : collAmountBigint;

    // Generate deposit calls (handles wrapping if needed)
    const depositCalls = generateDepositCallsFromBigint(
      collateral,
      wrappedAmount,
      addresses.borrowerOperations
    );

    const isManaged = rateMode === "managed";
    const defaultInterestManager =
      collateral.defaultInterestManager ?? addresses.batchManager;
    const batchManager = isManaged
      ? interestBatchManagerAddress ?? defaultInterestManager
      : undefined;
    const usduAmount = bigToBigint(borrowAmount, 18);

    const openCall = isManaged && batchManager
      ? contractCall.borrowerOperations.openTroveAndJoinInterestBatchManager({
          owner: address,
          ownerIndex: nextOwnerIndex,
          collAmount: wrappedAmount,
          usduAmount,
          collateralType: collateral.id as CollateralId,
          interestBatchManager: batchManager,
          maxUpfrontFee: 2n ** 256n - 1n,
        })
      : contractCall.borrowerOperations.openTrove({
          owner: address,
          ownerIndex: nextOwnerIndex,
          collAmount: wrappedAmount,
          usduAmount,
          annualInterestRate: bigToBigint(interestRate.div(100), 18),
          collateralType: collateral.id as CollateralId,
          maxUpfrontFee: 2n ** 256n - 1n,
        });

    // Add the openTrove call
    return [
      ...depositCalls,
      openCall,
    ];
  }, [
    address,
    collateralAmount,
    borrowAmount,
    collateral,
    isLoadingNextOwnerIndex,
    nextOwnerIndex,
    interestRate,
    rateMode,
    interestBatchManagerAddress,
  ]);

  // Use the generic transaction hook
  const transaction = useTransaction();

  // Create a wrapped send function that manages state transitions
  const send = useCallback(async () => {
    if (!calls) {
      throw new Error("Transaction not ready");
    }

    let finalCalls = calls;

    // If outputToken is USDC and we have a quote, append swap calls
    if (outputToken === "USDC" && swapQuote && address) {
      try {
        const swapResult = await buildSwapCalls(swapQuote, address);
        finalCalls = [...calls, ...swapResult.calls];
      } catch (error) {
        console.error("Failed to build swap calls:", error);
        throw new Error("Failed to prepare swap transaction");
      }
    }

    // Send the transaction
    const hash = await transaction.send(finalCalls);

    if (hash) {
      const effectiveBatchManager =
        rateMode === "managed"
          ? interestBatchManagerAddress ?? collateral?.defaultInterestManager
          : undefined;

      // Transaction was sent successfully, move to pending
      // Now we update the form data since user accepted
      transactionState.updateFormData({
        collateralAmount,
        borrowAmount,
        interestRate,
        selectedCollateralToken: collateral?.symbol || DEFAULT_COLLATERAL.id,
        rateMode,
        interestBatchManager: effectiveBatchManager,
        outputToken,
        expectedUsdcAmount: outputToken === "USDC" ? expectedUsdcAmount ?? undefined : undefined,
      });
      transactionState.setPending(hash);

      // Add to transaction store
      if (address && collateral) {
        // Compute the troveId if we have the necessary data
        let troveId: string | undefined;

        if (nextOwnerIndex !== undefined) {
          const computedTroveId = getTroveId(address, nextOwnerIndex);
          const branchId = collateral.branchId;
          troveId = getPrefixedTroveId(branchId, computedTroveId);
        }

        const transactionData = {
          hash,
          type: "borrow" as const,
          description: createTransactionDescription("borrow", {
            collateralAmount,
            borrowAmount,
            interestRate,
            collateralToken: collateral.symbol,
            batchManager: effectiveBatchManager,
          }),
          details: {
            collateralAmount,
            borrowAmount,
            interestRate,
            collateralToken: collateral.symbol,
            collateralType: collateral.id,
            rateMode,
            batchManager: effectiveBatchManager,
            ...(troveId && {
              troveId,
              ownerIndex: nextOwnerIndex?.toString(), // Convert BigInt to string for JSON serialization
            }),
          },
        };

        transactionStore.addTransaction(address, transactionData);
      }
    }
    // If no hash returned, transaction.send already handles the error
  }, [
    calls,
    transaction,
    transactionState,
    transactionStore,
    collateralAmount,
    borrowAmount,
    interestRate,
    collateral,
    address,
    nextOwnerIndex,
    rateMode,
    interestBatchManagerAddress,
    outputToken,
    swapQuote,
  ]);

  // Check if we need to update state based on transaction status
  // This is purely derived state - no side effects
  if (transactionState.currentState === "pending") {
    // Check active transaction first
    if (transaction.isSuccess) {
      transactionState.setSuccess();

      // Call custom onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } else if (transaction.isError && transaction.error) {
      transactionState.setError(transaction.error);
    }
  }

  // Determine if we're ready to send
  // For USDC output, we also need a valid quote
  const isReady =
    !!calls &&
    (outputToken === "USDU" || (outputToken === "USDC" && !!swapQuote));

  return {
    ...transaction,
    ...transactionState,
    send, // Override send with our wrapped version
    isReady,
    // Pass through isSending for UI state
    isSending: transaction.isSending,
    // Swap quote info for UI
    expectedUsdcAmount,
    isQuoteLoading,
    quoteError,
  };
}
