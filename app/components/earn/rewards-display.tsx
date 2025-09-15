import { Gift } from "lucide-react";
import { NumericFormat } from "react-number-format";
import type { CollateralType } from "~/lib/contracts/constants";

interface RewardsDisplayProps {
  selectedPosition: {
    userDeposit: number;
    totalDeposits: number;
    pendingUsduGain: bigint | string | number;
    pendingCollGain: bigint | string | number;
    rewards?: {
      usdu: number;
      collateral: number;
    };
  } | null;
  selectedCollateral?: CollateralType | {
    decimals: number;
    symbol: string;
  };
  claimRewards?: boolean;
}

export function RewardsDisplay({
  selectedPosition,
  selectedCollateral,
  claimRewards = true,
}: RewardsDisplayProps) {
  // Check if there are any rewards to display
  if (!selectedPosition || 
      (!selectedPosition.rewards?.usdu && !selectedPosition.rewards?.collateral)) {
    return null;
  }

  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">
            Available Rewards
          </span>
        </div>

        <div className="space-y-2">
          {selectedPosition.rewards.usdu > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">
                USDU Interest
              </span>
              <span className="text-sm font-medium text-slate-800">
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
          )}

          {selectedPosition.rewards.collateral > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">
                Collateral Gains
              </span>
              <span className="text-sm font-medium text-slate-800">
                <NumericFormat
                  displayType="text"
                  value={selectedPosition.rewards.collateral}
                  thousandSeparator=","
                  decimalScale={6}
                  fixedDecimalScale
                />{" "}
                {typeof selectedCollateral === 'string' ? selectedCollateral : (selectedCollateral?.symbol || 'COLL')}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-600">
            {claimRewards 
              ? "Rewards will be sent to your wallet" 
              : "Rewards will be re-deposited to the pool"}
          </p>
        </div>
      </div>
    </div>
  );
}
