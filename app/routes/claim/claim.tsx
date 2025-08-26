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
import { useClaimSurplus } from "~/hooks/use-claim-surplus";
import { useCollateralSurplus } from "~/hooks/use-collateral-surplus";
import { useCallback } from "react";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { Alert, AlertDescription } from "~/components/ui/alert";

function ClaimPage() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const { connectWallet } = useWalletConnect();

  // Fetch surplus data using TanStack Query
  const {
    surpluses,
    availableSurpluses,
    totalSurplusesCount,
    isLoading,
    error,
    refetch,
  } = useCollateralSurplus(address);

  // Hooks for claiming surplus for each collateral type
  const {
    send: claimUBTC,
    isPending: isUBTCPending,
    isSending: isUBTCSending,
    transactionHash: ubtcTxHash,
    error: ubtcError,
    currentState: ubtcState,
    formData: ubtcFormData,
    reset: resetUBTC,
  } = useClaimSurplus({
    collateralType: "UBTC",
    onSuccess: () => {
      // Refetch surplus data after successful claim
      refetch();
    },
  });

  const {
    send: claimGBTC,
    isPending: isGBTCPending,
    isSending: isGBTCSending,
    transactionHash: gbtcTxHash,
    error: gbtcError,
    currentState: gbtcState,
    formData: gbtcFormData,
    reset: resetGBTC,
  } = useClaimSurplus({
    collateralType: "GBTC",
    onSuccess: () => {
      // Refetch surplus data after successful claim
      refetch();
    },
  });

  // Determine which claim is active
  const activeClaimType: CollateralType | null =
    ubtcState !== "idle" ? "UBTC" : gbtcState !== "idle" ? "GBTC" : null;

  const activeState = activeClaimType === "UBTC" ? ubtcState : gbtcState;
  const activeHash = activeClaimType === "UBTC" ? ubtcTxHash : gbtcTxHash;
  const activeError = activeClaimType === "UBTC" ? ubtcError : gbtcError;
  const activeFormData =
    activeClaimType === "UBTC" ? ubtcFormData : gbtcFormData;

  const handleClaimSurplus = async (collateralType: CollateralType) => {
    if (!address) {
      await connectWallet();
      return;
    }

    if (collateralType === "UBTC") {
      await claimUBTC();
    } else if (collateralType === "GBTC") {
      await claimGBTC();
    }
  };

  const handleComplete = useCallback(() => {
    if (activeState === "error") {
      // Reset for retry
      if (activeClaimType === "UBTC") {
        resetUBTC();
      } else {
        resetGBTC();
      }
    } else {
      // Refetch data after successful claim
      refetch();
      // Navigate on success if no more surplus
      if (totalSurplusesCount <= 1) {
        navigate("/");
      } else {
        // Reset the successful claim state
        if (activeClaimType === "UBTC") {
          resetUBTC();
        } else {
          resetGBTC();
        }
      }
    }
  }, [
    activeState,
    activeClaimType,
    resetUBTC,
    resetGBTC,
    refetch,
    totalSurplusesCount,
    navigate,
  ]);

  // Show transaction status if in progress
  if (
    ["pending", "success", "error"].includes(activeState) &&
    activeClaimType
  ) {
    const claimedSurplus =
      activeClaimType === "UBTC" ? surpluses.UBTC : surpluses.GBTC;

    return (
      <>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          Claim Collateral Surplus
        </h2>

        <TransactionStatus
          transactionHash={activeHash}
          isError={activeState === "error"}
          isSuccess={activeState === "success"}
          error={activeError as Error | null}
          successTitle="Surplus Claimed!"
          successSubtitle="Your collateral surplus has been successfully claimed."
          details={
            activeState === "success" && claimedSurplus
              ? [
                  {
                    label: "Amount Claimed",
                    value: (
                      <>
                        <NumericFormat
                          displayType="text"
                          value={claimedSurplus.formatted}
                          thousandSeparator=","
                          decimalScale={7}
                          fixedDecimalScale={false}
                        />{" "}
                        {claimedSurplus.symbol}
                      </>
                    ),
                  },
                ]
              : undefined
          }
          onComplete={handleComplete}
          completeButtonText={
            activeState === "error"
              ? "Try Again"
              : totalSurplusesCount > 1
              ? "Continue"
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

              {/* Surplus Cards */}
              <div className="space-y-4">
                {availableSurpluses.map((surplus) => {
                  const isPending =
                    surplus.collateralType === "UBTC"
                      ? isUBTCPending
                      : isGBTCPending;
                  const isSending =
                    surplus.collateralType === "UBTC"
                      ? isUBTCSending
                      : isGBTCSending;

                  return (
                    <Card
                      key={surplus.collateralType}
                      className="border border-slate-200 shadow-sm"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-lg text-slate-800">
                            {surplus.symbol} Surplus
                          </h3>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="font-bold text-xl text-green-700">
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
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                          <p className="text-sm text-slate-600">
                            This surplus is from your liquidated{" "}
                            {surplus.symbol} positions. Claim it to receive the
                            funds back in your wallet.
                          </p>
                        </div>

                        <Button
                          onClick={() =>
                            handleClaimSurplus(surplus.collateralType)
                          }
                          disabled={!address || isPending || isSending}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        >
                          {!address
                            ? "Connect Wallet"
                            : isSending
                            ? "Confirm in wallet..."
                            : isPending
                            ? "Transaction pending..."
                            : `Claim ${surplus.symbol} Surplus`}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
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
