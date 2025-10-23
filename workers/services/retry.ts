import { backOff } from "exponential-backoff";

interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  shouldRetry?: (error: any) => boolean;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error) => {
    // Don't retry on certain errors
    if (error?.code === "INVALID_PARAMS") return false;
    if (error?.message?.includes("Invalid trove")) return false;
    if (error?.message?.includes("Invalid prefixed trove ID")) return false;

    // Retry on rate limit and network errors
    if (error?.code === 429) return true;
    if (error?.message?.toLowerCase().includes("rate limit")) return true;
    if (error?.message?.toLowerCase().includes("timeout")) return true;
    if (error?.message?.toLowerCase().includes("network")) return true;
    if (error?.message?.toLowerCase().includes("fetch")) return true;
    if (error?.message?.includes("Cannot read properties")) return true; // Starknet RPC errors

    return true;
  },
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS,
  context?: string
): Promise<T | null> {
  const resolvedOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  const {
    maxRetries,
    initialDelay,
    maxDelay,
    backoffFactor,
    shouldRetry,
  } = resolvedOptions;

  const shouldRetryFn = shouldRetry ?? (() => true);
  const contextLabel = context || "Function";

  let attemptCount = 0;
  let lastError: unknown;

  try {
    const result = await backOff(
      async () => {
        if (attemptCount > 0) {
          console.log(
            `[retryWithBackoff] ${contextLabel} - Retry attempt ${attemptCount}/${maxRetries}`
          );
        }

        attemptCount += 1;

        try {
          return await fn();
        } catch (error) {
          lastError = error;
          throw error;
        }
      },
      {
        startingDelay: initialDelay,
        maxDelay,
        timeMultiple: backoffFactor,
        numOfAttempts: maxRetries + 1,
        jitter: "full",
        delayFirstAttempt: false,
        retry: (error, attemptNumber) => {
          const attemptJustFailed = Math.max(1, attemptNumber - 1);
          const retriesUsed = attemptJustFailed - 1;
          const isLastAttempt = retriesUsed >= maxRetries;
          const shouldRetryResult = shouldRetryFn(error);

          console.log(
            `[retryWithBackoff] ${contextLabel} - Attempt ${attemptJustFailed} failed:`,
            {
              error,
              shouldRetry: shouldRetryResult,
              isLastAttempt,
            }
          );

          if (!shouldRetryResult || isLastAttempt) {
            return false;
          }

          const baseDelay = Math.min(
            initialDelay * Math.pow(backoffFactor, retriesUsed),
            maxDelay
          );

          console.log(
            `[retryWithBackoff] ${contextLabel} - Waiting up to ${Math.round(
              baseDelay
            )}ms before retry...`
          );

          return true;
        },
      }
    );

    return result;
  } catch (error) {
    console.error(
      `[retryWithBackoff] ${contextLabel} - Failed after ${attemptCount} attempts:`,
      lastError ?? error
    );
    return null;
  }
}
