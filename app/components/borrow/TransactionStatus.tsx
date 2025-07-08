import { Loader2, CheckCircle2, XCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { NumericFormat } from "react-number-format";
import { TBTC_SYMBOL, INTEREST_RATE_SCALE_DOWN_FACTOR } from "~/lib/constants";
import { useQueryState } from "nuqs";
import { useTransactionReceipt } from "@starknet-react/core";

interface TransactionDetails {
  collateralAmount: number;
  borrowAmount: number;
  transactionHash: string;
}

interface TransactionStatusProps {
  shouldShowSuccess: boolean;
  transactionDetails: TransactionDetails | null;
  annualInterestRate: bigint;
  transactionHash?: string;
  onNewBorrow: () => void;
  isPending?: boolean;
  isError?: boolean;
  error?: Error | null;
}

export function TransactionStatus({
  shouldShowSuccess,
  transactionDetails,
  annualInterestRate,
  transactionHash,
  onNewBorrow,
  isPending = false,
  isError = false,
  error = null,
}: TransactionStatusProps) {
  // URL state for transaction hash
  const [urlTransactionHash, setUrlTransactionHash] = useQueryState('tx', {
    defaultValue: '',
  });

  // Update URL when we get a transaction hash from props
  if (transactionHash && !urlTransactionHash) {
    setUrlTransactionHash(transactionHash);
  }

  // Fetch transaction receipt if we have a URL hash but no active transaction
  const {
    data: urlReceipt,
    isSuccess: urlTxSuccess,
    isError: urlTxError,
    error: urlError,
  } = useTransactionReceipt({
    hash: urlTransactionHash || undefined,
    watch: false,
    enabled: !!urlTransactionHash && !transactionHash,
  });

  // Determine which state to show (prioritize props over URL)
  const displayHash = transactionHash || urlTransactionHash;
  const displayIsSuccess = transactionHash ? shouldShowSuccess : urlTxSuccess;
  const displayIsError = transactionHash ? isError : urlTxError;
  const displayError = transactionHash ? error : urlError;
  const displayIsPending = transactionHash ? isPending : (!!urlTransactionHash && !urlTxSuccess && !urlTxError);

  // Enhanced onNewBorrow that also clears URL
  const handleNewPosition = () => {
    setUrlTransactionHash('');
    onNewBorrow();
  };

  // Determine the current state
  const getStatusIcon = () => {
    if (displayIsError) {
      return (
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
      );
    }
    if (displayIsSuccess) {
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
    if (displayIsError) {
      return {
        title: "Transaction Failed",
        subtitle: displayError?.message || "Something went wrong with your transaction",
      };
    }
    if (displayIsSuccess) {
      return {
        title: "Borrow Successful!",
        subtitle: "Your position has been created successfully.",
      };
    }
    return {
      title: "Processing Transaction",
      subtitle: "Please wait while we confirm your transaction...",
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
          {transactionDetails && !displayIsError && (
            <div className="w-full bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  Collateral Deposited
                </span>
                <span className="font-semibold text-slate-800">
                  <NumericFormat
                    displayType="text"
                    value={transactionDetails.collateralAmount}
                    thousandSeparator=","
                    decimalScale={7}
                    fixedDecimalScale={false}
                  />{" "}
                  {TBTC_SYMBOL}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Amount Borrowed</span>
                <span className="font-semibold text-slate-800">
                  <NumericFormat
                    displayType="text"
                    value={transactionDetails.borrowAmount}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />{" "}
                  bitUSD
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  Interest Rate (APR)
                </span>
                <span className="font-semibold text-slate-800">
                  {Number(annualInterestRate) /
                    Number(INTEREST_RATE_SCALE_DOWN_FACTOR)}
                  %
                </span>
              </div>
            </div>
          )}

          {/* Transaction Hash */}
          {displayHash && (
            <p className="text-xs text-slate-500 font-mono break-all text-center max-w-md">
              TX: {displayHash}
            </p>
          )}

          {/* Actions */}
          <div className="w-full flex flex-col space-y-3 mt-auto">
            {displayHash && !displayIsError && (
              <a
                href={`https://voyager.online/tx/${displayHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                View Transaction <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {(displayIsSuccess || displayIsError) && (
              <Button
                onClick={handleNewPosition}
                variant={displayIsError ? "default" : "outline"}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {displayIsError ? "Try Again" : "Create New Position"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
