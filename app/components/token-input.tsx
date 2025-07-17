import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { MAX_LIMIT } from "~/lib/utils/calc";

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  icon?: string;
}

interface TokenInputProps {
  token: Token;
  tokens?: Token[]; // Array of available tokens
  onTokenChange?: (token: Token) => void; // Callback when token is changed
  balance?: {
    value?: bigint;
    formatted?: string;
  };
  price?: { price: number };
  value?: number;
  onChange: (value: number | undefined) => void;
  onBlur?: () => void;
  label: string;
  placeholder?: string;
  percentageButtons?: boolean;
  percentageButtonsOnHover?: boolean;
  onPercentageClick?: (percentage: number) => void;
  percentageButtonsDisabled?: boolean; // Custom override for percentage buttons disabled state
  disabled?: boolean;
  error?: string;
  helperText?: string;
  showBalance?: boolean;
  maxValue?: number;
}

export function TokenInput({
  token,
  tokens,
  onTokenChange,
  balance,
  price,
  value,
  onChange,
  onBlur,
  label,
  placeholder = "0",
  percentageButtons = false,
  percentageButtonsOnHover = false,
  onPercentageClick,
  percentageButtonsDisabled,
  disabled = false,
  error,
  helperText,
  showBalance = true,
  maxValue = MAX_LIMIT,
}: TokenInputProps) {
  const usdValue = value && price ? value * price.price : 0;

  const handleValueChange = (values: NumberFormatValues) => {
    onChange(values.floatValue);
  };

  const shouldShowPercentageButtons = percentageButtons && onPercentageClick;
  const shouldDisablePercentageButtons =
    percentageButtonsDisabled !== undefined
      ? percentageButtonsDisabled
      : !balance || balance.value === 0n || disabled;

  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-3 group">
      <div className="flex justify-between items-center">
        <Label
          htmlFor={`${token.symbol}-input`}
          className="text-base md:text-lg font-medium text-slate-700"
        >
          {label}
        </Label>
        {shouldShowPercentageButtons && (
          <div
            className={`${
              percentageButtonsOnHover
                ? (disabled
                    ? "opacity-50"
                    : "opacity-0 group-hover:opacity-100") +
                  " transition-opacity duration-300 ease-in-out"
                : ""
            } flex items-center space-x-1`}
          >
            {[25, 50, 75].map((pct) => (
              <Button
                key={pct}
                type="button"
                variant="outline"
                className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors"
                onClick={() => onPercentageClick(pct / 100)}
                disabled={shouldDisablePercentageButtons}
              >
                {pct}%
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors font-medium"
              onClick={() => onPercentageClick(1)}
              disabled={shouldDisablePercentageButtons}
            >
              Max.
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between space-x-4">
        <div className="flex-grow">
          <NumericFormat
            id={`${token.symbol}-input`}
            customInput={Input}
            thousandSeparator=","
            placeholder={placeholder}
            inputMode="decimal"
            allowNegative={false}
            decimalScale={7}
            value={value}
            onValueChange={disabled ? undefined : handleValueChange}
            onBlur={onBlur}
            disabled={disabled}
            isAllowed={(values) => {
              const { floatValue } = values;
              if (floatValue === undefined) return true;
              return floatValue < maxValue;
            }}
            className="text-3xl md:text-4xl font-semibold h-auto p-0 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none shadow-none tracking-tight text-slate-800"
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

          {error && (
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
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          {helperText && !error && (
            <p className="text-xs text-slate-600 mt-2">{helperText}</p>
          )}
        </div>

        <div className="text-right">
          {tokens && tokens.length > 1 && onTokenChange ? (
            <Select
              value={token.address}
              onValueChange={(address) => {
                const selectedToken = tokens.find((t) => t.address === address);
                if (selectedToken) onTokenChange(selectedToken);
              }}
              disabled={disabled}
            >
              <SelectTrigger className="w-auto min-w-[120px] rounded-full h-10 pl-2 pr-3 border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors flex items-center">
                <SelectValue placeholder="Token" />
              </SelectTrigger>
              <SelectContent className="border border-slate-200 shadow-md">
                {tokens.map((t) => (
                  <SelectItem key={t.address} value={t.address}>
                    <div className="flex items-center">
                      {t.icon && (
                        <div className="bg-blue-100 p-1 rounded-full mr-2">
                          <img
                            src={t.icon}
                            alt={t.symbol}
                            className="h-5 w-5 object-cover"
                          />
                        </div>
                      )}
                      <span className="font-medium">{t.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="w-auto rounded-full h-10 px-4 border border-slate-200 bg-white shadow-sm flex items-center justify-start">
              {token.icon && (
                <div className="bg-blue-100 p-1 rounded-full mr-2">
                  <img
                    src={token.icon}
                    alt={token.symbol}
                    className="h-5 w-5 object-cover"
                  />
                </div>
              )}
              <span className="font-medium">{token.symbol}</span>
            </div>
          )}

          {showBalance && balance && (
            <div className="text-xs text-slate-500 mt-1">
              Balance:{" "}
              <NumericFormat
                displayType="text"
                value={
                  balance.formatted ??
                  (balance.value
                    ? Number(balance.value) / 10 ** token.decimals
                    : 0)
                }
                thousandSeparator=","
                decimalScale={3}
                fixedDecimalScale
              />{" "}
              {token.symbol}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
