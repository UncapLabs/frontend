import { useMemo } from "react";
import { useAccount, useContract } from "@starknet-react/core";
import {
  TBTC_ABI,
  TBTC_ADDRESS,
  BORROWER_OPERATIONS_ABI,
  BORROWER_OPERATIONS_ADDRESS,
} from "~/lib/constants";
import { useOwnerPositions } from "./use-owner-positions";
import { useTransaction } from "./use-transaction";

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

  const { contract: tbtcContract } = useContract({
    abi: TBTC_ABI,
    address: TBTC_ADDRESS,
  });

  const { contract: borrowerContract } = useContract({
    abi: BORROWER_OPERATIONS_ABI,
    address: BORROWER_OPERATIONS_ADDRESS,
  });

  // Prepare the calls
  const calls = useMemo(() => {
    if (
      !tbtcContract ||
      !borrowerContract ||
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
      tbtcContract.populate("approve", [
        BORROWER_OPERATIONS_ADDRESS,
        BigInt(Math.floor(collateralAmount * 1e18)),
      ]),
      // 2. Open trove
      borrowerContract.populate("open_trove", [
        address, // owner
        ownerIndex, // owner_index
        BigInt(Math.floor(collateralAmount * 1e18)), // coll_amount
        BigInt(Math.floor(borrowAmount * 1e18)), // bitusd_amount
        0n, // upper_hint
        0n, // lower_hint
        annualInterestRate, // annual_interest_rate
        BigInt(2) ** BigInt(256) - BigInt(1), // max_upfront_fee
        "0x0", // add_manager
        "0x0", // remove_manager
        "0x0", // receiver
      ]),
    ];
  }, [
    tbtcContract,
    borrowerContract,
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