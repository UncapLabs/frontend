import { TokenInput } from "~/components/token-input";
import { TOKENS } from "~/lib/collateral";
import Big from "big.js";
import { bigToBigint } from "~/lib/decimal";

interface WithdrawSectionProps {
  value: Big | undefined;
  onChange: (value: Big | undefined) => void;
  onBlur: () => void;
  error?: string;
  price?: { price: Big };
  selectedPosition: {
    userDeposit: Big;
    totalDeposits: Big;
    pendingUsduGain: Big;
    pendingCollGain: Big;
    rewards?: {
      usdu: Big;
      collateral: Big;
    };
  } | null;
  onPercentageClick?: (percentage: number) => void;
}

export function WithdrawSection({
  value,
  onChange,
  onBlur,
  error,
  price,
  selectedPosition,
  onPercentageClick,
}: WithdrawSectionProps) {
  // Get the userDeposit value directly from selectedPosition
  const userDeposit = selectedPosition?.userDeposit || new Big(0);

  return (
    <div className="space-y-6">
      <TokenInput
        label="Withdraw"
        value={value}
        onChange={onChange}
        token={TOKENS.USDU}
        balance={
          userDeposit.gt(0)
            ? {
                value: bigToBigint(userDeposit, TOKENS.USDU.decimals),
                formatted: userDeposit.toFixed(),
              }
            : undefined
        }
        price={price}
        onBlur={onBlur}
        error={error}
        disabled={userDeposit.eq(0)}
        percentageButtons
        onPercentageClick={onPercentageClick}
        includeMax={true}
        balanceLabel="Available"
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
              value.lte(0) ||
              !selectedPosition ||
              selectedPosition.userDeposit.lte(0)
            ) {
              return "-";
            }

            const withdrawAmount = value;
            const currentDeposit = selectedPosition?.userDeposit || new Big(0);
            const totalDeposit = selectedPosition?.totalDeposits || new Big(0);
            const newTotalDeposit = totalDeposit.minus(withdrawAmount);
            const newUserDeposit = currentDeposit.minus(withdrawAmount);

            // If withdrawing everything, share will be 0
            if (newUserDeposit.lte(0) || newTotalDeposit.lte(0)) {
              return "0.0000%";
            }

            const share = newUserDeposit.div(newTotalDeposit).times(100);
            return `${Number(share.toFixed(4))}%`;
          })()}
        </span>
      </div>
    </div>
  );
}
