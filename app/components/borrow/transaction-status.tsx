import { Loader2, CheckCircle2, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { NumericFormat } from "react-number-format";
import { TBTC_SYMBOL, INTEREST_RATE_SCALE_DOWN_FACTOR } from "~/lib/constants";
import { TransactionProgress } from "../transaction-flow/TransactionProgress";


interface TransactionDetails {
  collateralAmount: number;
  borrowAmount: number;
  transactionHash?: string;
}

export type TransactionState = "idle" | "pending" | "confirming" | "success" | "error";

interface TransactionStatusProps {
  transactionState: TransactionState;
  transactionDetails: TransactionDetails | null;
  annualInterestRate: bigint;
  transactionHash?: string;
  onNewBorrow: () => void;
  error?: Error | null;
}

export function TransactionStatus({
  transactionState,
  transactionDetails,
  annualInterestRate,
  transactionHash,
  onNewBorrow,
  error = null,
}: TransactionStatusProps) {
  // Show transaction progress for any active transaction state
  if (transactionState !== "success" && transactionState !== "idle") {
    return (
      <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <CardContent className="pt-6">
          <TransactionProgress
            isPending={transactionState === "pending" || transactionState === "confirming"}
            isSuccess={transactionState === "success"}
            isError={transactionState === "error"}
            error={error}
            transactionHash={transactionHash}
            onClose={onNewBorrow}
          />
        </CardContent>
      </Card>
    );
  }

  if (transactionState === "success" && transactionDetails) {
    // Success state
    return (
      <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-slate-800">
                Borrow Successful!
              </h3>
              <p className="text-sm text-slate-600">
                Your position has been created successfully.
              </p>
            </div>

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

            <div className="w-full flex flex-col space-y-3">
              <a
                href={`https://voyager.online/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                View Transaction <ExternalLink className="h-4 w-4" />
              </a>

              <Button
                onClick={onNewBorrow}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Create New Position
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
