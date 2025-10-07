/**
 * Custom URL state parsers that preserve precision by using strings
 * Based on nuqs documentation: https://nuqs.dev/docs/parsers/making-your-own
 */

import { createParser } from "nuqs";
import Big from "big.js";

/**
 * Parser for decimal numbers using big.js library for full precision
 * Stores values as strings in URL, returns Big objects for calculations
 * Returns null for empty values (nuqs convention)
 */
export const parseAsBig = createParser({
  parse: (value: string): Big | null => {
    if (!value || value === "") return null;

    const cleaned = value.trim();

    // Check if it's a valid number format
    const isValid = /^-?\d*\.?\d+$/.test(cleaned);
    if (!isValid) return null;

    try {
      return new Big(cleaned);
    } catch {
      return null;
    }
  },
  serialize: (value: Big | null): string => {
    if (value === null || value === undefined) return "";
    return value.toString();
  },
});

/**
 * Parser for Big with a default value
 * Always returns a Big value (never null), using default when URL is empty
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
        // Round to 2 decimal places to avoid floating-point precision issues
        return new Big(cleaned).round(2);
      } catch {
        return new Big(defaultValue);
      }
    },
    serialize: (value: Big | null): string => {
      if (value === null || value === undefined) return "";

      // Round to 2 decimal places when serializing to URL
      const rounded = value.round(2);

      // Don't serialize default values to keep URL clean
      if (rounded.eq(new Big(defaultValue))) return "";

      return rounded.toString();
    },
  }).withDefault(new Big(defaultValue));
