import { useCallback, useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useTransaction } from "./use-transaction";
import { useTransactionState } from "./use-transaction-state";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { bigToBigint } from "~/lib/decimal";
import { TOKENS, type Token } from "~/lib/collateral";
import { CLAIM_DISTRIBUTOR_ADDRESS } from "~/lib/contracts/constants";
import { toHexAddress } from "~/lib/utils/address";
import { useTRPC } from "~/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import type Big from "big.js";
import { useSwapQuote } from "./use-swap-quote";
import { buildSwapCalls } from "~/lib/contracts/swap-calls";

const DUMMY_ADDRESS = "0x0";

export type StrkOutputToken = "STRK" | "USDU" | "WBTC";

interface UseClaimStrkParams {
  cumulativeAmount?: Big; // Cumulative amount from backend (for contract call)
  claimableAmount?: Big; // The actual amount being claimed (for display)
  proof?: string[];
  outputToken?: StrkOutputToken;
  enabled?: boolean;
  onSuccess?: () => void;
}

// Helper to get the buy token based on output selection
function getBuyToken(outputToken: StrkOutputToken): Token {
  switch (outputToken) {
    case "USDU":
      return TOKENS.USDU;
    case "WBTC":
      return TOKENS.WBTC;
    default:
      return TOKENS.STRK;
  }
}

export function useClaimStrk({
  cumulativeAmount,
  claimableAmount,
  proof,
  outputToken = "STRK",
  enabled = true,
  onSuccess,
}: UseClaimStrkParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();
  const transactionState = useTransactionState({
    initialFormData: {
      amount: undefined as string | undefined,
      outputToken: outputToken as StrkOutputToken,
      expectedOutputAmount: undefined as string | undefined,
    },
  });

  // Get claimable amount as bigint for swap quote
  const claimableAmountBigint = claimableAmount
    ? bigToBigint(claimableAmount, TOKENS.STRK.decimals)
    : undefined;

  // Determine the buy token
  const buyToken = getBuyToken(outputToken);

  // Fetch swap quote when outputToken is not STRK
  const {
    quote: swapQuote,
    expectedOutputAmount,
    isLoading: isQuoteLoading,
    error: quoteError,
  } = useSwapQuote({
    sellToken: TOKENS.STRK,
    buyToken,
    sellAmount: claimableAmountBigint,
    enabled:
      enabled &&
      outputToken !== "STRK" &&
      !!claimableAmount &&
      claimableAmount.gt(0),
  });

  const preparedCall = useMemo(() => {
    if (
      !enabled ||
      !address ||
      !cumulativeAmount ||
      !proof ||
      proof.length === 0 ||
      !CLAIM_DISTRIBUTOR_ADDRESS
    ) {
      return undefined;
    }

    try {
      // Convert Big to bigint for contract call
      const amountBigint = bigToBigint(cumulativeAmount, TOKENS.STRK.decimals);
      const call = contractCall.claimDistributor.claim(amountBigint, proof);

      return { calls: [call], amountBigint };
    } catch (error) {
      console.error("Failed to prepare STRK claim call:", error);
      return undefined;
    }
  }, [address, cumulativeAmount, proof, enabled]);

  const transaction = useTransaction();

  const send = useCallback(async () => {
    if (!preparedCall?.calls) {
      throw new Error("Claim transaction not ready");
    }

    let finalCalls = preparedCall.calls;

    // If swapping, append swap calls after claim
    if (outputToken !== "STRK" && swapQuote && address) {
      try {
        const swapResult = await buildSwapCalls({
          quote: swapQuote,
          takerAddress: address,
          sellSymbol: TOKENS.STRK.symbol,
          buySymbol: buyToken.symbol,
        });
        finalCalls = [...preparedCall.calls, ...swapResult.calls];
      } catch (error) {
        console.error("Failed to build swap calls:", error);
        throw new Error("Failed to prepare swap transaction");
      }
    }

    const hash = await transaction.send(finalCalls);

    if (hash && address && claimableAmount) {
      // Store the claimable amount (not cumulative) for display
      const claimableBigint = bigToBigint(
        claimableAmount,
        TOKENS.STRK.decimals
      );
      transactionState.updateFormData({
        amount: claimableBigint.toString(),
        outputToken,
        expectedOutputAmount:
          outputToken !== "STRK" ? expectedOutputAmount?.toString() : undefined,
      });
      transactionState.setPending(hash);

      // Determine the token being received
      const receivedToken =
        outputToken === "STRK" ? TOKENS.STRK.symbol : buyToken.symbol;

      transactionStore.addTransaction(address, {
        hash,
        type: "claim",
        description: createTransactionDescription("claim", {
          amount: claimableAmount.toFixed(4),
          token: TOKENS.STRK.symbol,
        }),
        details: {
          amount: claimableAmount.toString(),
          token: TOKENS.STRK.symbol,
          receivedToken,
          outputToken,
          proofLength: proof?.length ?? 0,
        },
      });
    }

    return hash;
  }, [
    transaction,
    transactionState,
    transactionStore,
    preparedCall,
    address,
    claimableAmount,
    proof,
    outputToken,
    swapQuote,
    buyToken,
    expectedOutputAmount,
  ]);

  if (transactionState.currentState === "pending") {
    if (transaction.isSuccess) {
      transactionState.setSuccess();
      onSuccess?.();
    } else if (transaction.isError && transaction.error) {
      transactionState.setError(transaction.error);
    }
  }

  // For STRK output, ready when we have the claim call
  // For swap output, also need a valid quote
  const isReady =
    !!preparedCall?.calls &&
    (outputToken === "STRK" || (outputToken !== "STRK" && !!swapQuote));

  return {
    ...transaction,
    ...transactionState,
    send,
    isReady,
    // Swap quote info for UI
    expectedOutputAmount,
    isQuoteLoading,
    quoteError,
  };
}

export function useStrkAlreadyClaimed() {
  const { address } = useAccount();
  const trpc = useTRPC();
  const normalizedAddress = address ? toHexAddress(address) : undefined;
  const enabled = Boolean(normalizedAddress);

  const { data, isLoading, isError, refetch } = useQuery({
    ...trpc.claimRouter.getAmountAlreadyClaimed.queryOptions(
      {
        address: normalizedAddress ?? DUMMY_ADDRESS,
      },
      {
        enabled,
      }
    ),
    enabled,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  });

  // Data comes back as Big from TRPC, keep it as Big
  return {
    alreadyClaimed: data,
    isLoading,
    isError,
    refetch,
  };
}
