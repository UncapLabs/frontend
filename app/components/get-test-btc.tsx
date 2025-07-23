import {
  useAccount,
  useBalance,
  useContract,
  useSendTransaction,
} from "@starknet-react/core";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { UBTC_ABI } from "~/lib/contracts";
import { UBTC_TOKEN } from "~/lib/contracts/constants";

export function GetTestBtc() {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
    token: UBTC_TOKEN.address,
  });
  const { contract } = useContract({
    abi: UBTC_ABI,
    address: UBTC_TOKEN.address,
  });

  const { send, isPending } = useSendTransaction({
    calls:
      contract && address
        ? [contract.populate("mint", [address, 1000000000000000000n])] // Mint 1 testBTC (1 * 10^18)
        : undefined,
    onSuccess: () => {
      toast.success("Successfully minted 1 testBTC");
    },
    onError: () => {
      toast.error("Failed to mint testBTC");
    },
  });

  const handleMint = () => {
    if (contract && address) {
      send();
    }
  };

  if (!address) {
    return null;
  }

  // Don't show button if user has 1 UBTC or more
  const hasEnoughBalance = balance && balance.value >= 1000000000000000000n;
  if (hasEnoughBalance) {
    return null;
  }

  return (
    <Button
      onClick={handleMint}
      disabled={!contract || isPending}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isPending ? "Minting..." : "Mint UBTC"}
    </Button>
  );
}
