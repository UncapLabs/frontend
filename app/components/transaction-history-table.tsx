import {
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useTransactionStore } from "~/providers/transaction-provider";
import { useAccount } from "@starknet-react/core";
import type { StarknetTransaction, TransactionType } from "~/types/transaction";
import { formatDistance } from "date-fns";
import { useTransactionStoreData } from "~/hooks/use-transaction-store-data";
import { truncateTroveId } from "~/lib/utils/trove-id";

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
function StatusBadge({ status }: { status: StarknetTransaction["status"] }) {
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
function formatTransactionDetails(transaction: StarknetTransaction): React.ReactNode {
  const { type, details } = transaction;

  if (!details) return null;

  switch (type) {
    case "borrow":
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-green-600">
              +{details.collateralAmount} {details.collateralToken}
            </span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="font-medium text-blue-600">
              +{details.borrowAmount} USDU
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Interest Rate: {details.interestRate}% APR
            {details.troveId && (
              <span className="ml-2">• Trove: {truncateTroveId(details.troveId)}</span>
            )}
          </div>
        </div>
      );
    
    case "adjust":
      // Calculate changes from previous and new values if the explicit flags aren't present
      const collateralChange = details.newCollateral !== undefined && details.previousCollateral !== undefined
        ? details.newCollateral - details.previousCollateral
        : details.collateralChange;
      
      const debtChange = details.newDebt !== undefined && details.previousDebt !== undefined
        ? details.newDebt - details.previousDebt
        : details.debtChange;
      
      const hasCollateralChange = details.hasCollateralChange || 
        (collateralChange !== undefined && Math.abs(collateralChange) > 0.0000001);
      
      const hasDebtChange = details.hasDebtChange || 
        (debtChange !== undefined && Math.abs(debtChange) > 0.01);
      
      const isCollateralIncrease = details.isCollateralIncrease !== undefined 
        ? details.isCollateralIncrease 
        : (collateralChange > 0);
      
      const isDebtIncrease = details.isDebtIncrease !== undefined
        ? details.isDebtIncrease
        : (debtChange > 0);

      return (
        <div className="space-y-1">
          {/* Show collateral changes if any */}
          {hasCollateralChange && collateralChange !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Collateral:</span>
              <span className={`font-medium flex items-center gap-1 ${
                isCollateralIncrease ? 'text-green-600' : 'text-orange-600'
              }`}>
                {isCollateralIncrease ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isCollateralIncrease ? '+' : '-'}
                {Math.abs(collateralChange).toFixed(7)} {details.collateralToken || 'BTC'}
              </span>
            </div>
          )}
          
          {/* Show debt changes if any */}
          {hasDebtChange && debtChange !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Debt:</span>
              <span className={`font-medium flex items-center gap-1 ${
                isDebtIncrease ? 'text-blue-600' : 'text-green-600'
              }`}>
                {isDebtIncrease ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isDebtIncrease ? '+' : '-'}
                {Math.abs(debtChange).toFixed(2)} USDU
              </span>
            </div>
          )}
          
          {/* Show interest rate changes if any */}
          {(details.hasInterestRateChange || details.newInterestRate !== undefined) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Interest Rate:</span>
              <span className="font-medium text-purple-600 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                {details.newInterestRate || details.interestRate}% APR
              </span>
            </div>
          )}
          
          {/* Show trove ID if present */}
          {details.troveId && (
            <div className="text-xs text-gray-500">
              Trove: {truncateTroveId(details.troveId)}
            </div>
          )}
        </div>
      );
    
    case "close":
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-orange-600">
              -{details.debt} USDU
            </span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="font-medium text-green-600">
              +{details.collateral} {details.collateralType || 'BTC'}
            </span>
          </div>
          {details.troveId && (
            <div className="text-xs text-gray-500">
              Closed Trove: {truncateTroveId(details.troveId)}
            </div>
          )}
        </div>
      );
    
    case "claim":
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium text-green-600">
            +{details.amount} {details.token}
          </span>
        </div>
      );
    
    case "adjust_rate":
      return (
        <div className="flex items-center gap-2">
          <span className="text-gray-600">{details.oldRate}%</span>
          <ArrowRight className="h-3 w-3 text-gray-400" />
          <span className="font-medium text-purple-600">{details.newRate}% APR</span>
        </div>
      );
    
    default:
      return null;
  }
}


// Transaction card component
function TransactionCard({ transaction }: { transaction: StarknetTransaction }) {
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
