import { useTransaction } from "~/hooks/use-transaction";
import { contractCall } from "~/lib/contracts/calls";
import { toast } from "sonner";
import { type CollateralType } from "~/lib/contracts/constants";

interface UseCloseTroveParams {
  troveId?: bigint;
  debt?: number;
  collateralType?: CollateralType;
}

export function useCloseTrove({ troveId, debt, collateralType = "UBTC" }: UseCloseTroveParams) {
  const closeTroveCall = troveId
    ? contractCall.borrowerOperations.closeTrove(troveId, collateralType)
    : undefined;

  const {
    send: sendCloseTrove,
    isPending,
    isSending,
    isError,
    error,
    transactionHash,
    isSuccess,
  } = useTransaction(closeTroveCall ? [closeTroveCall] : undefined);

  // Handle success/error with toast
  if (isSuccess) {
    toast.success("Position closed successfully!");
  }
  if (isError && error) {
    console.error("Failed to close position:", error);
    toast.error("Failed to close position. Please try again.");
  }

  const isReady = !!troveId && !!debt && debt > 0;

  return {
    send: sendCloseTrove,
    isPending,
    isSending,
    isError,
    error,
    transactionHash,
    isSuccess,
    isReady,
  };
}