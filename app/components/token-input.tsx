import { memo, type ReactNode } from "react";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { MAX_LIMIT } from "~/lib/contracts/constants";
import Big from "big.js";
import { bigintToBig } from "~/lib/decimal";
import type { Token } from "~/lib/collateral";

interface TokenInputProps {
  token: Token;
  tokens?: Token[]; // Array of available tokens
  onTokenChange?: (token: Token) => void; // Callback when token is changed
  balance?: {
    value?: bigint;
    formatted?: string;
  };
  price?: { price: Big };
  value?: Big | undefined;
  onChange: (value: Big | undefined) => void;
  onBlur?: () => void;
  label: string | ReactNode;
  placeholder?: string;
  percentageButtons?: boolean;
  percentageButtonsOnHover?: boolean;
  onPercentageClick?: (percentage: number) => void;
  customPercentageButtons?: ReactNode; // Custom buttons to replace percentage buttons
  onBalanceClick?: () => void; // Callback when balance is clicked
  disabled?: boolean;
  error?: string;
  helperText?: string;
  showBalance?: boolean;
  balanceLabel?: string; // Label for balance display (default: "Balance")
  maxValue?: number;
  includeMax?: boolean;
  tokenSelectorBgColor?: string;
  tokenSelectorTextColor?: string;
}

export const TokenInput = memo(function TokenInput({
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
  customPercentageButtons,
  onBalanceClick,
  disabled = false,
  error,
  helperText,
  showBalance = true,
  balanceLabel = "Balance",
  maxValue = MAX_LIMIT,
  includeMax = false,
  tokenSelectorBgColor = "bg-token-bg",
  tokenSelectorTextColor = "text-token-orange",
}: TokenInputProps) {
  // Convert value to string for display (preserves full precision)
  const displayValue = value?.toString() || "";

  // Calculate USD value (using Big for precision)
  const usdValue = (() => {
    if (!value || !price?.price) return new Big(0);
    return value.times(price.price);
  })();

  const handleValueChange = (values: NumberFormatValues) => {
    if (disabled) return;

    // Handle empty input - only set to undefined if truly empty
    if (!values.value || values.value === "") {
      onChange(undefined);
      return;
    }

    // Handle valid numeric input
    else {
      // Use the actual string value to preserve full precision!
      try {
        const bigValue = new Big(values.value);
        onChange(bigValue);
      } catch {
        // Fallback to floatValue if string parsing fails
        if (values.floatValue !== undefined) {
          onChange(new Big(values.floatValue.toString()));
        } else {
          onChange(undefined);
        }
      }
    }
  };

  const shouldShowPercentageButtons = percentageButtons && onPercentageClick;

  // Calculate balance as Big for display
  const balanceAsBig = balance?.value
    ? bigintToBig(balance.value, token.decimals)
    : undefined;

  return (
    <div className="bg-white rounded-2xl p-6 space-y-6 group">
      <div className="flex justify-between items-start">
        <Label
          htmlFor={`${token.symbol}-input`}
          className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight"
        >
          {label}
        </Label>

        {/* Custom buttons or percentage buttons on top right */}
        {customPercentageButtons
          ? customPercentageButtons
          : shouldShowPercentageButtons && (
              <div
                className={`${
                  percentageButtonsOnHover
                    ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
                    : ""
                } flex items-center gap-1.5`}
              >
                {(includeMax ? [25, 50, 75, 100] : [25, 50, 75]).map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    className="py-1 px-2 sm:py-2 sm:px-3 text-[10px] sm:text-xs text-neutral-800 font-medium font-sora rounded-md outline outline-offset-[-1px] outline-button-border bg-transparent hover:bg-button-border/50 transition-colors flex items-center justify-center"
                    onClick={() => onPercentageClick(pct / 100)}
                  >
                    {pct === 100 ? "MAX" : `${pct}%`}
                  </button>
                ))}
              </div>
            )}
      </div>

      {/* Main content area */}
      <div className="flex items-center gap-6">
        {/* Token selector on the left */}
        <div className="flex flex-col gap-2">
          {tokens && tokens.length > 1 && onTokenChange ? (
            <Select
              value={token.address}
              onValueChange={(address) => {
                const selectedToken = tokens.find((t) => t.address === address);
                if (selectedToken) onTokenChange(selectedToken);
              }}
            >
              <SelectTrigger
                className={`p-2.5 ${tokenSelectorBgColor} rounded-lg inline-flex justify-start items-center gap-2 h-auto border-0 hover:opacity-80 transition-all`}
                iconClassName={`${tokenSelectorTextColor} opacity-100`}
              >
                <div className="flex items-center gap-2">
                  {token.icon && (
                    <img
                      src={token.icon}
                      alt={token.symbol}
                      className="w-5 h-5 object-contain flex-shrink-0"
                    />
                  )}
                  <span
                    className={`${tokenSelectorTextColor} text-xs font-medium font-sora`}
                  >
                    {token.symbol}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="border border-neutral-200 rounded-lg shadow-md">
                {tokens.map((t) => (
                  <SelectItem key={t.address} value={t.address}>
                    <div className="flex items-center gap-2">
                      {t.icon && (
                        <img
                          src={t.icon}
                          alt={t.symbol}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      <span className="text-xs font-medium font-sora">
                        {t.symbol}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div
              className={`p-2.5 pr-7 ${tokenSelectorBgColor} rounded-lg inline-flex justify-start items-center gap-2`}
            >
              {token.icon && (
                <img
                  src={token.icon}
                  alt={token.symbol}
                  className="w-5 h-5 object-contain"
                />
              )}
              <span
                className={`${tokenSelectorTextColor} text-xs font-medium font-sora`}
              >
                {token.symbol}
              </span>
            </div>
          )}
        </div>

        {/* Input field on the right */}
        <div className="flex-1">
          <NumericFormat
            id={`${token.symbol}-input`}
            thousandSeparator=","
            placeholder={placeholder}
            inputMode="decimal"
            allowNegative={false}
            decimalScale={token.decimals}
            value={displayValue}
            onValueChange={handleValueChange}
            onBlur={onBlur}
            disabled={disabled}
            isAllowed={(values) => {
              const { floatValue } = values;
              return floatValue === undefined || floatValue < maxValue;
            }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora leading-8 sm:leading-9 md:leading-10 h-auto p-0 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none shadow-none text-neutral-800 w-full"
          />
        </div>
      </div>

      {/* Bottom row: USD value on left, Balance on right */}
      <div className="flex justify-between items-end">
        {/* USD value on bottom left */}
        <NumericFormat
          className="text-neutral-800 text-sm font-medium font-sora leading-none"
          displayType="text"
          value={usdValue.toString()}
          prefix="= $"
          thousandSeparator=","
          decimalScale={3}
          fixedDecimalScale
        />

        {/* Balance info on bottom right */}
        {showBalance && (
          <button
            type="button"
            onClick={onBalanceClick}
            disabled={!onBalanceClick || disabled || !balance?.value}
            className={`
              flex items-end gap-1
              ${
                onBalanceClick && balance?.value && !disabled
                  ? "cursor-pointer hover:opacity-70 transition-opacity"
                  : "cursor-default"
              }
            `}
          >
            <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
              {balanceLabel}:
            </span>
            {balance ? (
              <>
                <NumericFormat
                  className="text-neutral-800 text-base font-medium font-sora leading-none"
                  displayType="text"
                  value={balance.formatted ?? balanceAsBig?.toString() ?? "0"}
                  thousandSeparator=","
                  decimalScale={6}
                  fixedDecimalScale
                />
                <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                  {token.symbol}
                </span>
              </>
            ) : (
              <span className="text-neutral-800 text-base font-medium font-sora leading-none">
                -
              </span>
            )}
          </button>
        )}
      </div>

      {/* Error or Helper text */}
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
          <p className="text-xs text-red-600 font-medium font-sora">{error}</p>
        </div>
      )}

      {helperText && !error && (
        <p className="text-xs text-neutral-500 font-sora">{helperText}</p>
      )}
    </div>
  );
});
