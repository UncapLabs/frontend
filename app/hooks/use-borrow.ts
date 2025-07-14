import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { contractCall } from "~/lib/contracts/calls";
import { useOwnerPositions } from "./use-owner-positions";
import { useTransaction } from "./use-transaction";
import { BORROWER_OPERATIONS_ADDRESS } from "~/lib/contracts/constants";
import type { Token } from "~/components/token-input";

interface UseBorrowParams {
  collateralAmount?: number;
  borrowAmount?: number;
  annualInterestRate: bigint;
  collateralToken?: Token;
}

export function useBorrow({
  collateralAmount,
  borrowAmount,
  annualInterestRate,
  collateralToken,
}: UseBorrowParams) {
  const { address } = useAccount();
  const { ownerIndex, isLoadingOwnerPositions } = useOwnerPositions();

  // Prepare the calls using our new abstraction
  const calls = useMemo(() => {
    if (
      !address ||
      !collateralAmount ||
      !borrowAmount ||
      !collateralToken ||
      isLoadingOwnerPositions ||
      ownerIndex === undefined
    ) {
      return undefined;
    }

    return [
      // 1. Approve collateral token spending
      contractCall.token.approve(
        collateralToken.address,
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
    collateralToken,
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
