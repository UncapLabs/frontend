import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { MAX_LIMIT } from "~/lib/utils/calc";

interface BorrowInputProps {
  value?: number;
  onChange: (values: NumberFormatValues) => void;
  onBlur?: () => void;
  bitUSD?: { price: number };
  onPercentageClick: (percentage: number) => void;
  error?: string[];
}

export function BorrowInput({
  value,
  onChange,
  onBlur,
  bitUSD,
  onPercentageClick,
  error,
}: BorrowInputProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 group">
      <div className="flex justify-between items-center">
        <Label
          htmlFor="borrowAmount"
          className="text-base md:text-lg font-medium text-slate-700"
        >
          You borrow
        </Label>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out flex items-center space-x-1">
          <Button
            variant="outline"
            className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
            onClick={() => onPercentageClick(0.25)}
          >
            25%
          </Button>
          <Button
            variant="outline"
            className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
            onClick={() => onPercentageClick(0.5)}
          >
            50%
          </Button>
          <Button
            variant="outline"
            className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
            onClick={() => onPercentageClick(0.75)}
          >
            75%
          </Button>
          <Button
            variant="outline"
            className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors font-medium"
            onClick={() => onPercentageClick(1)}
          >
            Max.
          </Button>
        </div>
      </div>
      <div className="flex items-start justify-between space-x-2 mt-2">
        <div className="flex-grow">
          <NumericFormat
            id="borrowAmount"
            customInput={Input}
            thousandSeparator=","
            placeholder="0"
            inputMode="decimal"
            allowNegative={false}
            decimalScale={7}
            value={value}
            onValueChange={onChange}
            onBlur={onBlur}
            isAllowed={(values) => {
              const { floatValue } = values;
              if (floatValue === undefined) return true;
              return floatValue < MAX_LIMIT;
            }}
            className="text-3xl md:text-4xl font-semibold h-auto p-0 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none shadow-none tracking-tight text-slate-800"
          />
          <NumericFormat
            className="text-sm text-slate-500 mt-1"
            displayType="text"
            value={(bitUSD?.price || 0) * (value || 0)}
            prefix={"≈ $"}
            thousandSeparator=","
            decimalScale={2}
            fixedDecimalScale
          />
          {error && (
            <p className="text-xs text-red-500 mt-1">{error.join(" ")}</p>
          )}
        </div>
        <div className="text-right">
          <div className="w-auto rounded-full h-10 px-4 border border-slate-200 bg-white shadow-sm flex items-center justify-start">
            <div className="bg-blue-100 p-1 rounded-full mr-2">
              <img
                src="/bitusd.png"
                alt="BTC"
                className="h-5 w-5 object-cover"
              />
            </div>
            <span className="font-medium">bitUSD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
