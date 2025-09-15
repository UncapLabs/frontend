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
    <div className="space-y-6">
      <TokenInput
        label="Amount to Withdraw"
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
        onBlur={onBlur}
        error={error}
        disabled={userDeposit === 0}
        placeholder={"Enter withdrawal amount"}
        decimals={18}
        percentageButtons
        onPercentageClick={onPercentageClick}
        includeMax={true}
      />

      <RewardsDisplay
        selectedPosition={selectedPosition}
        selectedCollateral={selectedCollateral}
        claimRewards={claimRewards}
      />
    </div>
  );
}
