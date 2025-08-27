import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { DollarSign, Info, Wallet, RefreshCw } from "lucide-react";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import type { Route } from "./+types/claim";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { type CollateralType } from "~/lib/contracts/constants";
import { NumericFormat } from "react-number-format";
import { useClaimAllSurplus } from "~/hooks/use-claim-surplus";
import { useCollateralSurplus } from "~/hooks/use-collateral-surplus";
import { useCallback } from "react";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { Alert, AlertDescription } from "~/components/ui/alert";

function ClaimPage() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const { connectWallet } = useWalletConnect();

  const {
    surpluses,
    availableSurpluses,
    totalSurplusesCount,
    isLoading,
    error,
    refetch,
  } = useCollateralSurplus(address);

  // Hook for claiming all surpluses at once
  const {
    send: claimAll,
    isPending,
    isSending,
    transactionHash,
    error: claimError,
    currentState,
    formData,
    reset,
  } = useClaimAllSurplus({
    collateralTypes: availableSurpluses.map(s => s.collateralType),
    onSuccess: () => {
      // Refetch surplus data after successful claim
      refetch();
    },
  });

  const handleClaimAll = async () => {
    if (!address) {
      await connectWallet();
      return;
    }
    await claimAll();
  };

  const handleComplete = useCallback(() => {
    if (currentState === "error") {
      // Reset for retry
      reset();
    } else {
      // Refetch data after successful claim
      refetch();
      // Navigate on success
      navigate("/");
    }
  }, [
    currentState,
    reset,
    refetch,
    navigate,
  ]);

  // Show transaction status if in progress
  if (["pending", "success", "error"].includes(currentState)) {

    return (
      <>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          Claim Collateral Surplus
        </h2>

        <TransactionStatus
          transactionHash={transactionHash}
          isError={currentState === "error"}
          isSuccess={currentState === "success"}
          error={claimError as Error | null}
          successTitle="All Surplus Claimed!"
          successSubtitle="Your collateral surpluses have been successfully claimed."
          details={
            currentState === "success" && availableSurpluses.length > 0
              ? availableSurpluses.map(surplus => ({
                  label: `${surplus.symbol} Claimed`,
                  value: (
                    <>
                      <NumericFormat
                        displayType="text"
                        value={surplus.formatted}
                        thousandSeparator=","
                        decimalScale={7}
                        fixedDecimalScale={false}
                      />{" "}
                      {surplus.symbol}
                    </>
                  ),
                }))
              : undefined
          }
          onComplete={handleComplete}
          completeButtonText={
            currentState === "error"
              ? "Try Again"
              : "Back to Dashboard"
          }
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">
          Claim Collateral Surplus
        </h2>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Panel - Main Content */}
        <div className="md:col-span-2">
          {isLoading && !address ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center space-y-4 py-8">
                  <Wallet className="h-12 w-12 text-slate-400 mx-auto animate-pulse" />
                  <p className="text-sm text-slate-600">
                    Connect your wallet to check for collateral surplus
                  </p>
                  <Button onClick={connectWallet}>Connect Wallet</Button>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center space-y-4 py-8">
                  <RefreshCw className="h-12 w-12 text-slate-400 mx-auto animate-spin" />
                  <p className="text-sm text-slate-600">
                    Loading collateral surplus data...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border border-red-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center space-y-4 py-8">
                  <Info className="h-12 w-12 text-red-400 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-red-800">
                      Error Loading Data
                    </h3>
                    <p className="text-sm text-red-600 max-w-md mx-auto">
                      {error?.message ||
                        "Failed to load collateral surplus data"}
                    </p>
                  </div>
                  <Button onClick={() => refetch()} variant="outline">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : totalSurplusesCount === 0 ? (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center space-y-4 py-8">
                  <Wallet className="h-12 w-12 text-slate-400 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-slate-800">
                      No Collateral Surplus Available
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      You don't have any collateral surplus to claim at the
                      moment. Surpluses are available when your positions have
                      been liquidated and there's excess collateral after
                      covering the debt.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="mt-4"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="space-y-2">
                    <p className="font-semibold">
                      You have collateral surplus available
                    </p>
                    <p className="text-sm">
                      This surplus comes from liquidated positions where the
                      collateral value exceeded the debt that needed to be
                      covered. You can claim these funds back to your wallet.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Summary Card */}
              <Card className="border border-green-200 shadow-sm bg-green-50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-slate-800">
                        Total Claimable Surplus
                      </h3>
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    
                    {/* List each surplus amount */}
                    <div className="space-y-2 bg-white rounded-lg p-4">
                      {availableSurpluses.map((surplus) => (
                        <div
                          key={surplus.collateralType}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-sm font-medium text-slate-700">
                            {surplus.symbol}
                          </span>
                          <span className="font-bold text-green-700">
                            <NumericFormat
                              displayType="text"
                              value={surplus.formatted}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {surplus.symbol}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        💡 You can claim all surpluses in a single transaction
                      </p>
                    </div>

                    <Button
                      onClick={handleClaimAll}
                      disabled={!address || isPending || isSending}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      size="lg"
                    >
                      {!address
                        ? "Connect Wallet to Claim"
                        : isSending
                        ? "Confirm in wallet..."
                        : isPending
                        ? "Transaction pending..."
                        : totalSurplusesCount === 1
                        ? `Claim ${availableSurpluses[0].symbol} Surplus`
                        : `Claim All Surpluses (${totalSurplusesCount})`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Panel - Info */}
        <div className="md:col-span-1">
          <Card className="border border-slate-200 shadow-sm sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">
                About Collateral Surplus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  What is collateral surplus?
                </h4>
                <p className="text-sm text-slate-600">
                  When a position is liquidated, the collateral is sold to cover
                  the debt. If the collateral value exceeds the debt plus
                  liquidation penalty, the excess is your surplus that can be
                  claimed.
                </p>
              </div>

              <Separator className="bg-slate-100" />

              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  How to claim?
                </h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Each collateral type has separate surplus</li>
                  <li>• Click claim for each available surplus</li>
                  <li>• Funds are sent directly to your wallet</li>
                  <li>• Gas fees apply for each claim</li>
                </ul>
              </div>

              <Separator className="bg-slate-100" />

              <div>
                <h4 className="font-medium text-slate-700 mb-2">
                  Important Notes
                </h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Surplus doesn't expire</li>
                  <li>• You can claim anytime</li>
                  <li>• Multiple liquidations add to total surplus</li>
                  <li>• Data refreshes every 30 seconds</li>
                </ul>
              </div>

              {totalSurplusesCount > 0 && (
                <>
                  <Separator className="bg-slate-100" />
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">
                      Total Surpluses: {totalSurplusesCount}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default ClaimPage;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Claim Surplus - USDU" },
    {
      name: "description",
      content: "Claim your collateral surplus from liquidated positions",
    },
  ];
}
