import {
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import type { ReactNode } from "react";

interface TransactionDetail {
  label: string;
  value: ReactNode;
}

interface TransactionStatusProps {
  // Transaction state
  transactionHash?: string;
  isError?: boolean;
  isSuccess?: boolean;
  error?: Error | null;

  // Content customization
  successTitle?: string;
  successSubtitle?: string;
  errorTitle?: string;
  errorSubtitle?: string;
  pendingTitle?: string;
  pendingSubtitle?: string;

  // Transaction details to display
  details?: TransactionDetail[];

  // Actions
  onComplete?: () => void;
  completeButtonText?: string;
  errorButtonText?: string;

  // Optional: hide certain elements
  hideTransactionLink?: boolean;
  hideCompleteButton?: boolean;
}

export function TransactionStatus({
  transactionHash,
  isError = false,
  isSuccess = false,
  error = null,
  successTitle = "Transaction Successful!",
  successSubtitle = "Your transaction has been completed successfully.",
  errorTitle = "Transaction Failed",
  errorSubtitle,
  pendingTitle = "Processing Transaction",
  pendingSubtitle = "Please wait while we confirm your transaction...",
  details,
  onComplete,
  completeButtonText = "Done",
  errorButtonText = "Try Again",
  hideTransactionLink = false,
  hideCompleteButton = false,
}: TransactionStatusProps) {
  // Determine the current state with neutral styling
  const getStatusIcon = () => {
    if (isError) {
      return (
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
      );
    }
    if (isSuccess) {
      return (
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
      );
    }
    return (
      <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neutral-600 animate-spin" />
      </div>
    );
  };

  const getStatusText = () => {
    if (isError) {
      return {
        title: errorTitle,
        subtitle:
          errorSubtitle ||
          error?.message ||
          "Something went wrong with your transaction",
      };
    }
    if (isSuccess) {
      return {
        title: successTitle,
        subtitle: successSubtitle,
      };
    }
    return {
      title: pendingTitle,
      subtitle: pendingSubtitle,
    };
  };

  const statusText = getStatusText();

  // Unified layout for all states - matching token-input styling
  return (
    <div className="bg-white rounded-2xl p-6 space-y-6">
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        {/* Status Icon */}
        {getStatusIcon()}

        {/* Status Text */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium font-sora text-neutral-800">
            {statusText.title}
          </h3>
          <p className="text-sm font-normal font-sora text-neutral-800/70 max-w-md">
            {statusText.subtitle}
          </p>
        </div>

        {/* Transaction Details - Only show when we have them */}
        {details && details.length > 0 && !isError && (
          <div className="w-full bg-white rounded-2xl p-6 space-y-6 border border-neutral-100">
            {details.map((detail, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                  {detail.label}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-neutral-800 text-base font-medium font-sora leading-none">
                    {detail.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="w-full flex gap-3 mt-auto">
          {transactionHash && !isError && !hideTransactionLink && (
            <a
              href={`https://voyager.online/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 text-xs text-neutral-800 font-medium font-sora rounded-xl outline outline-offset-[-1px] outline-button-border bg-transparent hover:bg-button-border/50 transition-colors flex items-center justify-center gap-2"
            >
              View Transaction
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          {(isSuccess || isError) &&
            onComplete &&
            !hideCompleteButton && (
              <button
                onClick={onComplete}
                className={`flex-1 py-3 px-4 text-xs font-medium font-sora rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  isError 
                    ? "bg-red-500 text-white hover:bg-red-600" 
                    : "bg-[#006CFF] text-white hover:bg-[#0056CC]"
                }`}
              >
                {isError ? errorButtonText : completeButtonText}
                {isError ? (
                  <RefreshCw className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
