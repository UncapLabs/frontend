import { NumericFormat } from "react-number-format";
import { Gift, DollarSign, Coins } from "lucide-react";
import type { CollateralType } from "~/lib/contracts/constants";

interface ClaimRewardsSectionProps {
  selectedPosition: any;
  selectedCollateral: CollateralType;
}

export function ClaimRewardsSection({
  selectedPosition,
  selectedCollateral,
}: ClaimRewardsSectionProps) {
  const hasRewards = selectedPosition?.rewards && 
    (selectedPosition.rewards.usdu > 0 || selectedPosition.rewards.collateral > 0);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-800">Available Rewards</h3>

      {hasRewards ? (
        <>
          {/* USDU Interest Rewards */}
          {selectedPosition.rewards.usdu > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-slate-700">
                    USDU Interest
                  </span>
                </div>
                <span className="font-bold text-green-700">
                  <NumericFormat
                    displayType="text"
                    value={selectedPosition.rewards.usdu}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />{" "}
                  USDU
                </span>
              </div>
              <p className="text-xs text-slate-600">
                From protocol revenue sharing
              </p>
            </div>
          )}

          {/* Collateral Liquidation Gains */}
          {selectedPosition.rewards.collateral > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-slate-700">
                    {selectedCollateral} Gains
                  </span>
                </div>
                <span className="font-bold text-blue-700">
                  <NumericFormat
                    displayType="text"
                    value={selectedPosition.rewards.collateral}
                    thousandSeparator=","
                    decimalScale={8}
                    fixedDecimalScale
                  />{" "}
                  {selectedCollateral}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                From liquidation gains
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="p-6 bg-slate-50 rounded-lg text-center">
          <Gift className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No rewards available to claim</p>
          <p className="text-sm text-slate-500 mt-2">
            Rewards accrue when you have deposits in the stability pool
          </p>
        </div>
      )}
    </div>
  );
}
