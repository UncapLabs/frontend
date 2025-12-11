import { useCallback, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "@starknet-react/core";
import type {
  TransactionType,
  TransactionStatus,
  TransactionDetails,
} from "~/types/transaction";

export type { TransactionType, TransactionStatus };

// Base transaction structure
export interface StoredTransaction {
  hash: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  chainId: string;
  accountAddress: string;
  error?: string;
  details: TransactionDetails;
}

// Transaction history array
export interface TransactionHistory {
  transactions: StoredTransaction[];
  version: number; // For future migrations
}

// Hook configuration
interface UseTransactionHistoryConfig {
  maxTransactions?: number; // Max number of transactions to store (default: 50)
}

// Storage key
const STORAGE_KEY = "uncap_transaction_history";
const CURRENT_VERSION = 1;
const DEFAULT_MAX_TRANSACTIONS = 50;

export function useTransactionHistory(config?: UseTransactionHistoryConfig) {
  const { address, chainId } = useAccount();
  const maxTransactions = config?.maxTransactions || DEFAULT_MAX_TRANSACTIONS;

  // Default history
  const defaultHistory: TransactionHistory = {
    transactions: [],
    version: CURRENT_VERSION,
  };

  // Use localStorage hook
  const [history, setHistory] = useLocalStorage<TransactionHistory>(
    STORAGE_KEY,
    defaultHistory
  );

  // Filter transactions for current account and chain
  const filteredTransactions = useMemo(() => {
    if (!address || !chainId) return [];

    return history.transactions.filter(
      (tx) =>
        tx.accountAddress.toLowerCase() === address.toLowerCase() &&
        tx.chainId === chainId.toString()
    );
  }, [history.transactions, address, chainId]);

  // Add a new transaction
  const addTransaction = useCallback(
    (
      transaction: Omit<
        StoredTransaction,
        "timestamp" | "chainId" | "accountAddress"
      >
    ) => {
      if (!address || !chainId) {
        console.warn("Cannot add transaction without account or chain");
        return;
      }

      const newTransaction: StoredTransaction = {
        ...transaction,
        timestamp: Date.now(),
        chainId: chainId.toString(),
        accountAddress: address,
      };

      setHistory((prev) => {
        // Add new transaction at the beginning
        const allTransactions = [newTransaction, ...prev.transactions];

        // Group by account/chain and limit each group
        const grouped = allTransactions.reduce((acc, tx) => {
          const key = `${tx.accountAddress}-${tx.chainId}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(tx);
          return acc;
        }, {} as Record<string, StoredTransaction[]>);

        // Sort each group by timestamp and limit
        const limited = Object.values(grouped)
          .map((group) =>
            group
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, maxTransactions)
          )
          .flat()
          .sort((a, b) => b.timestamp - a.timestamp);

        return {
          ...prev,
          transactions: limited,
        };
      });
    },
    [address, chainId, maxTransactions, setHistory]
  );

  // Update transaction status
  const updateTransaction = useCallback(
    (
      hash: string,
      updates: Partial<Pick<StoredTransaction, "status" | "error">>
    ) => {
      setHistory((prev) => ({
        ...prev,
        transactions: prev.transactions.map((tx) =>
          tx.hash === hash ? { ...tx, ...updates } : tx
        ),
      }));
    },
    [setHistory]
  );

  // Get pending transactions for current account/chain
  const pendingTransactions = useMemo(
    () => filteredTransactions.filter((tx) => tx.status === "pending"),
    [filteredTransactions]
  );

  // Get transaction by hash
  const getTransaction = useCallback(
    (hash: string) => {
      return filteredTransactions.find((tx) => tx.hash === hash);
    },
    [filteredTransactions]
  );

  // Clear history for current account/chain
  const clearHistory = useCallback(() => {
    if (!address || !chainId) return;

    setHistory((prev) => ({
      ...prev,
      transactions: prev.transactions.filter(
        (tx) =>
          !(
            tx.accountAddress.toLowerCase() === address.toLowerCase() &&
            tx.chainId === chainId.toString()
          )
      ),
    }));
  }, [address, chainId, setHistory]);

  return {
    transactions: filteredTransactions,
    pendingTransactions,
    pendingCount: pendingTransactions.length,
    addTransaction,
    updateTransaction,
    getTransaction,
    clearHistory,
  };
}

// Helper function to create transaction details for different types
export function createTransactionDetails(
  type: TransactionType,
  details: TransactionDetails
): TransactionDetails {
  switch (type) {
    case "borrow":
      if ("collateralAmount" in details && "borrowAmount" in details) {
        return {
          collateralAmount: details.collateralAmount,
          borrowAmount: details.borrowAmount,
          interestRate: "interestRate" in details ? details.interestRate : 0,
          collateralToken:
            "collateralToken" in details ? details.collateralToken : "",
        };
      }
      return details;
    case "adjust":
      return details;
    case "close":
      if ("debt" in details && "collateral" in details) {
        return {
          debt: details.debt,
          collateral: details.collateral,
          troveId: "troveId" in details ? details.troveId : undefined,
          collateralType:
            "collateralType" in details ? details.collateralType : undefined,
        };
      }
      return details;
    case "claim":
      return details;
    case "claim_surplus":
      if ("amount" in details) {
        return {
          amount: details.amount,
          token: "token" in details ? details.token : undefined,
        };
      }
      return details;
    case "adjust_rate":
      if ("oldRate" in details && "newRate" in details) {
        return {
          oldRate: details.oldRate,
          newRate: details.newRate,
        };
      }
      return details;
    case "deposit":
      if ("amount" in details) {
        return {
          amount: details.amount,
          pool: "pool" in details ? details.pool : undefined,
        };
      }
      return details;
    case "withdraw":
      if ("amount" in details) {
        return {
          amount: details.amount,
          pool: "pool" in details ? details.pool : undefined,
        };
      }
      return details;
    default:
      return details;
  }
}
