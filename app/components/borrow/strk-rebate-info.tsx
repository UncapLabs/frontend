import { Info } from "lucide-react";
import { NumericFormat } from "react-number-format";

interface STRKRebateInfoProps {
  yearlyInterestUSD: number;
  effectiveYearlyInterestUSD: number;
  yearlyRebateUSD: number;
}

export function STRKRebateInfo({
  yearlyInterestUSD,
  effectiveYearlyInterestUSD,
  yearlyRebateUSD,
}: STRKRebateInfoProps) {
  return (
    <div className="bg-white rounded-lg p-3 mt-4 border border-slate-200">
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
            <Info className="h-3 w-3 text-purple-600" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-700 mb-1">
            STRK Rebate Program
          </h4>
          <p className="text-xs text-slate-600 mb-3">
            You get a 30% discount on your interest rate, paid as STRK
            tokens claimable weekly.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Original Annual Interest
              </span>
              <span className="text-xs text-slate-400 line-through">
                $
                <NumericFormat
                  displayType="text"
                  value={yearlyInterestUSD}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Effective Annual Interest
              </span>
              <span className="text-xs font-semibold text-green-600">
                $
                <NumericFormat
                  displayType="text"
                  value={effectiveYearlyInterestUSD}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-600">
                Annual Savings (paid in STRK)
              </span>
              <span className="text-sm font-bold text-purple-600">
                $
                <NumericFormat
                  displayType="text"
                  value={yearlyRebateUSD}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />{" "}
                worth
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
