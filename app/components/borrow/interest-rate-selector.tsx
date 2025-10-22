import { useMemo } from "react";
import { InfoDialog } from "~/components/info-dialog";
import { ManualRateControls } from "./manual-rate-controls";
import { STRKRebateInfo } from "./strk-rebate-info";
import { ManagedStrategy } from "./managed-strategy";
import { Info, AlertTriangle } from "lucide-react";
import {
  useInterestRateVisualizationData,
  useRedemptionRiskOfInterestRate,
  useAverageInterestRate,
} from "~/hooks/use-interest-rate";
import { useCalculatedRebate } from "~/hooks/use-rebate-config";
import { useInterestRateCooldown } from "~/hooks/use-interest-rate-cooldown";
import { getBranchId, type CollateralId } from "~/lib/collateral";
import { RateModeSelector, type RateMode } from "./rate-mode-selector";
export type { RateMode } from "./rate-mode-selector";
import Big from "big.js";

interface ManagedInterestInfo {
  apr?: Big;
  fee?: Big;
  cooldownSeconds?: number;
  cooldownEndsAt?: number;
  bcr?: Big;
  batchManagerLabel?: string;
  isLoading?: boolean;
  isError?: boolean;
  managedDebt?: Big;
}

interface InterestRateSelectorProps {
  interestRate: number;
  onInterestRateChange: (rate: number) => void;
  disabled?: boolean;
  borrowAmount?: Big;
  collateralAmount?: Big;
  collateralPriceUSD?: Big;
  collateralType?: CollateralId;
  onRateModeChange?: (mode: RateMode) => void;
  lastInterestRateAdjTime?: number;
  currentInterestRate?: number;
  isZombie?: boolean;
  rateMode?: RateMode;
  managedInfo?: ManagedInterestInfo;
  isManagedOptionDisabled?: boolean;
  managedDisableReason?: string;
}

export function InterestRateSelector({
  interestRate,
  onInterestRateChange,
  disabled = false,
  borrowAmount,
  collateralAmount,
  collateralPriceUSD,
  collateralType = "WWBTC",
  onRateModeChange,
  lastInterestRateAdjTime,
  currentInterestRate,
  isZombie: _isZombie = false,
  rateMode = "manual",
  managedInfo,
  isManagedOptionDisabled = false,
  managedDisableReason,
}: InterestRateSelectorProps) {
  const branchId = getBranchId(collateralType);
  const activeMode: RateMode = rateMode ?? "manual";

  const manualRate = new Big(interestRate);
  const managedApr = managedInfo?.apr;
  const resolvedRate =
    activeMode === "managed" && managedApr ? managedApr : manualRate;

  const manualRateNumber = Number(manualRate.toFixed(3));
  const managedRateNumber = managedApr ? Number(managedApr.toFixed(3)) : 0;
  const effectiveRateNumber =
    activeMode === "managed" ? managedRateNumber : manualRateNumber;
  const interestRateBig = resolvedRate.div(100);

  const rebateData = useCalculatedRebate(borrowAmount, effectiveRateNumber);
  const visualizationQuery = useInterestRateVisualizationData(branchId);
  const redemptionRisk = useRedemptionRiskOfInterestRate(
    branchId,
    interestRateBig
  );
  const averageRate = useAverageInterestRate(branchId);
  const interestRateCooldown = useInterestRateCooldown(lastInterestRateAdjTime);

  const currentRateBig =
    currentInterestRate !== undefined
      ? new Big(currentInterestRate)
      : undefined;
  const hasInterestRateChange =
    activeMode === "manual" &&
    currentRateBig !== undefined &&
    !resolvedRate.eq(currentRateBig);

  const chartBars = visualizationQuery.data?.chartBars as
    | Array<{
        rate: Big;
        normalized: number;
        debtInFront: Big;
      }>
    | undefined;

  const hasData = Boolean(chartBars && chartBars.length > 0);

  const { debtInFront } = useMemo(() => {
    if (!chartBars) {
      return { debtInFront: new Big(0) };
    }

    const currentBar = chartBars.find((bar, index) => {
      const nextBar = chartBars[index + 1];
      if (!nextBar) {
        return interestRateBig.gte(bar.rate);
      }
      return interestRateBig.gte(bar.rate) && interestRateBig.lt(nextBar.rate);
    });

    return {
      debtInFront: currentBar ? currentBar.debtInFront : new Big(0),
    };
  }, [chartBars, interestRateBig]);

  const managedOptionDisabled =
    isManagedOptionDisabled || Boolean(managedDisableReason);

  const handleModeChange = (mode: RateMode) => {
    if (mode === activeMode) {
      return;
    }
    if (mode === "managed" && managedOptionDisabled) {
      return;
    }
    onRateModeChange?.(mode);
  };

  return (
    <div className="bg-white rounded-2xl p-6 mt-4">
      <div className="flex items-top justify-between mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <h3 className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
              Interest Rate
            </h3>
            <InfoDialog defaultTab="borrowing">
              <Info className="hidden sm:block h-3.5 w-3.5 text-neutral-400 cursor-help" />
            </InfoDialog>
          </div>
          <span className="text-xs text-neutral-500 font-sora leading-3">
            {averageRate.data ? (
              <>avg: {averageRate.data.times(100).toFixed(2)}%</>
            ) : (
              <span className="invisible">avg: 0.00%</span>
            )}
          </span>
        </div>
        <RateModeSelector
          mode={activeMode}
          onModeChange={handleModeChange}
          disabled={disabled}
        />
      </div>

      <div>
        {activeMode === "manual" ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <ManualRateControls
                interestRate={manualRateNumber}
                onInterestRateChange={onInterestRateChange}
                borrowAmount={borrowAmount}
                visualizationData={
                  hasData ? visualizationQuery.data : undefined
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-neutral-800 text-xs font-medium font-sora leading-3 whitespace-nowrap">
                  <span className="hidden sm:inline">
                    Redeemable before you:
                  </span>
                  <span className="sm:hidden">Ahead:</span>
                </span>
                <span className="text-xs font-medium text-neutral-800 font-sora">
                  {debtInFront.gt(0)
                    ? `$${debtInFront.div(1_000_000).toFixed(2)}M`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                  <span className="hidden sm:inline">Redemption Risk:</span>
                  <span className="sm:hidden">Risk:</span>
                </span>
                <div
                  className={`px-1.5 sm:px-2 py-3 h-6 flex items-center justify-center rounded-md border ${
                    redemptionRisk.data
                      ? redemptionRisk.data === "Low"
                        ? "bg-green-500/10 border-green-500/20"
                        : redemptionRisk.data === "Medium"
                        ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-red-500/10 border-red-500/20"
                      : "bg-neutral-100 border-neutral-200"
                  }`}
                >
                  <span
                    className={`text-xs font-normal font-sora ${
                      redemptionRisk.data
                        ? redemptionRisk.data === "Low"
                          ? "text-green-700"
                          : redemptionRisk.data === "Medium"
                          ? "text-amber-700"
                          : "text-red-700"
                        : "text-neutral-500"
                    }`}
                  >
                    {redemptionRisk.data || "—"}
                  </span>
                </div>
              </div>
            </div>

            {hasInterestRateChange && interestRateCooldown.isInCooldown && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-700 space-y-1">
                    <p>
                      <strong>Premature Adjustment Fee:</strong> Changing the
                      interest rate now will incur a fee equal to 7 days of
                      average interest.
                    </p>
                    <p className="text-amber-600">
                      Fee-free adjustment available in{" "}
                      <strong>
                        {interestRateCooldown.remainingTimeFormatted}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {hasInterestRateChange && !interestRateCooldown.isInCooldown && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    No fee for interest rate adjustment
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <ManagedStrategy
                borrowAmount={borrowAmount}
                apr={managedInfo?.apr}
                managementFee={managedInfo?.fee}
                batchManagerLabel={managedInfo?.batchManagerLabel}
                isError={managedInfo?.isError}
                managedDebt={managedInfo?.managedDebt}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-neutral-800 text-xs font-medium font-sora leading-3 whitespace-nowrap">
                  <span className="hidden sm:inline">
                    Redeemable before you:
                  </span>
                  <span className="sm:hidden">Ahead:</span>
                </span>
                <span className="text-xs font-medium text-neutral-800 font-sora">
                  {debtInFront.gt(0)
                    ? `$${debtInFront.div(1_000_000).toFixed(2)}M`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                  <span className="hidden sm:inline">Redemption Risk:</span>
                  <span className="sm:hidden">Risk:</span>
                </span>
                <div
                  className={`px-1.5 sm:px-2 py-3 h-6 flex items-center justify-center rounded-md border ${
                    redemptionRisk.data
                      ? redemptionRisk.data === "Low"
                        ? "bg-green-500/10 border-green-500/20"
                        : redemptionRisk.data === "Medium"
                        ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-red-500/10 border-red-500/20"
                      : "bg-neutral-100 border-neutral-200"
                  }`}
                >
                  <span
                    className={`text-xs font-normal font-sora ${
                      redemptionRisk.data
                        ? redemptionRisk.data === "Low"
                          ? "text-green-700"
                          : redemptionRisk.data === "Medium"
                          ? "text-amber-700"
                          : "text-red-700"
                        : "text-neutral-500"
                    }`}
                  >
                    {redemptionRisk.data || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STRK Rebate - shared between both modes */}
        {borrowAmount && borrowAmount.gt(0) && rebateData && (
          <STRKRebateInfo
            yearlyInterestUSD={rebateData.yearlyInterestUSD}
            yearlyRebateUSD={rebateData.yearlyRebateUSD}
            collateralValueUSD={
              collateralAmount && collateralPriceUSD
                ? collateralAmount.times(collateralPriceUSD)
                : undefined
            }
            yearlyCollateralRebateUSD={
              collateralAmount && collateralPriceUSD
                ? collateralAmount.times(collateralPriceUSD).times(0.02)
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
