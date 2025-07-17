import { useTransaction } from "~/hooks/use-transaction";
import { contractCall } from "~/lib/contracts/calls";
import { toast } from "sonner";

interface UseCloseTroveParams {
  troveId?: bigint;
  debt?: number;
}

export function useCloseTrove({ troveId, debt }: UseCloseTroveParams) {
  const closeTroveCall = troveId
    ? contractCall.borrowerOperations.closeTrove(troveId)
    : undefined;

  const {
    send: sendCloseTrove,
    isPending,
    isSending,
    isError,
    error,
    transactionHash,
    isSuccess,
  } = useTransaction({
    contractCall: closeTroveCall,
    onSuccess: () => {
      toast.success("Position closed successfully!");
    },
    onError: (error) => {
      console.error("Failed to close position:", error);
      toast.error("Failed to close position. Please try again.");
    },
  });

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