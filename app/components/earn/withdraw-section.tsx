import { TokenInput } from "~/components/token-input";
import { USDU_TOKEN, type CollateralType } from "~/lib/contracts/constants";

interface WithdrawSectionProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  onBlur: () => void;
  error?: string;
  price?: { price: number };
  selectedCollateral: CollateralType;
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
  onPercentageClick?: (percentage: number) => void;
  claimRewards?: boolean;
}

export function WithdrawSection({
  value,
  onChange,
  onBlur,
  error,
  price,
  selectedCollateral,
  selectedPosition,
  onPercentageClick,
  claimRewards = true,
}: WithdrawSectionProps) {
  // Get the userDeposit value directly from selectedPosition
  const userDeposit = selectedPosition?.userDeposit || 0;

  return (
    <div className="space-y-6">
      <TokenInput
        label="Withdraw"
        value={value}
        onChange={onChange}
        token={USDU_TOKEN}
        balance={
          userDeposit > 0
            ? {
                value: BigInt(
                  Math.floor(userDeposit * 10 ** USDU_TOKEN.decimals)
                ),
                formatted: userDeposit.toString(),
              }
            : undefined
        }
        price={price}
        onBlur={onBlur}
        error={error}
        disabled={userDeposit === 0}
        decimals={18}
        percentageButtons
        onPercentageClick={onPercentageClick}
        includeMax={true}
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">
          Projected pool share after withdrawal:
        </span>
        <span className="font-medium text-slate-900">
          {(() => {
            // Show placeholder if no value entered or no position data
            if (
              !value ||
              Number(value) <= 0 ||
              !selectedPosition ||
              selectedPosition.userDeposit <= 0
            ) {
              return "-";
            }

            const withdrawAmount = Number(value);
            const currentDeposit = selectedPosition?.userDeposit || 0;
            const totalDeposit = selectedPosition?.totalDeposits || 0;
            const newTotalDeposit = totalDeposit - withdrawAmount;
            const newUserDeposit = currentDeposit - withdrawAmount;

            // If withdrawing everything, share will be 0
            if (newUserDeposit <= 0 || newTotalDeposit <= 0) {
              return "0.0000%";
            }

            const share = (newUserDeposit / newTotalDeposit) * 100;
            return `${share.toFixed(4)}%`;
          })()}
        </span>
      </div>
    </div>
  );
}
