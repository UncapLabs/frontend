import { NumericFormat } from "react-number-format";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { ToggleSwitch } from "~/components/ui/toggle-switch";
import { HelpCircle } from "lucide-react";
import type Big from "big.js";

interface Rewards {
  usdu: Big;
  collateral: Big;
}

interface ClaimRewardsToggleProps {
  rewards: Rewards | undefined;
  collateralSymbol: string;
  claimRewards: boolean;
  setClaimRewards: (value: boolean) => void;
  disabled?: boolean;
  actionLabel: "depositing" | "withdrawing" | "claiming";
}

export function ClaimRewardsToggle({
  rewards,
  collateralSymbol,
  claimRewards,
  setClaimRewards,
  disabled = false,
  actionLabel,
}: ClaimRewardsToggleProps): JSX.Element {
  const hasRewards =
    rewards && (rewards.usdu.gt(0) || rewards.collateral.gt(0));

  const labelText =
    actionLabel === "claiming"
      ? "Claim all rewards to wallet"
      : `Claim rewards while ${actionLabel}`;

  if (hasRewards) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-700 font-sora">
              {labelText}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600 cursor-help" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs bg-slate-900 text-white"
              >
                <div className="space-y-2">
                  <p className="text-xs">
                    If enabled, both USDU and {collateralSymbol} rewards will be
                    claimed and sent to your wallet
                  </p>
                  <p className="text-xs">
                    If disabled, USDU rewards will be compounded and{" "}
                    {collateralSymbol} rewards will stay in pool
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-4">
            <RewardsAmountDisplay
              rewards={rewards}
              collateralSymbol={collateralSymbol}
            />
            <ToggleSwitch
              enabled={claimRewards}
              onChange={setClaimRewards}
              disabled={disabled}
            />
          </div>
        </div>

        <p className="text-xs text-neutral-500 font-sora">
          {claimRewards
            ? `USDU and ${collateralSymbol} rewards will be sent to your wallet`
            : `USDU rewards will be compounded; ${collateralSymbol} rewards stay in pool`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-400 font-sora">
            {labelText}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-neutral-300 cursor-help" />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-xs bg-slate-900 text-white"
            >
              <p className="text-xs">
                No rewards available. Rewards accrue when you have deposits in
                the stability pool.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-400 font-sora">
            0.00 USDU &bull; 0.000000 {collateralSymbol}
          </span>
          <ToggleSwitch enabled={false} onChange={() => {}} disabled />
        </div>
      </div>
      <p className="text-xs text-neutral-400 font-sora">
        No rewards available to claim
      </p>
    </div>
  );
}

interface RewardsAmountDisplayProps {
  rewards: Rewards;
  collateralSymbol: string;
}

function RewardsAmountDisplay({
  rewards,
  collateralSymbol,
}: RewardsAmountDisplayProps): JSX.Element {
  const hasUsdu = rewards.usdu.gt(0);
  const hasCollateral = rewards.collateral.gt(0);

  return (
    <div className="text-right text-sm text-neutral-600 font-sora">
      {hasUsdu && (
        <span>
          <NumericFormat
            displayType="text"
            value={rewards.usdu.toString()}
            thousandSeparator=","
            decimalScale={2}
            fixedDecimalScale
          />{" "}
          USDU
        </span>
      )}
      {hasUsdu && hasCollateral && (
        <span className="mx-1.5 text-neutral-300">&bull;</span>
      )}
      {hasCollateral && (
        <span>
          <NumericFormat
            displayType="text"
            value={rewards.collateral.toString()}
            thousandSeparator=","
            decimalScale={6}
          />{" "}
          {collateralSymbol}
        </span>
      )}
    </div>
  );
}
