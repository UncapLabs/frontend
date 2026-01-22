import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import Big from "big.js";
import { useUncapIncentiveRates } from "~/hooks/use-incentive-rates";

interface STRKRebateInfoProps {
  yearlyInterestUSD: Big;
  yearlyRebateUSD: Big;
  collateralValueUSD: Big;
  yearlyCollateralRebateUSD: Big;
  supplyRatePercent?: number; // Per-asset supply rate percentage (e.g., 2 for 2%)
}

export function STRKRebateInfo({
  yearlyInterestUSD,
  yearlyRebateUSD,
  collateralValueUSD = new Big(0),
  yearlyCollateralRebateUSD = new Big(0),
  supplyRatePercent: supplyRatePercentProp,
}: STRKRebateInfoProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Fetch dynamic rates from API with fallbacks to hardcoded values
  const { data: rates } = useUncapIncentiveRates();
  const borrowRatePercent = (rates?.borrowRate ?? 0.4) * 100; // Fallback: 40%
  // Use prop if provided, otherwise fall back to WBTC rate (most common collateral)
  const supplyRatePercent = supplyRatePercentProp ?? (rates?.supplyRates?.WWBTC ?? 0.02) * 100;

  // Total rebate is interest rebate + collateral rebate
  const totalYearlyRebateUSD = yearlyRebateUSD.plus(yearlyCollateralRebateUSD);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-white rounded-lg border border-neutral-200 mt-4"
    >
      <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:border-neutral-200/80 transition-opacity">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-neutral-800" />
          </div>
          <span className="text-xs font-medium text-neutral-800 font-sora">
            STRK Rebate Program
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-green-600 font-sora">
            +$
            <NumericFormat
              displayType="text"
              value={totalYearlyRebateUSD.toString()}
              thousandSeparator=","
              decimalScale={0}
              fixedDecimalScale={false}
            />
            /year
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-3 pb-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-600 font-sora mt-3 mb-3">
            You get up to a {borrowRatePercent.toFixed(0)}% discount on your interest rate
            + up to {supplyRatePercent.toFixed(2)}% rebate on your collateral value, paid
            as STRK tokens claimable weekly.
          </p>

          <div className="space-y-3">
            {/* Collateral Rebate Section */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="text-xs font-medium text-neutral-800 font-sora">
                Collateral Rebate (up to {supplyRatePercent.toFixed(2)}%)
              </div>

              <div className="flex justify-between items-center pl-3">
                <span className="text-xs text-neutral-600 font-sora">
                  Collateral Value
                </span>
                <span className="text-xs text-neutral-600 font-sora">
                  $
                  <NumericFormat
                    displayType="text"
                    value={collateralValueUSD.toString()}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
              </div>

              <div className="flex justify-between items-center pl-3">
                <span className="text-xs text-neutral-600 font-sora">
                  Collateral Rebate
                </span>
                <span className="text-xs font-medium text-green-600 font-sora">
                  +$
                  <NumericFormat
                    displayType="text"
                    value={yearlyCollateralRebateUSD.toString()}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
              </div>
            </div>

            {/* Interest Rebate Section */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-neutral-800 font-sora">
                Interest Rebate (up to {borrowRatePercent.toFixed(0)}%)
              </div>

              <div className="flex justify-between items-center pl-3">
                <span className="text-xs text-neutral-600 font-sora">
                  Original Annual Interest
                </span>
                <span className="text-xs text-neutral-500 font-sora">
                  $
                  <NumericFormat
                    displayType="text"
                    value={yearlyInterestUSD.toString()}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
              </div>

              <div className="flex justify-between items-center pl-3">
                <span className="text-xs text-neutral-600 font-sora">
                  Interest Rebate
                </span>
                <span className="text-xs font-medium text-green-600 font-sora">
                  +$
                  <NumericFormat
                    displayType="text"
                    value={yearlyRebateUSD.toString()}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
              </div>
            </div>

            {/* Total Section */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-neutral-800 font-sora">
                  Total Annual Rebate
                </span>
                <span className="text-xs font-bold text-green-600 font-sora">
                  +$
                  <NumericFormat
                    displayType="text"
                    value={totalYearlyRebateUSD.toString()}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
