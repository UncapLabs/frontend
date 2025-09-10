import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { TokenInput } from "~/components/token-input";
import { NumericFormat } from "react-number-format";
import { USDU_TOKEN } from "~/lib/contracts/constants";
import { Gift } from "lucide-react";
import { dnumOrNull } from "~/lib/decimal";
import * as dn from "dnum";

interface WithdrawSectionProps {
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  selectedCollateral: any;
  selectedPosition: any;
  onPercentageClick?: (percentage: number) => void;
}

function formatTokenAmount(
  amount: string | bigint,
  decimals: number = 18
): string {
  const dnum = dnumOrNull(amount, decimals);
  if (!dnum) return "0";
  return dn.format(dnum, { digits: 7 });
}

function hasRewards(position: any): boolean {
  if (!position) return false;
  return (
    Number(position.pendingUsduGain) > 0 || Number(position.pendingCollGain) > 0
  );
}

export function WithdrawSection({
  value,
  onChange,
  onBlur,
  error,
  selectedCollateral,
  selectedPosition,
  onPercentageClick,
}: WithdrawSectionProps) {
  // Get the userDeposit value directly from selectedPosition
  const userDeposit = selectedPosition?.userDeposit || 0;

  return (
    <Card className="border-2 border-slate-200">
      <CardContent className="pt-6 space-y-6">
        <TokenInput
          label="Amount to Withdraw"
          value={value}
          onChange={onChange}
          token={USDU_TOKEN}
          balance={undefined} // Don't pass balance since we'll show it in helperText
          onBlur={onBlur}
          error={error}
          disabled={userDeposit === 0}
          placeholder={
            userDeposit === 0
              ? "No deposits available"
              : "Enter withdrawal amount"
          }
          percentageButtons
          onPercentageClick={onPercentageClick}
          includeMax={true}
          helperText={
            userDeposit === 0
              ? "No deposits to withdraw"
              : `Deposited: ${userDeposit.toLocaleString()} USDU`
          }
        />

        {/* Show available rewards for withdrawals if there are any */}
        {hasRewards(selectedPosition) && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 pb-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Available Rewards
                  </span>
                </div>

                <div className="space-y-2">
                  {Number(selectedPosition.pendingUsduGain) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">
                        USDU Interest
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {formatTokenAmount(
                          selectedPosition.pendingUsduGain.toString(),
                          18
                        )}{" "}
                        USDU
                      </Badge>
                    </div>
                  )}

                  {Number(selectedPosition.pendingCollGain) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">
                        Collateral Gains
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {formatTokenAmount(
                          selectedPosition.pendingCollGain.toString(),
                          selectedCollateral?.decimals || 18
                        )}{" "}
                        {selectedCollateral?.symbol || selectedCollateral}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
