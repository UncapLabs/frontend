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
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(
          `[retryWithBackoff] ${
            context || "Function"
          } - Retry attempt ${attempt}/${options.maxRetries}`
        );
      }
      return await fn();
    } catch (error) {
      const shouldRetry = options.shouldRetry?.(error) ?? true;
      const isLastAttempt = attempt === options.maxRetries;

      console.log(
        `[retryWithBackoff] ${context || "Function"} - Attempt ${
          attempt + 1
        } failed:`,
        {
          error: error,
          shouldRetry,
          isLastAttempt,
        }
      );

      if (isLastAttempt || !shouldRetry) {
        console.error(
          `[retryWithBackoff] ${context || "Function"} - Failed after ${
            attempt + 1
          } attempts:`,
          error
        );
        return null;
      }

      const delay = Math.min(
        options.initialDelay * Math.pow(options.backoffFactor, attempt),
        options.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const totalDelay = delay + jitter;

      console.log(
        `[retryWithBackoff] ${context || "Function"} - Waiting ${Math.round(
          totalDelay
        )}ms before retry...`
      );
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  return null;
}
