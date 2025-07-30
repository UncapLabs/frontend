import {
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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
  // Determine the current state
  const getStatusIcon = () => {
    if (isError) {
      return (
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
      );
    }
    if (isSuccess) {
      return (
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
      );
    }
    return (
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
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

  // Unified layout for all states
  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
          {/* Status Icon */}
          {getStatusIcon()}

          {/* Status Text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">
              {statusText.title}
            </h3>
            <p className="text-sm text-slate-600 max-w-md">
              {statusText.subtitle}
            </p>
          </div>

          {/* Transaction Details - Only show when we have them */}
          {details && details.length > 0 && !isError && (
            <div className="w-full bg-slate-50 rounded-xl p-4 space-y-3">
              {details.map((detail, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">{detail.label}</span>
                  <span className="font-semibold text-slate-800">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Transaction Hash */}
          {transactionHash && (
            <p className="text-xs text-slate-500 font-mono break-all text-center max-w-md">
              TX: {transactionHash}
            </p>
          )}

          {/* Actions */}
          <div className="w-full flex flex-col space-y-3 mt-auto">
            {transactionHash && !isError && !hideTransactionLink && (
              <a
                href={`https://voyager.online/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                View Transaction <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {(isSuccess || isError) &&
              onComplete &&
              !hideCompleteButton && (
                <Button
                  onClick={onComplete}
                  variant={isError ? "default" : "outline"}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {isError ? errorButtonText : completeButtonText}
                </Button>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
