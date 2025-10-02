import {
  useAccount,
  useBalance,
  useContract,
  useSendTransaction,
} from "@starknet-react/core";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { UBTC_ABI } from "~/lib/contracts";
import { COLLATERALS, type CollateralId } from "~/lib/collateral";

export function GetTestBtc() {
  const { address } = useAccount();
  const [selectedToken, setSelectedToken] = useState<CollateralId>("UBTC");
  const [amount, setAmount] = useState<string>("1");

  // For WMWBTC, we mint the underlying token (8 decimals)
  const tokenConfig =
    selectedToken === "UBTC"
      ? COLLATERALS.UBTC
      : selectedToken === "GBTC"
      ? COLLATERALS.GBTC
      : selectedToken === "WMWBTC"
      ? {
          address: COLLATERALS.WMWBTC.underlyingToken!.address,
          symbol: "wBTC",
          decimals: COLLATERALS.WMWBTC.underlyingToken!.decimals,
        }
      : COLLATERALS.UBTC;
  
  const { data: balance } = useBalance({
    address,
    token: tokenConfig.address,
  });
  
  const { contract } = useContract({
    abi: UBTC_ABI,
    address: tokenConfig.address,
  });

  // Use correct decimals for minting
  const decimals = tokenConfig.decimals;
  const mintAmount = amount
    ? BigInt(Math.floor(parseFloat(amount) * 10 ** decimals))
    : 0n;

  const { send, isPending } = useSendTransaction({
    calls:
      contract && address && mintAmount > 0n
        ? [contract.populate("mint", [address, mintAmount])]
        : undefined,
    onSuccess: () => {
      toast.success(`Successfully minted ${amount} ${selectedToken}`);
    },
    onError: () => {
      toast.error(`Failed to mint ${selectedToken}`);
    },
  });

  const handleMint = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (contract && address) {
      send();
    }
  };

  const displayTokenName = tokenConfig.symbol;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only positive numbers with decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  if (!address) {
    return null;
  }

  const currentBalance = balance
    ? (Number(balance.value) / 10 ** decimals).toFixed(decimals === 8 ? 8 : 4)
    : "0";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Mint Test Collateral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token">Select Token</Label>
          <Select
            value={selectedToken}
            onValueChange={(value) => setSelectedToken(value as CollateralId)}
          >
            <SelectTrigger id="token">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UBTC">UBTC</SelectItem>
              <SelectItem value="GBTC">GBTC</SelectItem>
              <SelectItem value="WMWBTC">wBTC (8 decimals)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount to Mint</Label>
          <Input
            id="amount"
            type="text"
            placeholder="Enter amount"
            value={amount}
            onChange={handleAmountChange}
            disabled={isPending}
          />
          <p className="text-sm text-muted-foreground">
            Current balance: {currentBalance} {displayTokenName}
          </p>
        </div>

        <Button
          onClick={handleMint}
          disabled={!contract || isPending || !amount || parseFloat(amount) <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isPending ? `Minting ${displayTokenName}...` : `Mint ${amount} ${displayTokenName}`}
        </Button>
      </CardContent>
    </Card>
  );
}
