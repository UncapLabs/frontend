import { Card, CardContent } from "~/components/ui/card";
import { TokenInput } from "~/components/token-input";
import { USDU_TOKEN, type CollateralType } from "~/lib/contracts/constants";
import { RewardsDisplay } from "./rewards-display";

interface WithdrawSectionProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  onBlur: () => void;
  error?: string;
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
  selectedCollateral,
  selectedPosition,
  onPercentageClick,
  claimRewards = true,
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
          decimals={18}
          percentageButtons
          onPercentageClick={onPercentageClick}
          includeMax={true}
          helperText={
            userDeposit === 0
              ? "No deposits to withdraw"
              : `Deposited: ${userDeposit.toLocaleString()} USDU`
          }
        />

        <RewardsDisplay
          selectedPosition={selectedPosition}
          selectedCollateral={selectedCollateral}
          claimRewards={claimRewards}
        />
      </CardContent>
    </Card>
  );
}
