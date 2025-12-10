import { useCallback, useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useTransaction } from "./use-transaction";
import { useTransactionState } from "./use-transaction-state";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { bigToBigint } from "~/lib/decimal";
import { TOKENS } from "~/lib/collateral";
import { CLAIM_DISTRIBUTOR_ADDRESS } from "~/lib/contracts/constants";
import { toHexAddress } from "~/lib/utils/address";
import { useTRPC } from "~/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import type Big from "big.js";

const DUMMY_ADDRESS = "0x0";

interface UseClaimStrkParams {
  cumulativeAmount?: Big; // Cumulative amount from backend (for contract call)
  claimableAmount?: Big; // The actual amount being claimed (for display)
  proof?: string[];
  enabled?: boolean;
  onSuccess?: () => void;
}

export function useClaimStrk({
  cumulativeAmount,
  claimableAmount,
  proof,
  enabled = true,
  onSuccess,
}: UseClaimStrkParams) {
  const { address } = useAccount();
  const transactionStore = useTransactionStore();
  const transactionState = useTransactionState({
    initialFormData: {
      amount: undefined as string | undefined,
    },
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

  const transaction = useTransaction(preparedCall?.calls);

  const send = useCallback(async () => {
    if (!preparedCall?.calls) {
      throw new Error("Claim transaction not ready");
    }

    const hash = await transaction.send();

    if (hash && address && claimableAmount) {
      // Store the claimable amount (not cumulative) for display
      const claimableBigint = bigToBigint(
        claimableAmount,
        TOKENS.STRK.decimals
      );
      transactionState.updateFormData({ amount: claimableBigint.toString() });
      transactionState.setPending(hash);

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
  ]);

  if (transactionState.currentState === "pending") {
    if (transaction.isSuccess) {
      transactionState.setSuccess();
      onSuccess?.();
    } else if (transaction.isError && transaction.error) {
      transactionState.setError(transaction.error);
    }
  }

  return {
    ...transaction,
    ...transactionState,
    send,
    isReady: !!preparedCall?.calls,
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
