import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useSendTransaction, useAccount } from "@starknet-react/core";
import { COLLATERAL_ADDRESSES } from "~/lib/contracts/constants";
import { toast } from "sonner";
import { DollarSign, AlertCircle } from "lucide-react";
import { NumericFormat } from "react-number-format";

function PriceManagement() {
  const { address } = useAccount();
  const [gbtcPrice, setGbtcPrice] = useState("");
  const [isPendingGBTC, setIsPendingGBTC] = useState(false);

  const { send: sendGBTC } = useSendTransaction({
    calls: undefined,
  });

  const handleUpdateGBTCPrice = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!gbtcPrice || parseFloat(gbtcPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      setIsPendingGBTC(true);
      
      // Convert price to wei (18 decimals) and split into low/high for u256
      const priceValue = BigInt(Math.floor(parseFloat(gbtcPrice) * 10 ** 18));
      const low = priceValue & BigInt("0xffffffffffffffffffffffffffffffff");
      const high = priceValue >> BigInt(128);
      
      const calls = [
        {
          contractAddress: COLLATERAL_ADDRESSES.GBTC.priceFeed,
          entrypoint: "set_price",
          calldata: [low.toString(), high.toString()], // Price as u256 (low, high)
        },
      ];

      await sendGBTC(calls);
      toast.success("GBTC price update transaction sent!");
      setGbtcPrice("");
    } catch (error) {
      console.error("Price update error:", error);
      toast.error("Failed to update GBTC price");
    } finally {
      setIsPendingGBTC(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">
          GBTC Price Management
        </h1>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Testing Only</strong>: This page allows manual GBTC price updates for testing liquidations.
          In production, prices are fetched from oracles.
        </AlertDescription>
      </Alert>

      <div className="max-w-md mx-auto">
        {/* GBTC Price Update */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              GBTC Price Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gbtc-price">New Price (USD)</Label>
              <NumericFormat
                customInput={Input}
                id="gbtc-price"
                placeholder="Enter GBTC price (e.g., 50000)"
                value={gbtcPrice}
                onValueChange={(values) => setGbtcPrice(values.value)}
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale={false}
                allowNegative={false}
                prefix="$"
              />
              <p className="text-sm text-slate-600">
                Set a lower price to trigger liquidations on under-collateralized positions.
              </p>
            </div>
            <Button
              onClick={handleUpdateGBTCPrice}
              disabled={isPendingGBTC || !address || !gbtcPrice}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isPendingGBTC ? "Updating..." : "Update GBTC Price"}
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
    { title: "GBTC Price Management - Uncap Admin" },
    { name: "description", content: "Manage GBTC price for testing liquidations" },
  ];
}