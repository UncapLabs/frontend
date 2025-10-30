import { useCallback, useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useTransaction } from "./use-transaction";
import { useTransactionState } from "./use-transaction-state";
import { useTransactionStore } from "~/providers/transaction-provider";
import { createTransactionDescription } from "~/lib/transaction-descriptions";
import { bigintToBig } from "~/lib/decimal";
import { TOKENS } from "~/lib/collateral";
import { CLAIM_DISTRIBUTOR_ADDRESS } from "~/lib/contracts/constants";
import { toHexAddress } from "~/lib/utils/address";
import { useTRPC } from "~/lib/trpc";
import { useQuery } from "@tanstack/react-query";

const DUMMY_ADDRESS = "0x0";

interface UseClaimStrkParams {
  amount?: string;
  proof?: string[];
  enabled?: boolean;
  onSuccess?: () => void;
}

export function useClaimStrk({
  amount,
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
      !amount ||
      !proof ||
      proof.length === 0 ||
      !CLAIM_DISTRIBUTOR_ADDRESS
    ) {
      return undefined;
    }

    try {
      const amountBigint = BigInt(amount);
      const call = contractCall.claimDistributor.claim(amountBigint, proof);
      return { calls: [call], amountBigint };
    } catch (error) {
      console.error("Failed to prepare STRK claim call:", error);
      return undefined;
    }
  }, [address, amount, proof, enabled, CLAIM_DISTRIBUTOR_ADDRESS]);

  const transaction = useTransaction(preparedCall?.calls);

  const send = useCallback(async () => {
    if (!preparedCall?.calls) {
      throw new Error("Claim transaction not ready");
    }

    const hash = await transaction.send();

    if (hash && address && preparedCall) {
      transactionState.updateFormData({ amount });
      transactionState.setPending(hash);

      const formattedAmount = bigintToBig(
        preparedCall.amountBigint,
        TOKENS.STRK.decimals
      );

      transactionStore.addTransaction(address, {
        hash,
        type: "claim",
        description: createTransactionDescription("claim", {
          amount: formattedAmount.toFixed(4),
          token: TOKENS.STRK.symbol,
        }),
        details: {
          amount: formattedAmount.toString(),
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
    amount,
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

  // Data comes as Big from TRPC, convert to bigint
  const alreadyClaimed = data ? BigInt(data.toFixed(0)) : 0n;

  return {
    alreadyClaimed,
    isLoading,
    isError,
    refetch,
  };
}
