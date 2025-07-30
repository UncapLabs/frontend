import {
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  useTransactionHistory,
  type StoredTransaction,
  type TransactionType,
} from "~/hooks/use-transaction-history";
import { formatDistance } from "date-fns";

// Transaction type labels
const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  borrow: "Open Trove",
  adjust: "Adjust Trove",
  close: "Close Trove",
  claim: "Claim Rewards",
  adjust_rate: "Adjust Interest Rate",
  unknown: "Transaction",
};

// Status icons and colors
function StatusBadge({ status }: { status: StoredTransaction["status"] }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Pending
        </Badge>
      );
    case "success":
      return (
        <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
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
function formatTransactionDetails(transaction: StoredTransaction): React.ReactNode {
  const { type, details } = transaction;

  switch (type) {
    case "borrow":
      return (
        <div className="flex items-center gap-1">
          <span className="font-medium">{details.collateralAmount} {details.collateralToken}</span>
          <ArrowRight className="h-3 w-3" />
          <span className="font-medium">{details.borrowAmount} USDU</span>
          <span className="text-xs text-gray-500">@ {details.interestRate}%</span>
        </div>
      );
    case "adjust":
      const collChange = details.isCollateralIncrease ? "+" : "-";
      const debtChange = details.isDebtIncrease ? "+" : "-";
      return (
        <div className="space-y-1">
          <div className="text-xs">
            Collateral: <span className="font-medium">{collChange}{Math.abs(details.collateralChange)}</span>
          </div>
          <div className="text-xs">
            Debt: <span className="font-medium">{debtChange}{Math.abs(details.debtChange)}</span>
          </div>
        </div>
      );
    case "close":
      return `Closed trove #${details.troveId}`;
    case "claim":
      return `Claimed ${details.amount} ${details.token}`;
    case "adjust_rate":
      return (
        <div className="flex items-center gap-1">
          <span>{details.oldRate}%</span>
          <ArrowRight className="h-3 w-3" />
          <span className="font-medium">{details.newRate}%</span>
        </div>
      );
    default:
      return null;
  }
}

// Transaction card component
function TransactionCard({ transaction }: { transaction: StoredTransaction }) {
  const details = formatTransactionDetails(transaction);
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* Header: Type and Status */}
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">
              {TRANSACTION_TYPE_LABELS[transaction.type]}
            </h4>
            <StatusBadge status={transaction.status} />
          </div>
          
          {/* Transaction Details */}
          {details && (
            <div className="text-sm text-gray-600">
              {details}
            </div>
          )}
          
          {/* Time and Hash */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              {formatDistance(transaction.timestamp, new Date(), {
                addSuffix: true,
              })}
            </span>
            <span className="font-mono truncate max-w-[200px]">
              {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
            </span>
          </div>
        </div>
        
        {/* View on Explorer */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-8 w-8 flex-shrink-0"
        >
          <a
            href={`https://voyager.online/tx/${transaction.hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </Card>
  );
}

export function TransactionHistoryTable() {
  const { transactions, clearHistory } = useTransactionHistory();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">No transactions yet</p>
        <p className="text-xs mt-1">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="text-xs hover:text-red-600"
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
