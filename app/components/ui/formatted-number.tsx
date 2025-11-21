import { NumericFormat } from "react-number-format";
import Big from "big.js";

/**
 * Unified component to format numbers with smart K/M abbreviation
 *
 * @param value - The Big number to format
 * @param prefix - Optional prefix (e.g., "$" for currency)
 * @param suffix - Optional suffix (e.g., " USDU" for tokens)
 * @param decimals - Number of decimal places for non-abbreviated numbers (default: 0)
 *
 * Examples:
 * - <FormattedNumber value={Big(500)} prefix="$" /> → "$500"
 * - <FormattedNumber value={Big(1500)} suffix=" USDU" /> → "1.5K USDU"
 * - <FormattedNumber value={Big(2300000)} prefix="$" /> → "$2.3M"
 */
export function FormattedNumber({
  value,
  prefix,
  suffix,
  decimals = 0,
}: {
  value: Big | undefined;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  if (!value) return <>—</>;

  let displayValue: Big;
  let abbr: string | undefined;

  if (value.gte(1_000_000)) {
    displayValue = value.div(1_000_000);
    abbr = "M";
  } else if (value.gte(1_000)) {
    displayValue = value.div(1_000);
    abbr = "K";
  } else {
    return (
      <NumericFormat
        displayType="text"
        value={value.toString()}
        thousandSeparator=","
        decimalScale={decimals}
        prefix={prefix}
        suffix={suffix}
      />
    );
  }

  return (
    <>
      {prefix}
      <NumericFormat
        displayType="text"
        value={displayValue.toString()}
        thousandSeparator=","
        decimalScale={1}
        fixedDecimalScale
      />
      {abbr}
      {suffix}
    </>
  );
}
