import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface ChangeInputProps {
  label: string;
  currentValue: number;
  changeValue?: number;
  onChangeValue: (value: number | undefined) => void;
  token: {
    symbol: string;
    decimals: number;
  };
  balance?: {
    value: bigint;
    formatted: string;
  };
  price?: { price: number };
  mode: "add" | "remove";
  maxValue?: number;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onPercentageClick?: (percentage: number) => void;
  decimals?: number;
}

export function ChangeInput({
  label,
  currentValue,
  changeValue,
  onChangeValue,
  token,
  balance,
  price,
  mode,
  maxValue,
  placeholder = "0",
  disabled = false,
  error,
  onPercentageClick,
  decimals = 7,
}: ChangeInputProps) {
  const handleValueChange = (values: NumberFormatValues) => {
    onChangeValue(values.floatValue);
  };

  const finalValue = changeValue !== undefined
    ? (mode === "add" ? currentValue + changeValue : currentValue - changeValue)
    : currentValue;

  const usdValue = changeValue && price ? changeValue * price.price : 0;

  const maxAvailable = mode === "add"
    ? (balance ? Number(balance.value) / 10 ** token.decimals : 0)
    : currentValue;

  return (
    <div className="space-y-3">
      {/* Current value display */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-600">Current {label}:</span>
        <span className="font-medium">
          <NumericFormat
            displayType="text"
            value={currentValue}
            thousandSeparator=","
            decimalScale={decimals}
            fixedDecimalScale={false}
          />{" "}
          {token.symbol}
        </span>
      </div>

      {/* Change input */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium text-slate-700">
            Amount to {mode === "add" ? "Add" : "Remove"}
          </Label>
          {onPercentageClick && (
            <div className="flex items-center space-x-1">
              {[25, 50, 75].map((pct) => (
                <Button
                  key={pct}
                  type="button"
                  variant="outline"
                  className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100"
                  onClick={() => onPercentageClick(maxAvailable * (pct / 100))}
                  disabled={disabled || maxAvailable === 0}
                >
                  {pct}%
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 font-medium"
                onClick={() => onPercentageClick(maxAvailable)}
                disabled={disabled || maxAvailable === 0}
              >
                Max
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between space-x-4">
          <div className="flex-grow">
            <NumericFormat
              customInput={Input}
              thousandSeparator=","
              placeholder={placeholder}
              inputMode="decimal"
              allowNegative={false}
              decimalScale={decimals}
              value={changeValue}
              onValueChange={disabled ? undefined : handleValueChange}
              disabled={disabled}
              isAllowed={(values) => {
                const { floatValue } = values;
                if (floatValue === undefined) return true;
                if (maxValue !== undefined && floatValue > maxValue) return false;
                if (mode === "remove" && floatValue > currentValue) return false;
                return true;
              }}
              className={cn(
                "text-2xl font-semibold h-auto p-0 border-none bg-transparent",
                "focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none",
                "outline-none shadow-none tracking-tight text-slate-800"
              )}
            />

            {usdValue > 0 && (
              <NumericFormat
                className="text-sm text-slate-500 mt-1"
                displayType="text"
                value={usdValue}
                prefix="≈ $"
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale
              />
            )}
          </div>

          <div className="text-right">
            <div className="w-auto rounded-full h-10 px-4 border border-slate-200 bg-white shadow-sm flex items-center">
              <span className="font-medium">{token.symbol}</span>
            </div>
            {balance && mode === "add" && (
              <div className="text-xs text-slate-500 mt-1">
                Available: <NumericFormat
                  displayType="text"
                  value={balance.formatted}
                  thousandSeparator=","
                  decimalScale={3}
                  fixedDecimalScale
                /> {token.symbol}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New value preview */}
      {changeValue !== undefined && changeValue > 0 && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">New {label}:</span>
          <span className={cn(
            "font-medium",
            finalValue < 0 && "text-red-600"
          )}>
            <NumericFormat
              displayType="text"
              value={Math.max(0, finalValue)}
              thousandSeparator=","
              decimalScale={decimals}
              fixedDecimalScale={false}
            />{" "}
            {token.symbol}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-1">
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
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}