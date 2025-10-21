import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { useCallback } from "react";
import { type CollateralId } from "~/lib/collateral";
import { NumericFormat } from "react-number-format";
import { useStabilityPoolTransaction } from "~/hooks/use-stability-pool-transaction";
import { ClaimRewardsSection } from "~/components/earn/claim-rewards-section";
import { HelpCircle } from "lucide-react";
import Big from "big.js";

interface ClaimFlowProps {
  address: string | undefined;
  usduPrice: { price: Big } | undefined;
  bitcoinPrice: { price: Big } | undefined;
  selectedPosition: {
    userDeposit: Big;
    totalDeposits: Big;
    poolShare: Big;
    rewards: {
      usdu: Big;
      collateral: Big;
    };
  } | null;
  selectedCollateral: CollateralId;
  selectedCollateralSymbol: string;
  claimRewards: boolean;
  setClaimRewards: (value: boolean) => void;
  connectWallet: () => Promise<void>;
}

export function ClaimFlow({
  address,
  usduPrice,
  bitcoinPrice,
  selectedPosition,
  selectedCollateral,
  selectedCollateralSymbol,
  claimRewards,
  setClaimRewards,
  connectWallet,
}: ClaimFlowProps) {
  const {
    send,
    isPending,
    isSending,
    error: transactionError,
    transactionHash,
    isReady,
    currentState,
    formData,
    reset: transactionReset,
  } = useStabilityPoolTransaction({
    action: "claim",
    amount: undefined,
    doClaim: claimRewards,
    collateralType: selectedCollateral,
    rewards: selectedPosition?.rewards,
  });

  const handleComplete = useCallback(() => {
    transactionReset();
  }, [transactionReset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isReady) {
      return;
    }

    try {
      await send();
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  return (
    <>
      {["pending", "success", "error"].includes(currentState) ? (
        <TransactionStatus
          transactionHash={transactionHash}
          isError={currentState === "error"}
          isSuccess={currentState === "success"}
          error={transactionError as Error | null}
          successTitle="Rewards Claimed!"
          successSubtitle={`Your rewards from the ${selectedCollateralSymbol} Stability Pool have been claimed.`}
          details={
            claimRewards &&
            formData.rewardsClaimed &&
            (formData.rewardsClaimed.usdu.gt(0) ||
              formData.rewardsClaimed.collateral.gt(0)) &&
            transactionHash
              ? [
                  {
                    label: "Pool",
                    value: `${selectedCollateralSymbol} Stability Pool`,
                  },
                  {
                    label: "Rewards Claimed",
                    value: (
                      <div className="space-y-1">
                        {formData.rewardsClaimed.usdu.gt(0) && (
                          <div>
                            <NumericFormat
                              displayType="text"
                              value={formData.rewardsClaimed.usdu.toString()}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />{" "}
                            USDU
                          </div>
                        )}
                        {formData.rewardsClaimed.collateral.gt(0) && (
                          <div>
                            <NumericFormat
                              displayType="text"
                              value={formData.rewardsClaimed.collateral.toString()}
                              thousandSeparator=","
                              decimalScale={6}
                              fixedDecimalScale
                            />{" "}
                            {selectedCollateralSymbol}
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]
              : undefined
          }
          onComplete={handleComplete}
          completeButtonText="Go back to Stability Pool"
        />
      ) : (
        <form
          onSubmit={handleSubmit}
          className={isSending || isPending ? "opacity-75" : ""}
        >
          <div className="space-y-1">
            <ClaimRewardsSection
              selectedPosition={selectedPosition}
              selectedCollateral={selectedCollateral}
              usduPrice={usduPrice?.price || new Big(1)}
              collateralPrice={bitcoinPrice?.price || new Big(0)}
            />

            {/* Claim rewards checkbox */}
            <div className="space-y-3 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="claim-all-rewards"
                      checked={claimRewards}
                      onCheckedChange={(checked) =>
                        setClaimRewards(checked === true)
                      }
                      disabled={
                        isSending ||
                        isPending ||
                        ((!selectedPosition?.rewards?.usdu ||
                          selectedPosition.rewards.usdu.eq(0)) &&
                          (!selectedPosition?.rewards?.collateral ||
                            selectedPosition.rewards.collateral.eq(0)))
                      }
                    />
                    <Label
                      htmlFor="claim-all-rewards"
                      className={`text-sm font-medium select-none flex items-center gap-2 ${
                        (!selectedPosition?.rewards?.usdu ||
                          selectedPosition.rewards.usdu.eq(0)) &&
                        (!selectedPosition?.rewards?.collateral ||
                          selectedPosition.rewards.collateral.eq(0))
                          ? "text-neutral-400"
                          : "text-neutral-700 cursor-pointer"
                      }`}
                    >
                      Claim all rewards to wallet
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600" />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-xs bg-slate-900 text-white"
                        >
                          <div className="space-y-2">
                            <p className="text-xs">
                              If checked, both USDU and{" "}
                              {selectedCollateralSymbol} rewards will be claimed
                              and sent to your wallet
                            </p>
                            <p className="text-xs">
                              If left unchecked, USDU rewards will be compounded
                              and {selectedCollateralSymbol} rewards will stay
                              in pool and can be claimed later
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 ml-7">
                    {(!selectedPosition?.rewards?.usdu ||
                      selectedPosition.rewards.usdu.eq(0)) &&
                    (!selectedPosition?.rewards?.collateral ||
                      selectedPosition.rewards.collateral.eq(0))
                      ? "No rewards available"
                      : claimRewards
                      ? `USDU and ${selectedCollateralSymbol} rewards will be sent to your wallet`
                      : `USDU rewards will be compounded; ${selectedCollateralSymbol} rewards stay in pool and can be claimed later`}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  {selectedPosition?.rewards?.usdu &&
                    selectedPosition.rewards.usdu.gt(0) && (
                      <div className="text-sm font-medium text-neutral-700">
                        <NumericFormat
                          displayType="text"
                          value={selectedPosition.rewards.usdu.toString()}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />{" "}
                        USDU
                      </div>
                    )}
                  {selectedPosition?.rewards?.collateral &&
                    selectedPosition.rewards.collateral.gt(0) && (
                      <div className="text-sm font-medium text-neutral-700">
                        <NumericFormat
                          displayType="text"
                          value={selectedPosition.rewards.collateral.toString()}
                          thousandSeparator=","
                          decimalScale={6}
                          fixedDecimalScale
                        />{" "}
                        {selectedCollateralSymbol}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start space-y-4 mt-4">
            {(() => {
              const hasRewards =
                selectedPosition?.rewards &&
                (selectedPosition.rewards.usdu.gt(0) ||
                  selectedPosition.rewards.collateral.gt(0));

              let buttonText = "";

              if (!address) {
                buttonText = "Connect Wallet";
              } else if (!hasRewards) {
                buttonText = "No Rewards Available";
              } else if (claimRewards) {
                buttonText = "Claim All Rewards";
              } else {
                buttonText = "Compound USDU Only";
              }

              return (
                <Button
                  type={address ? "submit" : "button"}
                  onClick={!address ? connectWallet : undefined}
                  disabled={
                    !!address &&
                    (!selectedPosition?.rewards ||
                      (selectedPosition.rewards.usdu.eq(0) &&
                        selectedPosition.rewards.collateral.eq(0)) ||
                      isSending ||
                      isPending)
                  }
                  className="w-full h-12 bg-token-bg-blue hover:bg-blue-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all whitespace-nowrap"
                >
                  {isSending
                    ? "Confirm in wallet..."
                    : isPending
                    ? "Transaction pending..."
                    : buttonText}
                </Button>
              );
            })()}
          </div>
        </form>
      )}
    </>
  );
}
