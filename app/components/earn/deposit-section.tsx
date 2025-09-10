import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { TokenInput } from "~/components/token-input";
import { USDU_TOKEN } from "~/lib/contracts/constants";
import { RewardsDisplay } from "./rewards-display";

interface DepositSectionProps {
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  balance: any;
  selectedPosition: any;
  selectedCollateral?: any;
  claimRewards?: boolean;
}

export function DepositSection({
  value,
  onChange,
  onBlur,
  error,
  balance,
  selectedPosition,
  selectedCollateral,
  claimRewards = true,
}: DepositSectionProps) {
  return (
    <Card className="border-2 border-slate-200">
      <CardContent className="pt-6 space-y-6">
        <TokenInput
          label="Amount to Deposit"
          value={value}
          onChange={onChange}
          token={USDU_TOKEN}
          balance={balance}
          onBlur={onBlur}
          error={error}
          placeholder="Enter deposit amount"
          percentageButtons
          onPercentageClick={(percentage) => {
            const balanceValue = balance?.value
              ? Number(balance.value) / 10 ** USDU_TOKEN.decimals
              : 0;
            const newValue = balanceValue * percentage;
            onChange(newValue);
          }}
          includeMax={true}
        />

        <RewardsDisplay
          selectedPosition={selectedPosition}
          selectedCollateral={selectedCollateral}
          claimRewards={claimRewards}
        />

        {/* Show projected pool share for deposits */}
        {value && Number(value) > 0 && selectedPosition && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 pb-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    Projected Pool Share
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {(() => {
                      const inputAmount = Number(value);
                      const currentDeposit = selectedPosition?.userDeposit || 0;
                      const totalDeposit = selectedPosition?.totalDeposits || 0;
                      const newTotalDeposit = totalDeposit + inputAmount;
                      const newUserDeposit = currentDeposit + inputAmount;
                      const share =
                        newTotalDeposit > 0
                          ? (newUserDeposit / newTotalDeposit) * 100
                          : 0;
                      return `${share.toFixed(2)}%`;
                    })()}
                  </Badge>
                </div>
                <p className="text-xs text-blue-700">
                  Your share of the pool determines your portion of liquidation
                  gains
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
