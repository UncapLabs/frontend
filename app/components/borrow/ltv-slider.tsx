import { HelpCircle } from "lucide-react";
import { Slider } from "~/components/ui/slider";
import { MAX_LTV } from "~/lib/utils/calc";
import { getLtvColor } from "~/lib/utils";

interface LtvSliderProps {
  ltvValue: number;
  onValueChange: (value: number[]) => void;
  disabled?: boolean;
}

export function LtvSlider({
  ltvValue,
  onValueChange,
  disabled,
}: LtvSliderProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-sm font-medium text-slate-700">
            Loan to Value (LTV)
          </span>
          <div className="relative group ml-1">
            <HelpCircle className="h-3 w-3 text-slate-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-white rounded shadow-lg text-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              Ratio of the collateral value to the borrowed value. Higher values
              mean higher risk.
            </div>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`text-sm font-bold ${
              ltvValue <= 25
                ? "text-green-600"
                : ltvValue <= 50
                ? "text-blue-600"
                : ltvValue <= 70
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {ltvValue}%
          </span>
          <span className="text-xs text-slate-500 ml-1">
            max. {(MAX_LTV * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="relative">
        {/* Custom colored track background */}
        <div className="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full overflow-hidden">
          {/* Gray background for the entire track */}
          <div className="absolute left-0 top-0 h-full w-full bg-slate-200"></div>

          {/* Colored portion based on current value (max 90% of width) */}
          <div
            className={`absolute left-0 top-0 h-full ${getLtvColor(
              ltvValue
            )} transition-all duration-300`}
            style={{ width: `${ltvValue * MAX_LTV}%` }}
          ></div>

          {/* Forbidden zone (last 20%) */}
          <div className="absolute left-[80%] top-0 h-full w-[20%] bg-slate-300"></div>
        </div>

        {/* Slider component */}
        <Slider
          disabled={disabled}
          value={[ltvValue]}
          onValueChange={onValueChange}
          max={100}
          step={1}
          className="z-10"
        />
      </div>
    </div>
  );
}
