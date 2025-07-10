import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { MAX_LIMIT } from "~/lib/utils/calc";
import { TBTC_SYMBOL } from "~/lib/constants";

interface CollateralInputProps {
  value?: number;
  onChange: (values: NumberFormatValues) => void;
  onBlur?: () => void;
  bitcoin?: { price: number };
  bitcoinBalance?: { value: bigint; formatted: string };
  onPercentageClick: (percentage: number) => void;
  error?: string[];
  disabled?: boolean;
}

export function CollateralInput({
  value,
  onChange,
  onBlur,
  bitcoin,
  bitcoinBalance,
  onPercentageClick,
  error,
  disabled = false,
}: CollateralInputProps) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-3 group">
      <div className="flex justify-between items-center">
        <Label
          htmlFor="collateralAmount"
          className="text-base md:text-lg font-medium text-slate-700"
        >
          You deposit
        </Label>
        {bitcoinBalance?.value && bitcoinBalance.value > 0 && (
          <div className="flex items-center space-x-1">
            <Button
              type="button"
              variant="outline"
              className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
              onClick={() => onPercentageClick(0.25)}
              disabled={disabled}
            >
              25%
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
              onClick={() => onPercentageClick(0.5)}
              disabled={disabled}
            >
              50%
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
              onClick={() => onPercentageClick(0.75)}
              disabled={disabled}
            >
              75%
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors font-medium"
              onClick={() => onPercentageClick(1)}
              disabled={disabled}
            >
              Max.
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-start justify-between space-x-4">
        <div className="flex-grow">
          <NumericFormat
            id="collateralAmount"
            customInput={Input}
            thousandSeparator=","
            placeholder="0"
            inputMode="decimal"
            allowNegative={false}
            decimalScale={7}
            value={value}
            onValueChange={disabled ? undefined : onChange}
            onBlur={onBlur}
            disabled={disabled}
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
            value={(bitcoin?.price || 0) * (value || 0)}
            prefix={"≈ $"}
            thousandSeparator=","
            decimalScale={2}
            fixedDecimalScale
          />
          {error && error.length > 0 && (
            <div className="flex items-start gap-1 mt-2">
              <svg
                className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-red-600 font-medium">
                {error.join(" ")}
              </p>
            </div>
          )}
        </div>
        <div className="text-right">
          <Select defaultValue="BTC" disabled={disabled}>
            <SelectTrigger className="w-auto min-w-[120px] rounded-full h-10 pl-2 pr-3 border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors flex items-center">
              <SelectValue placeholder="Token" />
            </SelectTrigger>
            <SelectContent className="border border-slate-200 shadow-md">
              <SelectItem value="BTC">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-1 rounded-full mr-2">
                    <img
                      src="/bitcoin.png"
                      alt="BTC"
                      className="h-5 w-5 object-cover"
                    />
                  </div>
                  <span className="font-medium">{TBTC_SYMBOL}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-slate-500 mt-1">
            {bitcoinBalance?.value && bitcoinBalance.value > 0 && (
              <>
                Balance:{" "}
                <NumericFormat
                  displayType="text"
                  value={bitcoinBalance.formatted}
                  thousandSeparator=","
                  decimalScale={3}
                  fixedDecimalScale
                />{" "}
                {TBTC_SYMBOL}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
