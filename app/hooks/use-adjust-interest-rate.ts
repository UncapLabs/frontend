import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { useTransaction } from "./use-transaction";
import { Contract } from "starknet";
import { BORROWER_OPERATIONS_ABI } from "~/lib/contracts";
import { BORROWER_OPERATIONS_ADDRESS } from "~/lib/contracts/constants";

interface UseAdjustInterestRateParams {
  troveId?: bigint;
  newAnnualInterestRate?: bigint;
  maxUpfrontFee?: bigint;
}

export function useAdjustInterestRate({
  troveId,
  newAnnualInterestRate,
  maxUpfrontFee = 2n ** 256n - 1n,
}: UseAdjustInterestRateParams) {
  const { address } = useAccount();

  // Prepare the calls
  const calls = useMemo(() => {
    if (!address || !troveId || newAnnualInterestRate === undefined) {
      return undefined;
    }

    // Create contract instance for adjust_trove_interest_rate
    const contract = new Contract(
      BORROWER_OPERATIONS_ABI,
      BORROWER_OPERATIONS_ADDRESS
    );

    // For now, we'll use empty hints (0, 0) as finding the exact position
    // in the sorted list would require additional contract reads
    const upperHint = 0n;
    const lowerHint = 0n;

    return [
      contract.populate("adjust_trove_interest_rate", [
        troveId,
        newAnnualInterestRate,
        upperHint,
        lowerHint,
        maxUpfrontFee,
      ]),
    ];
  }, [address, troveId, newAnnualInterestRate, maxUpfrontFee]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  return {
    ...transaction,
    isReady: !!calls,
  };
}
