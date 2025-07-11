import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useOwnerPositions } from "./use-owner-positions";
import { useTransaction } from "./use-transaction";
import { BORROWER_OPERATIONS_ADDRESS } from "~/lib/contracts/constants";

interface UseBorrowParams {
  collateralAmount?: number;
  borrowAmount?: number;
  annualInterestRate: bigint;
}

export function useBorrow({
  collateralAmount,
  borrowAmount,
  annualInterestRate,
}: UseBorrowParams) {
  const { address } = useAccount();
  const { ownerIndex, isLoadingOwnerPositions } = useOwnerPositions();

  // Prepare the calls using our new abstraction
  const calls = useMemo(() => {
    if (
      !address ||
      !collateralAmount ||
      !borrowAmount ||
      isLoadingOwnerPositions ||
      ownerIndex === undefined
    ) {
      return undefined;
    }

    return [
      // 1. Approve TBTC spending
      contractCall.tbtc.approve(
        BORROWER_OPERATIONS_ADDRESS,
        BigInt(Math.floor(collateralAmount * 1e18))
      ),

      // 2. Open trove
      contractCall.borrowerOperations.openTrove({
        owner: address,
        ownerIndex: ownerIndex,
        collAmount: BigInt(Math.floor(collateralAmount * 1e18)),
        bitUsdAmount: BigInt(Math.floor(borrowAmount * 1e18)),
        annualInterestRate,
      }),
    ];
  }, [
    address,
    collateralAmount,
    borrowAmount,
    isLoadingOwnerPositions,
    ownerIndex,
    annualInterestRate,
  ]);

  // Use the generic transaction hook
  const transaction = useTransaction(calls);

  return {
    ...transaction,
    isReady: !!calls,
  };
}
