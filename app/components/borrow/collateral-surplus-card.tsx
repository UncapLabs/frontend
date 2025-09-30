import { Button } from "~/components/ui/button";
import { Info, RefreshCw } from "lucide-react";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { InfoBox } from "~/components/ui/info-box";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { NumericFormat } from "react-number-format";
import { useClaimAllSurplus } from "~/hooks/use-claim-surplus";
import { useCollateralSurplus } from "~/hooks/use-collateral-surplus";
import { useCallback } from "react";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { UBTC_TOKEN, GBTC_TOKEN, WMWBTC_TOKEN } from "~/lib/contracts/constants";

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
    collateralTypes: availableSurpluses.map((s) => s.collateralType),
    surplusAmounts: availableSurpluses.map((s) => ({
      collateralType: s.collateralType,
      amount: s.formatted, // Pass the formatted Big amount
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

  // Don't render anything if:
  // 1. Still loading
  // 2. No surplus available (after loading)
  // 3. No address connected (after loading)
  if (
    isLoading ||
    (!address && !isLoading) ||
    (!isLoading && totalSurplusesCount === 0)
  ) {
    return null;
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

  // Get token icon based on symbol
  const getTokenIcon = (symbol: string) => {
    if (symbol === "WBTC" || symbol === "UBTC") return UBTC_TOKEN.icon;
    if (symbol === "GBTC") return GBTC_TOKEN.icon;
    if (symbol === "wBTC") return WMWBTC_TOKEN.icon; // WMWBTC shows as "wBTC" to users
    return UBTC_TOKEN.icon; // fallback
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Left Panel */}
      <div className="flex-1 lg:flex-[2] space-y-6">
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
                ? availableSurpluses.map((surplus) => ({
                    label: `${surplus.symbol} Claimed`,
                    value: (
                      <>
                        <NumericFormat
                          displayType="text"
                          value={surplus.formatted.toString()}
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
              currentState === "error" ? "Try Again" : "Back to Dashboard"
            }
          />
        ) : (
          <>
            {availableSurpluses.map((surplus) => (
              <div
                key={surplus.collateralType}
                className="bg-white rounded-2xl p-6 border border-neutral-200"
              >
                <h3 className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight mb-4">
                  COLLATERAL TO CLAIM
                </h3>

                {/* Token Display matching close position style */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-token-bg rounded-lg">
                    <img
                      src={getTokenIcon(surplus.symbol)}
                      alt={surplus.symbol}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-sm font-medium text-token-orange font-sora">
                      {surplus.symbol}
                    </span>
                  </div>
                  <div className="text-right flex-1">
                    <div className="text-xl font-semibold text-neutral-800 font-sora">
                      <NumericFormat
                        displayType="text"
                        value={surplus.formatted.toString()}
                        thousandSeparator=","
                        decimalScale={7}
                        fixedDecimalScale={false}
                      />
                    </div>
                    <div className="text-xs text-neutral-500">
                      Surplus from liquidation
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              onClick={handleButtonClick}
              disabled={address && (isPending || isSending)}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all whitespace-nowrap"
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
      </div>

      {/* Right Panel - Info Box */}
      <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px]">
        <InfoBox title="Collateral Surplus Available" variant="green">
          <div className="space-y-3">
            <p className="text-sm font-normal leading-relaxed">
              This is the excess collateral value after your debt was covered
              during liquidation. You can claim this surplus now.
            </p>
            {totalSurplusesCount > 1 && (
              <p className="text-sm font-normal leading-relaxed">
                All surpluses can be claimed in a single transaction.
              </p>
            )}
          </div>
        </InfoBox>
      </div>
    </div>
  );
}
