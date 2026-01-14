import { useAccount, useContract, useSendTransaction } from "@starknet-react/core";
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
import { MOCK_PRICE_FEED_ABI } from "~/lib/contracts";
import {
  COLLATERALS,
  COLLATERAL_LIST,
  DEFAULT_COLLATERAL,
  type CollateralId,
} from "~/lib/collateral";
import { useCollateralPrice } from "~/hooks/use-fetch-prices";

export function SetTestPrice() {
  const { address } = useAccount();
  const [selectedCollateral, setSelectedCollateral] = useState<CollateralId>(
    DEFAULT_COLLATERAL.id
  );
  const [priceInput, setPriceInput] = useState<string>("97000");

  // Get the config for the selected collateral
  const collateralConfig = COLLATERALS[selectedCollateral] || DEFAULT_COLLATERAL;
  const priceFeedAddress = collateralConfig.addresses.priceFeed;

  // Get current price
  const currentPriceData = useCollateralPrice(selectedCollateral);
  const currentPrice = currentPriceData?.price;

  const { contract } = useContract({
    abi: MOCK_PRICE_FEED_ABI,
    address: priceFeedAddress,
  });

  // Price is stored with 18 decimals
  const priceWithDecimals = priceInput
    ? BigInt(Math.floor(parseFloat(priceInput) * 10 ** 18))
    : 0n;

  const { send, isPending } = useSendTransaction({
    calls:
      contract && address && priceWithDecimals > 0n
        ? [contract.populate("set_price", [priceWithDecimals])]
        : undefined,
    onSuccess: () => {
      toast.success(
        `Successfully set ${collateralConfig.symbol} price to $${priceInput}`
      );
    },
    onError: (error) => {
      console.error("Failed to set price:", error);
      toast.error(`Failed to set price for ${collateralConfig.symbol}`);
    },
  });

  const handleSetPrice = () => {
    if (!priceInput || parseFloat(priceInput) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (contract && address) {
      send();
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only positive numbers with decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPriceInput(value);
    }
  };

  if (!address) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Set Test Price</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="collateral">Select Collateral</Label>
          <Select
            value={selectedCollateral}
            onValueChange={(value) => setSelectedCollateral(value as CollateralId)}
          >
            <SelectTrigger id="collateral">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLLATERAL_LIST.map((collateral) => (
                <SelectItem key={collateral.id} value={collateral.id}>
                  {collateral.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="text"
            placeholder="Enter price in USD"
            value={priceInput}
            onChange={handlePriceChange}
            disabled={isPending}
          />
          <p className="text-sm text-muted-foreground">
            Current price:{" "}
            {currentPrice ? `$${currentPrice.toFixed(2)}` : "Loading..."}
          </p>
        </div>

        <Button
          onClick={handleSetPrice}
          disabled={
            !contract || isPending || !priceInput || parseFloat(priceInput) <= 0
          }
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          {isPending
            ? `Setting price...`
            : `Set ${collateralConfig.symbol} Price to $${priceInput}`}
        </Button>
      </CardContent>
    </Card>
  );
}
