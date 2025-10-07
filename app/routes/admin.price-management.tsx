import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useSendTransaction, useAccount } from "@starknet-react/core";
import { COLLATERALS } from "~/lib/collateral";
import { toast } from "sonner";
import { DollarSign, AlertCircle, TrendingUp, RefreshCcw } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { Skeleton } from "~/components/ui/skeleton";

function PriceManagement() {
  const { address } = useAccount();
  const [wbtcPrice, setWbtcPrice] = useState("");
  const [isPendingWBTC, setIsPendingWBTC] = useState(false);

  const { bitcoin, isLoading, refetchBitcoin } = useFetchPrices({
    collateralType: "WWBTC",
    fetchBitcoin: true,
    fetchUsdu: false,
  });

  const { send: sendWBTC } = useSendTransaction({
    calls: undefined,
  });

  const handleUpdateWBTCPrice = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!wbtcPrice || parseFloat(wbtcPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      setIsPendingWBTC(true);

      // Convert price to wei (18 decimals) and split into low/high for u256
      const priceValue = BigInt(Math.floor(parseFloat(wbtcPrice) * 10 ** 18));
      const low = priceValue & BigInt("0xffffffffffffffffffffffffffffffff");
      const high = priceValue >> BigInt(128);

      const calls = [
        {
          contractAddress: COLLATERALS.WWBTC.addresses.priceFeed,
          entrypoint: "set_price",
          calldata: [low.toString(), high.toString()], // Price as u256 (low, high)
        },
      ];

      await sendWBTC(calls);
      toast.success("wBTC price update transaction sent!");
      setWbtcPrice("");
    } catch (error) {
      console.error("Price update error:", error);
      toast.error("Failed to update wBTC price");
    } finally {
      setIsPendingWBTC(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">
          wBTC Price Management
        </h1>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Testing Only</strong>: This page allows manual wBTC price
          updates for testing liquidations. In production, prices are fetched
          from oracles.
        </AlertDescription>
      </Alert>

      <div className="max-w-md mx-auto space-y-6">
        {/* Current Price Display */}
        <Card className="border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current wBTC Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-600">From Price Feed</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="text-2xl font-bold text-slate-800">
                    ${bitcoin?.price.toFixed(2) || "0.00"}
                  </p>
                )}
              </div>
              <Button
                onClick={() => refetchBitcoin()}
                variant="ghost"
                size="icon"
                disabled={isLoading}
                className="h-8 w-8"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* wBTC Price Update */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              wBTC Price Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wbtc-price">New Price (USD)</Label>
              <NumericFormat
                customInput={Input}
                id="wbtc-price"
                placeholder="Enter wBTC price (e.g., 50000)"
                value={wbtcPrice}
                onValueChange={(values) => setWbtcPrice(values.value)}
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale={false}
                allowNegative={false}
                prefix="$"
              />
              <p className="text-sm text-slate-600">
                Set a lower price to trigger liquidations on
                under-collateralized positions.
              </p>
            </div>
            <Button
              onClick={handleUpdateWBTCPrice}
              disabled={isPendingWBTC || !address || !wbtcPrice}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isPendingWBTC ? "Updating..." : "Update wBTC Price"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {!address && (
        <Alert className="mt-6">
          <AlertDescription>
            Please connect your wallet to update prices.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default PriceManagement;

export function meta() {
  return [
    { title: "wBTC Price Management - Uncap Admin" },
    {
      name: "description",
      content: "Manage wBTC price for testing liquidations",
    },
  ];
}
