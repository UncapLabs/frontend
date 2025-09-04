import { Shield } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { STRKRebateInfo } from "./strk-rebate-info";
import { useCalculatedRebate } from "~/hooks/use-rebate-config";

interface ManagedStrategyProps {
  disabled?: boolean;
  borrowAmount?: number;
}

export function ManagedStrategy({ 
  disabled = false,
  borrowAmount 
}: ManagedStrategyProps) {
  const interestRate = 4.3; // Managed strategy uses 4.3% interest rate
  const annualFee = borrowAmount ? borrowAmount * 0.001 : 0; // 0.1% annual fee
  
  // Calculate STRK rebate for the managed strategy (only if borrowAmount exists)
  const rebateData = useCalculatedRebate(borrowAmount, interestRate);

  return (
    <div className="space-y-4">
      {/* Strategy Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="text-base font-semibold text-slate-800">
              Balanced Strategy
            </h4>
            {borrowAmount && borrowAmount > 0 && (
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                <span>
                  USDU Managed: $
                  <NumericFormat
                    displayType="text"
                    value={borrowAmount}
                    thousandSeparator=","
                    decimalScale={0}
                    fixedDecimalScale={false}
                  />
                </span>
                <span className="text-slate-400">•</span>
                <span>
                  Annual Fee: $
                  <NumericFormat
                    displayType="text"
                    value={annualFee}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
              </div>
            )}
            {!borrowAmount && (
              <div className="mt-1 text-sm text-slate-500">
                Enter a borrow amount to see details
              </div>
            )}
          </div>
          <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
            Active
          </div>
        </div>

        {/* Management Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            Managed by Telos
          </span>
        </div>

        {/* Strategy Description */}
        <p className="text-sm text-slate-600 mb-4">
          Balanced strategy optimizing between interest rate and redemption
          risk.
        </p>

        {/* Current Rate Display */}
        <div className="bg-white rounded-lg px-4 py-3 border border-slate-200">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-800">4.3%</span>
            <span className="text-sm text-slate-500">per year</span>
          </div>
        </div>
      </div>

      {/* Strategy Benefits */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <h5 className="text-sm font-medium text-slate-700 mb-2">
          Strategy Benefits
        </h5>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>
              Automatic interest rate optimization based on market conditions
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Reduced redemption risk through smart positioning</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>No manual adjustment needed - set and forget</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Professional risk management by Telos team</span>
          </li>
        </ul>
      </div>

      {/* Fee Breakdown */}
      {borrowAmount && borrowAmount > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Management Fee (0.1% annually)</span>
              <span className="font-medium">
                $
                <NumericFormat
                  displayType="text"
                  value={annualFee}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
                /year
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Interest (4.3% APR)</span>
              <span className="font-medium">
                $
                <NumericFormat
                  displayType="text"
                  value={borrowAmount * 0.043}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
                /year
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-100">
              <div className="flex justify-between font-medium text-slate-700">
                <span>Total Annual Cost</span>
                <span>
                  $
                  <NumericFormat
                    displayType="text"
                    value={annualFee + borrowAmount * 0.043}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRK Rebate Information - Only show when borrowAmount is provided */}
      {borrowAmount && borrowAmount > 0 && rebateData && (
        <STRKRebateInfo 
          yearlyInterestUSD={rebateData.yearlyInterestUSD}
          effectiveYearlyInterestUSD={rebateData.effectiveYearlyInterestUSD}
          yearlyRebateUSD={rebateData.yearlyRebateUSD}
        />
      )}
    </div>
  );
}
