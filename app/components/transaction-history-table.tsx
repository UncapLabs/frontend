import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useTransactionStore } from "~/providers/transaction-provider";
import { useAccount } from "@starknet-react/core";
import type { StarknetTransaction, TransactionType } from "~/types/transaction";
import { formatDistance } from "date-fns";
import { useTransactionStoreData } from "~/hooks/use-transaction-store-data";

// Transaction type labels
const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  borrow: "Open Trove",
  adjust: "Adjust Trove",
  close: "Close Trove",
  claim: "Claim Rewards",
  claim_surplus: "Claim Collateral Surplus",
  adjust_rate: "Adjust Interest Rate",
  deposit: "Deposit to Stability Pool",
  withdraw: "Withdraw from Stability Pool",
  unknown: "Transaction",
};

// Status icons and colors
function StatusBadge({ status }: { status: StarknetTransaction["status"] }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="pending" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Pending
        </Badge>
      );
    case "success":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Success
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
  }
}

// Format transaction details for display
function formatTransactionDetails(
  transaction: StarknetTransaction
): React.ReactNode {
  const { type, details } = transaction;

  if (!details) return null;

  switch (type) {
    case "borrow":
      return (
        <div className="space-y-1">
          <div className="text-xs font-sora text-neutral-500">
            Deposited: {details.collateralAmount} {details.collateralToken}
          </div>
          <div className="text-xs font-sora text-neutral-500">
            Borrowed: {details.borrowAmount} USDU
          </div>
          <div className="text-xs font-sora text-neutral-500">
            Rate: {details.interestRate}% APR
          </div>
        </div>
      );

    case "adjust":
      // Calculate changes from previous and new values if the explicit flags aren't present
      const collateralChange =
        details.newCollateral !== undefined &&
        details.previousCollateral !== undefined
          ? details.newCollateral - details.previousCollateral
          : details.collateralChange;

      const debtChange =
        details.newDebt !== undefined && details.previousDebt !== undefined
          ? details.newDebt - details.previousDebt
          : details.debtChange;

      const hasCollateralChange =
        details.hasCollateralChange ||
        (collateralChange !== undefined &&
          Math.abs(collateralChange) > 0.0000001);

      const hasDebtChange =
        details.hasDebtChange ||
        (debtChange !== undefined && Math.abs(debtChange) > 0.01);

      const isCollateralIncrease =
        details.isCollateralIncrease !== undefined
          ? details.isCollateralIncrease
          : collateralChange > 0;

      const isDebtIncrease =
        details.isDebtIncrease !== undefined
          ? details.isDebtIncrease
          : debtChange > 0;

      // Check if we have interest rate changes
      const hasInterestRateChange =
        details.hasInterestRateChange ||
        (details.newInterestRate !== undefined &&
          details.previousInterestRate !== undefined &&
          Math.abs(
            (details.newInterestRate || 0) - (details.previousInterestRate || 0)
          ) > 0.001);

      return (
        <div className="space-y-1">
          {/* Show collateral changes if any */}
          {hasCollateralChange && collateralChange !== undefined && (
            <div className="text-xs font-sora text-neutral-500">
              {isCollateralIncrease ? "Added collateral" : "Removed collateral"}
              : {isCollateralIncrease ? "+" : ""}
              {Math.abs(collateralChange).toFixed(7)}{" "}
              {details.collateralToken || "BTC"}
            </div>
          )}

          {/* Show debt changes if any */}
          {hasDebtChange && debtChange !== undefined && (
            <div className="text-xs font-sora text-neutral-500">
              {isDebtIncrease ? "Borrowed more" : "Repaid debt"}:{" "}
              {isDebtIncrease ? "+" : "-"}
              {Math.abs(debtChange).toFixed(2)} USDU
            </div>
          )}

          {/* Show interest rate changes if any */}
          {hasInterestRateChange && (
            <div className="text-xs font-sora text-neutral-500">
              {(details.newInterestRate || details.interestRate || 0) >
              (details.previousInterestRate || details.interestRate || 0)
                ? "Increased rate"
                : "Decreased rate"}
              : {details.previousInterestRate || details.interestRate || "—"}% →{" "}
              {details.newInterestRate || details.interestRate || "—"}% APR
            </div>
          )}

          {/* If none of the above changes, show current state */}
          {!hasCollateralChange && !hasDebtChange && !hasInterestRateChange && (
            <>
              {details.newCollateral !== undefined && (
                <div className="text-xs font-sora text-neutral-500">
                  Collateral: {details.newCollateral}{" "}
                  {details.collateralToken || "BTC"}
                </div>
              )}
              {details.newDebt !== undefined && (
                <div className="text-xs font-sora text-neutral-500">
                  Debt: {details.newDebt} USDU
                </div>
              )}
              {details.newInterestRate !== undefined && (
                <div className="text-xs font-sora text-neutral-500">
                  Rate: {details.newInterestRate}% APR
                </div>
              )}
            </>
          )}
        </div>
      );

    case "close":
      return (
        <div className="space-y-1">
          <div className="text-xs font-sora text-neutral-500">
            Repaid: {details.debt} USDU
          </div>
          <div className="text-xs font-sora text-neutral-500">
            Recovered: {details.collateral} {details.collateralType || "BTC"}
          </div>
        </div>
      );

    case "claim":
      return (
        <div className="space-y-1">
          <div className="text-xs font-sora text-neutral-500">
            Claimed: {details.amount} {details.token}
          </div>
        </div>
      );

    case "claim_surplus":
      return (
        <div className="space-y-1">
          <div className="text-xs font-sora text-neutral-500">
            Recovered: {details.amount} {details.token || "BTC"}
          </div>
        </div>
      );

    case "adjust_rate":
      return (
        <div className="space-y-1">
          <div className="text-xs font-sora text-neutral-500">
            Previous rate: {details.oldRate}% APR
          </div>
          <div className="text-xs font-sora text-neutral-500">
            New rate: {details.newRate}% APR
          </div>
        </div>
      );

    case "deposit":
      return (
        <div className="space-y-1">
          <div className="text-xs font-sora text-neutral-500">
            Deposited: {details.amount} USDU
          </div>
          {details.pool && (
            <div className="text-xs font-sora text-neutral-500">
              Pool: {details.pool}
            </div>
          )}
        </div>
      );

    case "withdraw":
      return (
        <div className="space-y-1">
          <div className="text-xs font-sora text-neutral-500">
            Withdrawn: {details.amount} USDU
          </div>
          {details.pool && (
            <div className="text-xs font-sora text-neutral-500">
              Pool: {details.pool}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

// Transaction card component
function TransactionCard({
  transaction,
}: {
  transaction: StarknetTransaction;
}) {
  const details = formatTransactionDetails(transaction);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        {/* Header row: Type and Status Badge */}
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm font-sora text-neutral-800">
            {TRANSACTION_TYPE_LABELS[transaction.type]}
          </h4>
          <StatusBadge status={transaction.status} />
        </div>

        {/* Transaction Details */}
        {details && <div className="text-sm text-neutral-600">{details}</div>}

        {/* Bottom row: Time and Explorer link */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-sora text-neutral-500">
            {formatDistance(transaction.timestamp, new Date(), {
              addSuffix: true,
            })}
          </div>

          {/* View on Explorer */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-6 w-6 flex-shrink-0"
          >
            <a
              href={`https://voyager.online/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function TransactionHistoryTable() {
  const { address } = useAccount();
  const store = useTransactionStore();
  const { transactions } = useTransactionStoreData(address);

  const clearHistory = () => {
    if (address) {
      store.clearTransactions(address);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p className="text-sm font-sora">No transactions yet</p>
        <p className="text-xs font-sora mt-1">
          Your transaction history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-sora text-neutral-600">
          {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="text-xs font-sora hover:text-red-600"
        >
          Clear History
        </Button>
      </div>

      {/* Transaction cards */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {transactions.map((transaction) => (
          <TransactionCard key={transaction.hash} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}
