/**
 * Custom URL state parsers that preserve precision by using strings
 * Based on nuqs documentation: https://nuqs.dev/docs/parsers/making-your-own
 */

import { createParser } from "nuqs";
import Big from "big.js";

/**
 * Parser for decimal numbers using big.js library for full precision
 * Stores values as strings in URL, returns Big objects for calculations
 */
export const parseAsBig = createParser({
  parse: (value: string): Big | null => {
    if (!value || value === "") return null;

    const cleaned = value.trim();

    // Check if it's a valid number format
    const isValid = /^-?\d*\.?\d+$/.test(cleaned);
    if (!isValid) return null;

    try {
      // Return as Big for full precision
      return new Big(cleaned);
    } catch {
      return null;
    }
  },
  serialize: (value: Big | null): string => {
    if (value === null || value === undefined) return "";

    // IMPORTANT: Preserve full precision - this is the whole point!
    // Don't remove "trailing zeros" - they're significant digits!
    return value.toString();
  },
});

/**
 * Parser for Big with a default value
 */
export const parseAsBigWithDefault = (defaultValue: string) =>
  createParser({
    parse: (value: string): Big => {
      if (!value || value === "") return new Big(defaultValue);

      const cleaned = value.trim();

      // Check if it's a valid number format
      const isValid = /^-?\d*\.?\d+$/.test(cleaned);
      if (!isValid) return new Big(defaultValue);

      try {
        return new Big(cleaned);
      } catch {
        return new Big(defaultValue);
      }
    },
    serialize: (value: Big): string => {
      if (value === null || value === undefined) return "";

      const str = value.toString();

      // Don't serialize default values to keep URL clean
      if (str === defaultValue) return "";

      // IMPORTANT: Preserve full precision - don't remove trailing zeros!
      return str;
    },
  }).withDefault(new Big(defaultValue));
