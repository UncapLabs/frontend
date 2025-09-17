import { NumericFormat } from "react-number-format";
import type { CollateralType } from "~/lib/contracts/constants";

interface ClaimRewardsSectionProps {
  selectedPosition: any;
  selectedCollateral: CollateralType;
  usduPrice: number;
  collateralPrice: number;
}

export function ClaimRewardsSection({
  selectedPosition,
  selectedCollateral,
  usduPrice,
  collateralPrice,
}: ClaimRewardsSectionProps) {
  const usduRewards = selectedPosition?.rewards?.usdu || 0;
  const collateralRewards = selectedPosition?.rewards?.collateral || 0;
  const hasRewards = usduRewards > 0 || collateralRewards > 0;

  // Calculate USD values
  const usduRewardsUSD = usduRewards * usduPrice;
  const collateralRewardsUSD = collateralRewards * collateralPrice;
  const totalUSD = usduRewardsUSD + collateralRewardsUSD;

  return (
    <div className="bg-white rounded-2xl p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
          Rewards to Claim
        </h3>

        {/* USDU Rewards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-800 font-sora">
                USDU Rewards
              </span>
              <p className="text-xs text-neutral-500 font-sora mt-0.5">
                Earnings from protocol revenue distributions
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-neutral-800 font-sora">
                <NumericFormat
                  displayType="text"
                  value={usduRewards}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />{" "}
                <span className="text-sm">USDU</span>
              </div>
              <div className="text-xs text-neutral-500 font-sora">
                <NumericFormat
                  displayType="text"
                  value={usduRewardsUSD}
                  prefix="≈ $"
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </div>
            </div>
          </div>
        </div>

        {/* Collateral Rewards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-800 font-sora">
                {selectedCollateral} Rewards
              </span>
              <p className="text-xs text-neutral-500 font-sora mt-0.5">
                Proceeds from liquidations
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-neutral-800 font-sora">
                <NumericFormat
                  displayType="text"
                  value={collateralRewards}
                  thousandSeparator=","
                  decimalScale={6}
                  fixedDecimalScale
                />{" "}
                <span className="text-sm">{selectedCollateral}</span>
              </div>
              <div className="text-xs text-neutral-500 font-sora">
                <NumericFormat
                  displayType="text"
                  value={collateralRewardsUSD}
                  prefix="≈ $"
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </div>
            </div>
          </div>
        </div>

        {/* Divider and Total */}
        {hasRewards ? (
          <>
            <div className="border-t border-neutral-200 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-800 font-sora uppercase">
                  Total Value
                </span>
                <div className="text-right">
                  <div className="text-xl font-semibold text-neutral-800 font-sora">
                    <NumericFormat
                      displayType="text"
                      value={totalUSD}
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm text-neutral-500 text-center font-sora">
              No rewards available. Rewards accrue when you have deposits in the
              stability pool.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
