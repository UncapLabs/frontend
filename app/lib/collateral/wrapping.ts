import type { Call } from "starknet";
import type { Collateral } from "./index";
import { contractCall } from "~/lib/contracts/calls";

/**
 * Centralized wrapping logic for collaterals that require wrapping/unwrapping
 * (e.g., WMWBTC which wraps from 8 decimals to 18 decimals)
 */

/**
 * Check if a collateral requires wrapping
 */
export function requiresWrapping(collateral: Collateral): boolean {
  return !!collateral.underlyingToken;
}

/**
 * Get the token address to use for balance queries
 * For wrapped tokens, returns the underlying address
 */
export function getBalanceTokenAddress(collateral: Collateral) {
  return collateral.underlyingToken?.address || collateral.addresses.token;
}

/**
 * Get the decimals to use for balance display and user input
 * For wrapped tokens, returns the underlying decimals
 */
export function getBalanceDecimals(collateral: Collateral): number {
  return collateral.underlyingToken?.decimals || collateral.decimals;
}

/**
 * Generate calls to approve and deposit collateral from bigint amount (with wrapping if needed)
 * Used when amount is already in wrapped token decimals (18)
 *
 * @param collateral - The collateral configuration
 * @param wrappedAmount - Amount in wrapped token decimals (bigint)
 * @param spender - Address that will spend the tokens
 * @returns Array of calls to execute the deposit flow
 */
export function generateDepositCallsFromBigint(
  collateral: Collateral,
  wrappedAmount: bigint,
  spender: string
): Call[] {
  if (!requiresWrapping(collateral) || !collateral.underlyingToken) {
    // For non-wrapped collateral, just approve
    return [
      contractCall.token.approve(
        collateral.addresses.token,
        spender,
        wrappedAmount
      ),
    ];
  }

  const underlyingDecimals = collateral.underlyingToken.decimals;
  const wrapperAddress = collateral.addresses.token;

  // Convert from wrapped decimals (18) to underlying decimals (e.g., 8)
  const decimalsDiff = 18n - BigInt(underlyingDecimals);
  const underlyingAmount = wrappedAmount / (10n ** decimalsDiff);

  return [
    // 1. Approve underlying token spending to CollateralWrapper
    contractCall.token.approve(
      collateral.underlyingToken.address,
      wrapperAddress,
      underlyingAmount
    ),

    // 2. Wrap underlying token
    contractCall.collateralWrapper.wrap(wrapperAddress, underlyingAmount),

    // 3. Approve wrapped token to spender
    contractCall.token.approve(wrapperAddress, spender, wrappedAmount),
  ];
}

/**
 * Generate a call to unwrap tokens from bigint amount
 * Used when amount is already in wrapped token decimals (18)
 *
 * @param collateral - The collateral configuration
 * @param wrappedAmount - Amount in wrapped token decimals (bigint)
 * @returns Call to unwrap tokens
 */
export function generateUnwrapCallFromBigint(
  collateral: Collateral,
  wrappedAmount: bigint
): Call {
  if (!requiresWrapping(collateral)) {
    throw new Error(`Collateral ${collateral.id} does not require wrapping`);
  }

  const wrapperAddress = collateral.addresses.token;
  return contractCall.collateralWrapper.unwrap(wrapperAddress, wrappedAmount);
}
