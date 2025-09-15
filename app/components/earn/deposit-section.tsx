import { Badge } from "~/components/ui/badge";
import { TokenInput } from "~/components/token-input";
import { USDU_TOKEN, type CollateralType } from "~/lib/contracts/constants";
import { RewardsDisplay } from "./rewards-display";

interface DepositSectionProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  onBlur: () => void;
  error?: string;
  balance: {
    value: bigint;
    formatted: string;
    decimals: number;
    symbol: string;
  } | undefined;
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
  selectedCollateral?: CollateralType;
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
    <div className="space-y-6">
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
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
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
          </div>
        )}
    </div>
  );
}
