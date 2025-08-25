import { useSendTransaction, useAccount } from "@starknet-react/core";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { CollateralType } from "~/lib/contracts/constants";
import { contractCall } from "~/lib/contracts/calls";

interface UseClaimSurplusProps {
  collateralType: CollateralType;
}

export function useClaimSurplus({ collateralType }: UseClaimSurplusProps) {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);

  // Prepare the contract call
  const calls = useMemo(() => {
    if (!address) return undefined;
    
    return [
      contractCall.borrowerOperations.claimCollateral(address, collateralType)
    ];
  }, [address, collateralType]);

  const { send, data: transactionHash } = useSendTransaction({
    calls,
  });

  const claimSurplus = useCallback(async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!calls) {
      toast.error("Unable to prepare transaction");
      return;
    }

    try {
      setIsPending(true);
      
      console.log("Claiming collateral surplus for:", address);
      console.log("Collateral type:", collateralType);

      await send();
      
      toast.success("Claim surplus transaction sent!");
    } catch (error) {
      console.error("Claim surplus error:", error);
      toast.error("Failed to claim collateral surplus");
    } finally {
      setIsPending(false);
    }
  }, [address, calls, send, collateralType]);

  return {
    claimSurplus,
    isPending,
    transactionHash,
  };
}