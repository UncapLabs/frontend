import { Badge } from "~/components/ui/badge";
import { TokenInput } from "~/components/token-input";
import { USDU_TOKEN, type CollateralType } from "~/lib/contracts/constants";

interface DepositSectionProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
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
  price?: { price: number };
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
  price,
  selectedPosition,
  selectedCollateral,
  claimRewards = true,
}: DepositSectionProps) {
  return (
    <div className="space-y-6">
      <TokenInput
        label="Deposit"
        value={value}
        onChange={onChange}
        token={USDU_TOKEN}
        balance={balance}
        price={price}
        onBlur={onBlur}
        error={error}
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

      {/* Show projected pool share for deposits */}
      {value && Number(value) > 0 && selectedPosition && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            Projected pool share after deposit:
          </span>
          <span className="font-medium text-slate-900">
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
              return `${share.toFixed(4)}%`;
            })()}
          </span>
        </div>
      )}
    </div>
  );
}
