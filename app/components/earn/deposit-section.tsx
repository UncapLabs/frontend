import { TokenInput } from "~/components/token-input";
import { TOKENS } from "~/lib/collateral";
import Big from "big.js";
import { calculatePercentageAmountBig } from "~/lib/input-parsers";

interface DepositSectionProps {
  value: Big | undefined;
  onChange: (value: Big | undefined) => void;
  onBlur: () => void;
  error?: string;
  balance:
    | {
        value: bigint;
        formatted: string;
        decimals: number;
        symbol: string;
      }
    | undefined;
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
}

export function DepositSection({
  value,
  onChange,
  onBlur,
  error,
  balance,
  price,
  selectedPosition,
}: DepositSectionProps) {
  return (
    <div className="space-y-6">
      <TokenInput
        label="Deposit"
        value={value}
        onChange={onChange}
        token={TOKENS.USDU}
        balance={balance}
        price={price}
        onBlur={onBlur}
        error={error}
        percentageButtons
        onPercentageClick={(percentage) => {
          if (!balance?.value) {
            onChange(undefined);
            return;
          }
          const newValue = calculatePercentageAmountBig(
            balance.value,
            TOKENS.USDU.decimals,
            percentage * 100 // Convert to 0-100 scale
          );
          onChange(newValue);
        }}
        includeMax={true}
      />

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">
          Projected pool share after deposit:
        </span>
        <span className="font-medium text-slate-900">
          {(() => {
            // Show placeholder if no value entered or no position data
            if (!value || value.lte(0) || !selectedPosition) {
              return "-";
            }

            const inputAmount = value;
            const currentDeposit = selectedPosition?.userDeposit || new Big(0);
            const totalDeposit = selectedPosition?.totalDeposits || new Big(0);
            const newTotalDeposit = totalDeposit.plus(inputAmount);
            const newUserDeposit = currentDeposit.plus(inputAmount);
            const share = newTotalDeposit.gt(0)
              ? newUserDeposit.div(newTotalDeposit).times(100)
              : new Big(0);
            return `${Number(share.toFixed(4))}%`;
          })()}
        </span>
      </div>
    </div>
  );
}
