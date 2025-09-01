import { Slider } from "~/components/ui/slider";
import { RedemptionInfo } from "./redemption-info";
import { NumericFormat } from "react-number-format";
import { Info } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { useEffect } from "react";
import {
  useInterestRateBrackets,
  useInterestRateChartData,
  useDebtInFrontOfInterestRate,
  useRedemptionRiskOfInterestRate,
  useAverageInterestRate,
} from "~/hooks/useInterestRate";
import * as dn from "dnum";

interface InterestRateSelectorProps {
  interestRate: number;
  onInterestRateChange: (rate: number) => void;
  disabled?: boolean;
  borrowAmount?: number;
  isLoadingRebate?: boolean;
  rebateData?: {
    rebatePercentage: number;
    interestRate: number;
    effectiveInterestRate: number;
    yearlyInterestUSD: number;
    effectiveYearlyInterestUSD: number;
    yearlyRebateUSD: number;
  };
}

export function InterestRateSelector({
  interestRate,
  onInterestRateChange,
  disabled = false,
  borrowAmount,
  isLoadingRebate = false,
  rebateData,
}: InterestRateSelectorProps) {
  const effectiveRate = rebateData?.effectiveInterestRate ?? interestRate;

  // Convert interest rate to Dnum for the hooks
  const interestRateDnum = dn.from(interestRate / 100, 18); // Convert percentage to decimal

  // Fetch all interest rate data using the hooks
  const brackets = useInterestRateBrackets(0); // Using branch 0 as default
  const chartData = useInterestRateChartData(0);
  const debtInFront = useDebtInFrontOfInterestRate(0, interestRateDnum);
  const redemptionRisk = useRedemptionRiskOfInterestRate(0, interestRateDnum);
  const averageRate = useAverageInterestRate(0);

  // Log all the data to console
  useEffect(() => {
    console.log("=== Interest Rate Data ===");
    
    console.log("1. Interest Rate Brackets:", brackets);
    if (brackets.data) {
      console.log("   - Last Updated At:", brackets.data.lastUpdatedAt);
      console.log("   - Number of brackets:", brackets.data.brackets.length);
    }
    
    console.log("2. Chart Data:", chartData);
    if (chartData.data) {
      console.log("   - Number of data points:", chartData.data.length);
      console.log("   - First few points:", chartData.data.slice(0, 5));
    }
    
    console.log("3. Debt In Front:", debtInFront);
    if (debtInFront.data) {
      console.log("   - Debt ahead of you:", dn.format(debtInFront.data.debtInFront, 2));
      console.log("   - Total debt:", dn.format(debtInFront.data.totalDebt, 2));
    }
    
    console.log("4. Redemption Risk:", redemptionRisk);
    if (redemptionRisk.data) {
      console.log("   - Risk level:", redemptionRisk.data);
    }
    
    console.log("5. Average Interest Rate:", averageRate);
    if (averageRate.data) {
      console.log("   - Average rate:", (averageRate.data * 100).toFixed(2) + "%");
    }
    
    console.log("=========================");
  }, [brackets, chartData, debtInFront, redemptionRisk, averageRate]);
  
  return (
    <div className="space-y-3 mt-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium text-slate-700">Interest Rate</h3>
          <RedemptionInfo variant="modal" />
        </div>
        <div className="flex items-center gap-2">
          {rebateData && borrowAmount && borrowAmount > 0 ? (
            <>
              <span className="text-sm text-slate-400 line-through">
                {interestRate}% APR
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-green-600">
                  {effectiveRate.toFixed(2)}% APR
                </span>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] text-purple-600 font-medium">
                    (30% STRK rebate)
                  </span>
                  <img 
                    src="/starknet.png" 
                    alt="STRK" 
                    className="w-3 h-3 object-contain"
                  />
                </div>
              </div>
            </>
          ) : (
            <span className="text-sm font-semibold text-blue-600">
              {interestRate}% APR
            </span>
          )}
        </div>
      </div>
      
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs text-slate-600 mb-4">
          Set your interest rate. Lower rates improve your position in the redemption queue.
        </p>

        {/* Interest Rate Slider */}
        <div className="mb-4">
          <div className="relative">
            {/* Custom colored track background */}
            <div className="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full overflow-hidden">
              {/* Gray background for the entire track */}
              <div className="absolute left-0 top-0 h-full w-full bg-slate-200"></div>

              {/* Colored portion based on current value */}
              <div
                className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${((interestRate - 0.5) / 19.5) * 100}%`,
                }}
              ></div>
            </div>

            {/* Slider component */}
            <Slider
              value={[interestRate]}
              onValueChange={(value) => onInterestRateChange(value[0])}
              min={0.5}
              max={20}
              step={0.1}
              className="z-10"
              disabled={disabled}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>0.5%</span>
            {rebateData && borrowAmount && borrowAmount > 0 && (
              <span className="text-center flex-1">
                <span className="text-purple-600 font-medium">
                  Effective: {effectiveRate.toFixed(2)}%
                </span>
              </span>
            )}
            <span>20%</span>
          </div>
        </div>

        {/* STRK Rebate Information - Now shown below the slider */}
        {borrowAmount && borrowAmount > 0 && (
          <>
            {!rebateData && isLoadingRebate ? (
              // Only show skeleton on initial load when there's no data
              <div className="bg-white rounded-lg p-3 mt-4 border border-slate-200">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                      <Info className="h-3 w-3 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-full mb-3" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : rebateData ? (
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
                      You get a 30% discount on your interest rate, paid as STRK tokens claimable weekly.
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Original Annual Interest</span>
                        <span className="text-xs text-slate-400 line-through">
                          $<NumericFormat
                            displayType="text"
                            value={rebateData.yearlyInterestUSD}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Effective Annual Interest</span>
                        <span className="text-xs font-semibold text-green-600">
                          $<NumericFormat
                            displayType="text"
                            value={rebateData.effectiveYearlyInterestUSD}
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
                          $<NumericFormat
                            displayType="text"
                            value={rebateData.yearlyRebateUSD}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          /> worth
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}