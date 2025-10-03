import { Button } from "~/components/ui/button";
import { Info, RefreshCw } from "lucide-react";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { NumericFormat } from "react-number-format";
import { useClaimAllSurplus } from "~/hooks/use-claim-surplus";
import { useCollateralSurplus } from "~/hooks/use-collateral-surplus";
import { useCallback } from "react";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { getCollateral } from "~/lib/collateral";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function CollateralSurplusCard() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const { connectWallet } = useWalletConnect();

  const { availableSurpluses, totalSurplusesCount, isLoading, error, refetch } =
    useCollateralSurplus(address);

  // Hook for claiming all surpluses at once
  const {
    send: claimAll,
    isPending,
    isSending,
    transactionHash,
    error: claimError,
    currentState,
    reset,
  } = useClaimAllSurplus({
    collaterals: availableSurpluses.map((s) => getCollateral(s.collateralType)),
    surplusAmounts: availableSurpluses.map((s) => ({
      collateral: getCollateral(s.collateralType),
      amount: s.formatted,
    })),
    onSuccess: () => {
      // Refetch surplus data after successful claim
      refetch();
    },
  });

  const handleButtonClick = async () => {
    if (!address) {
      await connectWallet();
    } else {
      await claimAll();
    }
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
  }, [currentState, reset, refetch, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <Card className="rounded-2xl border-0 shadow-none bg-white">
        <CardHeader className="border-b border-[#F5F3EE]">
          <CardTitle className="text-lg font-medium font-sora text-neutral-800">
            Collateral Surplus
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-sm text-neutral-500 font-sora">
            Loading surplus data...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no surplus
  if (!address || totalSurplusesCount === 0) {
    return (
      <Card className="rounded-2xl border-0 shadow-none bg-white">
        <CardHeader className="border-b border-[#F5F3EE]">
          <CardTitle className="text-lg font-medium font-sora text-neutral-800">
            Collateral Surplus
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl mx-auto flex items-center justify-center">
              <Info className="h-8 w-8 text-neutral-400" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium font-sora text-neutral-800">
                No Surplus Available
              </p>
              <p className="text-sm font-sora text-neutral-600 max-w-md mx-auto">
                {!address
                  ? "Connect your wallet to check for collateral surplus"
                  : "No excess collateral was recovered from your liquidation"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-neutral-200">
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-red-50">
            <Info className="h-6 w-6 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-neutral-800 font-sora">
              Error Loading Surplus Data
            </h3>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              {error?.message || "Failed to load collateral surplus data"}
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="font-sora"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-0 shadow-none bg-white">
      <CardHeader className="border-b border-[#F5F3EE]">
        <CardTitle className="text-lg font-medium font-sora text-neutral-800">
          Collateral Surplus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show transaction status if in progress */}
        {["pending", "success", "error"].includes(currentState) ? (
          <TransactionStatus
            transactionHash={transactionHash}
            isError={currentState === "error"}
            isSuccess={currentState === "success"}
            error={claimError as Error | null}
            successTitle="All Surplus Claimed!"
            successSubtitle="Your collateral surpluses have been successfully claimed."
            details={
              currentState === "success" && availableSurpluses.length > 0
                ? availableSurpluses.map((surplus) => {
                    const collateral = getCollateral(surplus.collateralType);
                    return {
                      label: `${collateral.symbol} Claimed`,
                      value: (
                        <>
                          <NumericFormat
                            displayType="text"
                            value={surplus.formatted.toString()}
                            thousandSeparator=","
                            decimalScale={7}
                            fixedDecimalScale={false}
                          />{" "}
                          {collateral.symbol}
                        </>
                      ),
                    };
                  })
                : undefined
            }
            onComplete={handleComplete}
            completeButtonText={
              currentState === "error" ? "Try Again" : "Back to Dashboard"
            }
          />
        ) : (
          <>
            {/* Info Banner */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200/50">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium font-sora text-neutral-800 mb-1">
                    Surplus Available
                  </p>
                  <p className="text-sm font-sora text-neutral-600">
                    Excess collateral from your liquidation is ready to claim.
                    {totalSurplusesCount > 1 &&
                      " All surpluses can be claimed in one transaction."}
                  </p>
                </div>
              </div>
            </div>

            {/* Surplus Items */}
            <div className="space-y-3">
              {availableSurpluses.map((surplus) => {
                const collateral = getCollateral(surplus.collateralType);
                return (
                  <div
                    key={surplus.collateralType}
                    className="bg-neutral-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-neutral-200">
                          <img
                            src={collateral.icon}
                            alt={collateral.symbol}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium font-sora text-neutral-800">
                            {collateral.symbol}
                          </div>
                          <div className="text-xs text-neutral-500 font-sora">
                            Available to claim
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium text-neutral-800 font-sora">
                          <NumericFormat
                            displayType="text"
                            value={surplus.formatted.toString()}
                            thousandSeparator=","
                            decimalScale={7}
                            fixedDecimalScale={false}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Claim Button */}
            <Button
              onClick={handleButtonClick}
              disabled={address && (isPending || isSending)}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all"
            >
              {!address
                ? "Connect Wallet"
                : isSending
                ? "Confirm in wallet..."
                : isPending
                ? "Transaction pending..."
                : totalSurplusesCount === 1
                ? `Claim ${availableSurpluses[0].symbol} Surplus`
                : `Claim All Surpluses (${totalSurplusesCount})`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
