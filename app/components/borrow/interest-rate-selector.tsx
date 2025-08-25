import { Slider } from "~/components/ui/slider";
import { RedemptionInfo } from "./redemption-info";

interface InterestRateSelectorProps {
  interestRate: number;
  onInterestRateChange: (rate: number) => void;
  disabled?: boolean;
}

export function InterestRateSelector({
  interestRate,
  onInterestRateChange,
  disabled = false,
}: InterestRateSelectorProps) {
  return (
    <div className="space-y-3 mt-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium text-slate-700">Interest Rate</h3>
          <RedemptionInfo variant="modal" />
        </div>
        <span className="text-sm font-semibold text-blue-600">
          {interestRate}% APR
        </span>
      </div>
      
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs text-slate-600 mb-4">
          Set your interest rate. Lower rates improve your position in the redemption queue.
        </p>

        {/* Interest Rate Slider */}
        <div>
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
            <span>20%</span>
          </div>
        </div>
      </div>
    </div>
  );
}