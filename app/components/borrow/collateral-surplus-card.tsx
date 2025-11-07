import { Button } from "~/components/ui/button";
import { Info } from "lucide-react";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { NumericFormat } from "react-number-format";
import { useClaimAllSurplus } from "~/hooks/use-claim-surplus";
import { useCollateralSurplus } from "~/hooks/use-collateral-surplus";
import { useCallback } from "react";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { getCollateral, type CollateralId } from "~/lib/collateral";
import { useCollateralPrice } from "~/hooks/use-fetch-prices";
import Big from "big.js";

// Component for individual surplus item - fetches its own price
function SurplusItem({ surplus }: { surplus: { collateralType: CollateralId; formatted: Big } }) {
  const collateral = getCollateral(surplus.collateralType);
  const collateralPrice = useCollateralPrice(surplus.collateralType);

  return (
    <div className="bg-white rounded-2xl p-6 space-y-6">
      <div className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
        COLLATERAL SURPLUS TO CLAIM
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 p-2.5 bg-token-bg rounded-lg">
          <img
            src={collateral.icon}
            alt={collateral.symbol}
            className="w-5 h-5 object-contain"
          />
          <span className="text-token-orange text-xs font-medium font-sora">
            {collateral.symbol}
          </span>
        </div>

        <div className="flex-1">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora text-neutral-800 w-full">
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

      <div className="flex justify-between items-center">
        <NumericFormat
          className="text-neutral-800 text-sm font-medium font-sora leading-none"
          displayType="text"
          value={surplus.formatted
            .times(collateralPrice?.price || new Big(0))
            .toString()}
          prefix="= $"
          thousandSeparator=","
          decimalScale={3}
          fixedDecimalScale
        />
      </div>
    </div>
  );
}

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
      <div className="bg-white rounded-2xl p-6">
        <div className="text-center text-sm text-neutral-500 font-sora py-8">
          Loading surplus data...
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <div className="text-center space-y-4 py-4">
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
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show transaction status if in progress */}
      {["pending", "success", "error"].includes(currentState) ? (
        <TransactionStatus
          transactionHash={transactionHash}
          isError={currentState === "error"}
          isSuccess={currentState === "success"}
          error={claimError as Error | null}
          successTitle="All Surplus Claimed!"
          successSubtitle="Your collateral surpluses have been successfully claimed."
          onComplete={handleComplete}
          completeButtonText={
            currentState === "error" ? "Try Again" : "Back to Dashboard"
          }
        />
      ) : (
        <>
          {/* Surplus Items - always show, even if empty */}
          {availableSurpluses.length > 0 ? (
            availableSurpluses.map((surplus) => (
              <SurplusItem key={surplus.collateralType} surplus={surplus} />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-6 space-y-6">
              <div className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
                COLLATERAL SURPLUS TO CLAIM
              </div>

              {/* Main content area - matching TokenInput style */}
              <div className="flex items-center gap-6">
                {/* Token selector on the left */}
                <div className="flex items-center gap-2 p-2.5 bg-neutral-50 rounded-lg">
                  <Info className="w-5 h-5 text-neutral-400" />
                  <span className="text-neutral-400 text-xs font-medium font-sora">
                    None
                  </span>
                </div>

                {/* Amount on the right */}
                <div className="flex-1">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora text-neutral-400 w-full">
                    0
                  </div>
                </div>
              </div>

              {/* Bottom row: USD value */}
              <div className="flex justify-between items-center">
                <NumericFormat
                  className="text-neutral-500 text-sm font-medium font-sora leading-none"
                  displayType="text"
                  value="0"
                  prefix="= $"
                  thousandSeparator=","
                  decimalScale={3}
                  fixedDecimalScale
                />
              </div>
            </div>
          )}

          {/* Claim Button - always show, disable when no surplus */}
          <Button
            onClick={handleButtonClick}
            disabled={
              !address || totalSurplusesCount === 0 || isPending || isSending
            }
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!address
              ? "Connect Wallet"
              : isSending
              ? "Confirm in wallet..."
              : isPending
              ? "Transaction pending..."
              : totalSurplusesCount === 0
              ? "No Surplus to Claim"
              : totalSurplusesCount === 1
              ? `Claim ${availableSurpluses[0].symbol} Surplus`
              : `Claim All Surpluses (${totalSurplusesCount})`}
          </Button>
        </>
      )}
    </div>
  );
}
