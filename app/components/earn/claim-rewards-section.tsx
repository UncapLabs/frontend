import { NumericFormat } from "react-number-format";
import type { CollateralType } from "~/lib/contracts/constants";

interface ClaimRewardsSectionProps {
  selectedPosition: any;
  selectedCollateral: CollateralType;
}

export function ClaimRewardsSection({
  selectedPosition,
  selectedCollateral,
}: ClaimRewardsSectionProps) {
  const usduRewards = selectedPosition?.rewards?.usdu || 0;
  const collateralRewards = selectedPosition?.rewards?.collateral || 0;
  const hasRewards = usduRewards > 0 || collateralRewards > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium text-slate-700 text-sm">
          Amounts to claim:
        </h3>

        {/* USDU Rewards */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">USDU Rewards</span>
            <span className="font-medium text-slate-900">
              <NumericFormat
                displayType="text"
                value={usduRewards}
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale
              />{" "}
              USDU
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Earnings from protocol revenue distributions
          </p>
        </div>

        {/* Collateral Rewards */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {selectedCollateral} Rewards
            </span>
            <span className="font-medium text-slate-900">
              <NumericFormat
                displayType="text"
                value={collateralRewards}
                thousandSeparator=","
                decimalScale={6}
                fixedDecimalScale
              />{" "}
              {selectedCollateral}
            </span>
          </div>
          <p className="text-xs text-slate-500">Proceeds from liquidations</p>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-4">
          {!hasRewards && (
            <p className="text-sm text-slate-500 text-center">
              No rewards available. Rewards accrue when you have deposits in the
              stability pool.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
