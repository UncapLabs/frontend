import {
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useTransactionStore } from "~/providers/transaction-provider";
import { useAccount } from "@starknet-react/core";
import type {
  StarknetTransaction,
  TransactionType,
  BorrowDetails,
  AdjustDetails,
  CloseDetails,
  ClaimDetails,
  ClaimSurplusDetails,
  AdjustRateDetails,
  DepositDetails,
  WithdrawDetails,
} from "~/types/transaction";
import { formatDistance } from "date-fns";
import { useTransactionStoreData } from "~/hooks/use-transaction-store-data";
import { COLLATERALS, type CollateralId } from "~/lib/collateral";
import { NumericFormat } from "react-number-format";

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

// Helper component to format numbers
function FormattedNumber({ value }: { value: string | number }) {
  return (
    <NumericFormat
      displayType="text"
      value={value}
      thousandSeparator=","
      decimalScale={4}
      fixedDecimalScale
    />
  );
}

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
    case "borrow": {
      const d = details as BorrowDetails;
      return (
        <div className="space-y-0.5">
          <div className="text-xs font-sora text-neutral-600">
            <span className="text-neutral-500">Deposited:</span>{" "}
            <span className="font-medium text-neutral-800">
              <FormattedNumber value={d.collateralAmount} /> {d.collateralToken}
            </span>
          </div>
          <div className="text-xs font-sora text-neutral-600">
            <span className="text-neutral-500">Borrowed:</span>{" "}
            <span className="font-medium text-neutral-800">
              <FormattedNumber value={d.borrowAmount} /> USDU
            </span>
          </div>
          <div className="text-xs font-sora text-neutral-600">
            <span className="text-neutral-500">Rate:</span>{" "}
            <span className="font-medium text-neutral-800">
              {d.interestRate}% APR
            </span>
          </div>
        </div>
      );
    }

    case "adjust": {
      const d = details as AdjustDetails;
      // Calculate changes from previous and new values if the explicit flags aren't present
      const collateralChange =
        d.newCollateral !== undefined && d.previousCollateral !== undefined
          ? d.newCollateral - d.previousCollateral
          : d.collateralChange;

      const debtChange =
        d.newDebt !== undefined && d.previousDebt !== undefined
          ? d.newDebt - d.previousDebt
          : d.debtChange;

      const hasCollateralChange =
        d.hasCollateralChange ||
        (collateralChange !== undefined &&
          Math.abs(collateralChange) > 0.0000001);

      const hasDebtChange =
        d.hasDebtChange ||
        (debtChange !== undefined && Math.abs(debtChange) > 0.01);

      const isCollateralIncrease =
        d.isCollateralIncrease !== undefined
          ? d.isCollateralIncrease
          : (collateralChange ?? 0) > 0;

      const isDebtIncrease =
        d.isDebtIncrease !== undefined
          ? d.isDebtIncrease
          : (debtChange ?? 0) > 0;

      // Check if we have interest rate changes
      const hasInterestRateChange =
        d.hasInterestRateChange ||
        (d.newInterestRate !== undefined &&
          d.previousInterestRate !== undefined &&
          Math.abs((d.newInterestRate || 0) - (d.previousInterestRate || 0)) >
            0.001);

      return (
        <div className="space-y-0.5">
          {/* Show collateral changes if any */}
          {hasCollateralChange && collateralChange !== undefined && (
            <div className="text-xs font-sora text-neutral-600">
              <span className="text-neutral-500">
                {isCollateralIncrease
                  ? "Added collateral:"
                  : "Removed collateral:"}
              </span>{" "}
              <span className="font-medium text-neutral-800">
                {isCollateralIncrease ? "+" : ""}
                <FormattedNumber value={Math.abs(collateralChange)} />{" "}
                {d.collateralToken || "BTC"}
              </span>
            </div>
          )}

          {/* Show debt changes if any */}
          {hasDebtChange && debtChange !== undefined && (
            <div className="text-xs font-sora text-neutral-600">
              <span className="text-neutral-500">
                {isDebtIncrease ? "Borrowed more:" : "Repaid debt:"}
              </span>{" "}
              <span className="font-medium text-neutral-800">
                {isDebtIncrease ? "+" : "-"}
                <FormattedNumber value={Math.abs(debtChange)} /> USDU
              </span>
            </div>
          )}

          {/* Show interest rate changes if any */}
          {hasInterestRateChange && (
            <div className="text-xs font-sora text-neutral-600">
              <span className="text-neutral-500">Rate:</span>{" "}
              <span className="font-medium text-neutral-800">
                {d.previousInterestRate || d.interestRate || "—"}% →{" "}
                {d.newInterestRate || d.interestRate || "—"}%
              </span>
            </div>
          )}

          {/* If none of the above changes, show current state */}
          {!hasCollateralChange && !hasDebtChange && !hasInterestRateChange && (
            <>
              {d.newCollateral !== undefined && (
                <div className="text-xs font-sora text-neutral-600">
                  <span className="text-neutral-500">Collateral:</span>{" "}
                  <span className="font-medium text-neutral-800">
                    <FormattedNumber value={d.newCollateral} />{" "}
                    {d.collateralToken || "BTC"}
                  </span>
                </div>
              )}
              {d.newDebt !== undefined && (
                <div className="text-xs font-sora text-neutral-600">
                  <span className="text-neutral-500">Debt:</span>{" "}
                  <span className="font-medium text-neutral-800">
                    <FormattedNumber value={d.newDebt} /> USDU
                  </span>
                </div>
              )}
              {d.newInterestRate !== undefined && (
                <div className="text-xs font-sora text-neutral-600">
                  <span className="text-neutral-500">Rate:</span>{" "}
                  <span className="font-medium text-neutral-800">
                    {d.newInterestRate}% APR
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    case "close": {
      const d = details as CloseDetails;
      return (
        <div className="space-y-0.5">
          <div className="text-xs font-sora text-neutral-600">
            <span className="text-neutral-500">Repaid:</span>{" "}
            <span className="font-medium text-neutral-800">
              <FormattedNumber value={d.debt} /> USDU
            </span>
          </div>
          <div className="text-xs font-sora text-neutral-600">
            <span className="text-neutral-500">Recovered:</span>{" "}
            <span className="font-medium text-neutral-800">
              <FormattedNumber value={d.collateral} />{" "}
              {d.collateralType || "BTC"}
            </span>
          </div>
        </div>
      );
    }

    case "claim": {
      const d = details as ClaimDetails;
      return (
        <div className="space-y-0.5">
          {/* Handle stability pool claims with separate rewards */}
          {d.usduRewards || d.collateralRewards ? (
            <>
              {d.usduRewards && Number(d.usduRewards) > 0 && (
                <div className="text-xs font-sora text-neutral-600">
                  <span className="text-neutral-500">USDU:</span>{" "}
                  <span className="font-medium text-neutral-800">
                    <FormattedNumber value={d.usduRewards} /> USDU
                  </span>
                </div>
              )}
              {d.collateralRewards && Number(d.collateralRewards) > 0 && (
                <div className="text-xs font-sora text-neutral-600">
                  <span className="text-neutral-500">
                    {d.collateralToken || "WBTC"}:
                  </span>{" "}
                  <span className="font-medium text-neutral-800">
                    <FormattedNumber value={d.collateralRewards} />{" "}
                    {d.collateralToken || "WBTC"}
                  </span>
                </div>
              )}
              {d.pool && (
                <div className="text-xs font-sora text-neutral-600">
                  <span className="text-neutral-500">Pool:</span>{" "}
                  <span className="font-medium text-neutral-800">
                    {COLLATERALS[d.pool as CollateralId]?.symbol || d.pool}
                  </span>
                </div>
              )}
            </>
          ) : (
            /* Handle simple claims */
            d.amount &&
            d.token && (
              <div className="text-xs font-sora text-neutral-600">
                <span className="text-neutral-500">Claimed:</span>{" "}
                <span className="font-medium text-neutral-800">
                  <FormattedNumber value={d.amount} /> {d.token}
                </span>
              </div>
            )
          )}
        </div>
      );
    }

    case "claim_surplus": {
      const d = details as ClaimSurplusDetails;
      return (
        <div className="space-y-0.5">
          <div className="text-xs font-sora text-neutral-600">
            <span className="text-neutral-500">Recovered:</span>{" "}
            <span className="font-medium text-neutral-800">
              <FormattedNumber value={d.amount} /> {d.token || "BTC"}
            </span>
          </div>
        </div>
      );
    }

    case "adjust_rate": {
      const d = details as AdjustRateDetails;
      return (
        <div className="space-y-0.5">
          <div className="text-xs font-sora text-neutral-600">
            <span className="text-neutral-500">Rate:</span>{" "}
            <span className="font-medium text-neutral-800">
              {d.oldRate}% → {d.newRate}%
            </span>
          </div>
        </div>
      );
    }

    case "deposit": {
      const d = details as DepositDetails;
      return (
        <div className="space-y-0.5">
          <div className="text-xs font-sora text-neutral-600">
            <span className="text-neutral-500">Deposited:</span>{" "}
            <span className="font-medium text-neutral-800">
              <FormattedNumber value={d.amount} /> USDU
            </span>
          </div>
          {d.pool && (
            <div className="text-xs font-sora text-neutral-600">
              <span className="text-neutral-500">Pool:</span>{" "}
              <span className="font-medium text-neutral-800">
                {COLLATERALS[d.pool as CollateralId]?.symbol || d.pool}
              </span>
            </div>
          )}
        </div>
      );
    }

    case "withdraw": {
      const d = details as WithdrawDetails;
      return (
        <div className="space-y-0.5">
          <div className="text-xs font-sora text-neutral-600">
            <span className="text-neutral-500">Withdrawn:</span>{" "}
            <span className="font-medium text-neutral-800">
              <FormattedNumber value={d.amount} /> USDU
            </span>
          </div>
          {/* Show claimed rewards if any */}
          {d.usduRewards && Number(d.usduRewards) > 0 && (
            <div className="text-xs font-sora text-neutral-600">
              <span className="text-neutral-500">+ USDU rewards:</span>{" "}
              <span className="font-medium text-neutral-800">
                <FormattedNumber value={d.usduRewards} /> USDU
              </span>
            </div>
          )}
          {d.collateralRewards && Number(d.collateralRewards) > 0 && (
            <div className="text-xs font-sora text-neutral-600">
              <span className="text-neutral-500">
                + {d.collateralToken || "WBTC"} rewards:
              </span>{" "}
              <span className="font-medium text-neutral-800">
                <FormattedNumber value={d.collateralRewards} />{" "}
                {d.collateralToken || "WBTC"}
              </span>
            </div>
          )}
          {d.pool && (
            <div className="text-xs font-sora text-neutral-600">
              <span className="text-neutral-500">Pool:</span>{" "}
              <span className="font-medium text-neutral-800">
                {COLLATERALS[d.pool as CollateralId]?.symbol || d.pool}
              </span>
            </div>
          )}
        </div>
      );
    }

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
    <Card className="rounded-xl border-0 shadow-none bg-white hover:bg-neutral-50 transition-colors">
      <div className="p-3 space-y-2">
        {/* Header row: Type and Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-medium text-sm font-sora text-neutral-800">
            {TRANSACTION_TYPE_LABELS[transaction.type]}
          </h4>
          <StatusBadge status={transaction.status} />
        </div>

        {/* Transaction Details */}
        {details && <div>{details}</div>}

        {/* Bottom row: Time and Explorer link */}
        <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100">
          <div className="text-xs font-sora text-neutral-500">
            {formatDistance(transaction.timestamp, new Date(), {
              addSuffix: true,
            })}
          </div>

          {/* View on Explorer */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-6 px-2 text-xs font-sora text-neutral-600 hover:text-token-bg-blue"
          >
            <a
              href={`https://voyager.online/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <span>View</span>
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
      <div className="bg-white rounded-2xl p-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-neutral-400" />
          </div>
          <p className="text-sm font-medium font-sora text-neutral-800">
            No transactions yet
          </p>
          <p className="text-xs font-sora text-neutral-500 mt-2">
            Your transaction history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium font-sora text-neutral-800">
          {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="text-xs font-sora text-neutral-600 hover:text-token-bg-red"
        >
          Clear History
        </Button>
      </div>

      {/* Transaction cards */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {transactions.map((transaction) => (
          <TransactionCard key={transaction.hash} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}
