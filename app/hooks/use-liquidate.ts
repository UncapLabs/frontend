import { useSendTransaction, useAccount } from "@starknet-react/core";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { COLLATERAL_ADDRESSES } from "~/lib/contracts/constants";
import type { CollateralType } from "~/lib/contracts/constants";

interface UseLiquidateProps {
  troveId: string;
  collateralType: CollateralType;
}

export function useLiquidate({ troveId, collateralType }: UseLiquidateProps) {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);

  const troveManagerAddress = COLLATERAL_ADDRESSES[collateralType].troveManager;

  const { send, data: transactionHash } = useSendTransaction({
    calls: undefined,
  });

  const liquidate = useCallback(async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsPending(true);
      
      console.log("Liquidating trove:", troveId, "on", collateralType);
      console.log("TroveManager address:", troveManagerAddress);

      // Parse the trove ID - it's in format "1:0x..." or just "0x..."
      let troveIdHex = troveId;
      if (troveId.includes(':')) {
        // Extract the hex part after the colon
        troveIdHex = troveId.split(':')[1];
      }
      
      // Ensure it starts with 0x
      if (!troveIdHex.startsWith('0x')) {
        troveIdHex = '0x' + troveIdHex;
      }

      // Convert hex string to BigInt and split into low and high for u256
      const troveIdBigInt = BigInt(troveIdHex);
      const low = (troveIdBigInt & BigInt("0xffffffffffffffffffffffffffffffff")).toString();
      const high = (troveIdBigInt >> BigInt(128)).toString();

      const calls = [
        {
          contractAddress: troveManagerAddress,
          entrypoint: "batch_liquidate_troves",
          calldata: [
            "1", // Array length (1 trove)
            low, // Trove ID low
            high, // Trove ID high
          ],
        },
      ];

      console.log("Parsed trove ID:", troveIdHex, "-> low:", low, "high:", high);
      console.log("Sending liquidation call with calldata:", calls[0].calldata);

      await send(calls);

      toast.success("Liquidation transaction sent!");
    } catch (error) {
      console.error("Liquidation error:", error);
      toast.error("Failed to liquidate trove");
    } finally {
      setIsPending(false);
    }
  }, [address, troveManagerAddress, troveId, send]);

  return {
    liquidate,
    isPending,
    transactionHash,
  };
}
