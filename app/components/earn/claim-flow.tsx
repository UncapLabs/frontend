import { Button } from "~/components/ui/button";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { useCallback, useState } from "react";
import { type CollateralId, TOKENS } from "~/lib/collateral";
import { NumericFormat } from "react-number-format";
import { useStabilityPoolTransaction } from "~/hooks/use-stability-pool-transaction";
import type { CollateralOutputToken } from "~/hooks/use-stability-pool";
import { ClaimRewardsSection } from "~/components/earn/claim-rewards-section";
import { CollateralSwapSelector } from "~/components/earn/collateral-swap-selector";
import { ClaimRewardsToggle } from "~/components/earn/claim-rewards-toggle";
import Big from "big.js";
import { bigintToBig } from "~/lib/decimal";

interface GetClaimButtonTextParams {
  address: string | undefined;
  hasRewards: boolean;
  claimRewards: boolean;
  isSwappingToUsdu: boolean;
  isSending: boolean;
  isPending: boolean;
  isQuoteLoading: boolean;
  quoteError: boolean;
}

function getClaimButtonText(params: GetClaimButtonTextParams): string {
  const {
    address,
    hasRewards,
    claimRewards,
    isSwappingToUsdu,
    isSending,
    isPending,
    isQuoteLoading,
    quoteError,
  } = params;

  if (isSending) return "Confirm in wallet...";
  if (isPending) return "Transaction pending...";
  if (isSwappingToUsdu && isQuoteLoading) return "Fetching swap quote...";
  if (isSwappingToUsdu && quoteError) return "Swap unavailable";
  if (!address) return "Connect Wallet";
  if (!hasRewards) return "No Rewards Available";

  if (claimRewards) {
    return isSwappingToUsdu ? "Claim & Swap to USDU" : "Claim All Rewards";
  }

  return "Compound USDU Only";
}

interface SubmitButtonProps {
  address: string | undefined;
  selectedPosition: ClaimFlowProps["selectedPosition"];
  claimRewards: boolean;
  hasCollateralRewards: boolean;
  collateralOutputToken: CollateralOutputToken;
  isSending: boolean;
  isPending: boolean;
  isQuoteLoading: boolean;
  quoteError: Error | null;
  connectWallet: () => Promise<void>;
}

function SubmitButton({
  address,
  selectedPosition,
  claimRewards,
  hasCollateralRewards,
  collateralOutputToken,
  isSending,
  isPending,
  isQuoteLoading,
  quoteError,
  connectWallet,
}: SubmitButtonProps): JSX.Element {
  const hasRewards =
    selectedPosition?.rewards &&
    (selectedPosition.rewards.usdu.gt(0) ||
      selectedPosition.rewards.collateral.gt(0));

  const isSwappingToUsdu =
    claimRewards && hasCollateralRewards && collateralOutputToken === "USDU";

  const isSwapDisabled = isSwappingToUsdu && (isQuoteLoading || !!quoteError);

  const buttonText = getClaimButtonText({
    address,
    hasRewards: !!hasRewards,
    claimRewards,
    isSwappingToUsdu,
    isSending,
    isPending,
    isQuoteLoading,
    quoteError: !!quoteError,
  });

  return (
    <Button
      type={address ? "submit" : "button"}
      onClick={!address ? connectWallet : undefined}
      disabled={
        !!address && (!hasRewards || isSending || isPending || isSwapDisabled)
      }
      className="w-full h-12 bg-token-bg-blue hover:bg-blue-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all whitespace-nowrap"
    >
      {buttonText}
    </Button>
  );
}

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
  // State for collateral output preference
  const [collateralOutputToken, setCollateralOutputToken] =
    useState<CollateralOutputToken>("COLLATERAL");

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
    expectedUsduAmount,
    isQuoteLoading,
    quoteError,
  } = useStabilityPoolTransaction({
    action: "claim",
    amount: undefined,
    doClaim: claimRewards,
    collateralType: selectedCollateral,
    rewards: selectedPosition?.rewards,
    collateralOutputToken: claimRewards ? collateralOutputToken : "COLLATERAL",
  });

  // Check if there are collateral rewards to potentially swap
  const hasCollateralRewards =
    selectedPosition?.rewards?.collateral &&
    selectedPosition.rewards.collateral.gt(0);

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
          successTitle={
            formData.collateralOutputToken === "USDU" &&
            formData.rewardsClaimed?.collateral.gt(0)
              ? "Rewards Claimed & Swapped!"
              : "Rewards Claimed!"
          }
          successSubtitle={
            formData.collateralOutputToken === "USDU" &&
            formData.rewardsClaimed?.collateral.gt(0)
              ? `Your rewards from the ${selectedCollateralSymbol} Stability Pool have been claimed and ${selectedCollateralSymbol} swapped to USDU.`
              : `Your rewards from the ${selectedCollateralSymbol} Stability Pool have been claimed.`
          }
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
                      <div className="space-y-1 text-right">
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
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <span>
                              <NumericFormat
                                displayType="text"
                                value={formData.rewardsClaimed.collateral.toString()}
                                thousandSeparator=","
                                decimalScale={6}
                              />{" "}
                              {selectedCollateralSymbol}
                            </span>
                            {formData.collateralOutputToken === "USDU" &&
                              formData.expectedUsduAmount && (
                                <>
                                  <span className="text-neutral-400">→</span>
                                  <span className="text-green-600 font-medium">
                                    <NumericFormat
                                      displayType="text"
                                      value={bigintToBig(
                                        BigInt(formData.expectedUsduAmount),
                                        TOKENS.USDU.decimals
                                      ).toString()}
                                      thousandSeparator=","
                                      decimalScale={2}
                                    />{" "}
                                    USDU
                                  </span>
                                </>
                              )}
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

            <div className="space-y-3 pt-6">
              <ClaimRewardsToggle
                rewards={selectedPosition?.rewards}
                collateralSymbol={selectedCollateralSymbol}
                claimRewards={claimRewards}
                setClaimRewards={setClaimRewards}
                disabled={isSending || isPending}
                actionLabel="claiming"
              />

              {claimRewards && hasCollateralRewards && (
                <CollateralSwapSelector
                  collateralOutputToken={collateralOutputToken}
                  setCollateralOutputToken={setCollateralOutputToken}
                  collateralSymbol={selectedCollateralSymbol}
                  collateralId={selectedCollateral}
                  collateralAmount={
                    selectedPosition?.rewards?.collateral ?? new Big(0)
                  }
                  expectedUsduAmount={expectedUsduAmount}
                  isQuoteLoading={isQuoteLoading}
                  quoteError={quoteError}
                  disabled={isSending || isPending}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col items-start space-y-4 mt-4">
            <SubmitButton
              address={address}
              selectedPosition={selectedPosition}
              claimRewards={claimRewards}
              hasCollateralRewards={!!hasCollateralRewards}
              collateralOutputToken={collateralOutputToken}
              isSending={isSending}
              isPending={isPending}
              isQuoteLoading={isQuoteLoading}
              quoteError={quoteError}
              connectWallet={connectWallet}
            />
          </div>
        </form>
      )}
    </>
  );
}
