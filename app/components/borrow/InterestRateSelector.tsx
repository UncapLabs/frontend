import { Check } from "lucide-react";
import { Slider } from "~/components/ui/slider";

interface InterestRateSelectorProps {
  selectedRate: string;
  selfManagedRate: number;
  onRateChange: (rate: string) => void;
  onSelfManagedRateChange: (rate: number) => void;
}

export function InterestRateSelector({
  selectedRate,
  selfManagedRate,
  onRateChange,
  onSelfManagedRateChange,
}: InterestRateSelectorProps) {
  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-sm font-medium text-slate-700">Interest Rate</h3>
      <div className="grid grid-cols-1 gap-2">
        {/* Fixed Rate Option */}
        <div
          className={`relative ${
            selectedRate === "fixed"
              ? "bg-blue-50 border-2 border-blue-500"
              : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
          } rounded-lg p-3 cursor-pointer transition-all min-h-[60px]`}
          onClick={() => onRateChange("fixed")}
        >
          {selectedRate === "fixed" && (
            <>
              <div className="absolute top-2 right-2">
                <div className="bg-blue-500 rounded-full p-1">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div className="absolute top-2 right-8">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>
            </>
          )}
          <div className="flex items-center mb-1">
            <h4 className="text-base font-semibold text-slate-800">
              Fixed (5%)
            </h4>
          </div>
          <p
            className={`text-xs text-slate-600 ${
              selectedRate === "fixed" ? "" : "invisible"
            }`}
          >
            Lock in a stable 5% interest rate for the duration of your loan.
            Perfect for those who prefer predictable payments.
          </p>
        </div>

        {/* Variable Rate Option */}
        <div
          className={`relative ${
            selectedRate === "variable"
              ? "bg-blue-50 border-2 border-blue-500"
              : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
          } rounded-lg p-3 cursor-pointer transition-all min-h-[60px]`}
          onClick={() => onRateChange("variable")}
        >
          {selectedRate === "variable" && (
            <div className="absolute top-2 right-2">
              <div className="bg-blue-500 rounded-full p-1">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          )}
          <div className="flex items-center mb-1">
            <h4 className="text-base font-semibold text-slate-800">
              Variable (4-6%)
            </h4>
          </div>
          <p
            className={`text-xs text-slate-600 ${
              selectedRate === "variable" ? "" : "invisible"
            }`}
          >
            Interest rate adjusts based on market conditions. Currently
            averaging 4.5%. May offer lower rates than fixed options.
          </p>
        </div>

        {/* Self Managed Option */}
        <div
          className={`relative ${
            selectedRate === "selfManaged"
              ? "bg-blue-50 border-2 border-blue-500"
              : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
          } rounded-lg p-3 cursor-pointer transition-all min-h-[60px]`}
          onClick={() => onRateChange("selfManaged")}
        >
          {selectedRate === "selfManaged" && (
            <div className="absolute top-2 right-2">
              <div className="bg-blue-500 rounded-full p-1">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          )}
          <div className="flex items-center mb-1">
            <h4 className="text-base font-semibold text-slate-800">
              Self Managed ({selfManagedRate}%)
            </h4>
          </div>
          <p
            className={`text-xs text-slate-600 mb-3 ${
              selectedRate === "selfManaged" ? "" : "invisible"
            }`}
          >
            Take control of your interest rate by actively managing your
            position.
          </p>

          {/* Interest Rate Slider */}
          {selectedRate === "selfManaged" && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-700">
                  Interest Rate
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {selfManagedRate}%
                </span>
              </div>

              <div className="relative">
                {/* Custom colored track background */}
                <div className="absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full overflow-hidden">
                  {/* Gray background for the entire track */}
                  <div className="absolute left-0 top-0 h-full w-full bg-slate-200"></div>

                  {/* Colored portion based on current value */}
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${((selfManagedRate - 0.5) / 19.5) * 100}%`,
                    }}
                  ></div>
                </div>

                {/* Slider component */}
                <Slider
                  value={[selfManagedRate]}
                  onValueChange={(value) => onSelfManagedRateChange(value[0])}
                  min={0.5}
                  max={20}
                  step={0.1}
                  className="z-10"
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0.5%</span>
                <span>20%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
