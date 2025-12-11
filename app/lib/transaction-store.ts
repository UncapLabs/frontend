import type {
  StarknetTransaction,
  NewTransaction,
  TransactionData,
  TransactionStatus,
  TransactionDetails,
} from "~/types/transaction";
import type { ProviderInterface } from "starknet";
import Big from "big.js";

const STORAGE_KEY = "uncap-transactions";
const MAX_COMPLETED_TRANSACTIONS = 50;
const TRANSACTION_HASH_REGEX = /^0x[0-9a-fA-F]+$/;

function safeParseJsonData(string: string | null): TransactionData {
  try {
    const value = string ? JSON.parse(string) : {};
    return typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function loadData(): TransactionData {
  return safeParseJsonData(
    typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE_KEY)
      : null
  );
}

function validateTransaction(
  transaction: StarknetTransaction | NewTransaction
): string[] {
  const errors: string[] = [];

  if (!TRANSACTION_HASH_REGEX.test(transaction.hash)) {
    errors.push("Invalid transaction hash");
  }

  if (typeof transaction.description !== "string" || !transaction.description) {
    errors.push("Transaction must have a description");
  }

  if (
    typeof transaction.confirmations !== "undefined" &&
    (!Number.isInteger(transaction.confirmations) ||
      transaction.confirmations < 1)
  ) {
    errors.push("Transaction confirmations must be a positive integer");
  }

  return errors;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    Object.prototype.toString.call(value) === "[object Object]" &&
    value !== null
  );
}

function normalizeDetailValue(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Big) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeDetailValue(item));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeDetailValue(item),
      ])
    );
  }

  return value;
}

function normalizeTransactionDetails(
  details: TransactionDetails | undefined
): TransactionDetails | undefined {
  if (!details) {
    return details;
  }

  return normalizeDetailValue(details) as TransactionDetails;
}

function normalizeTransaction(
  transaction: NewTransaction
): NewTransaction {
  if (!transaction.details) {
    return transaction;
  }

  return {
    ...transaction,
    details: normalizeTransactionDetails(transaction.details),
  };
}

export interface TransactionStore {
  addTransaction: (account: string, transaction: NewTransaction) => void;
  clearTransactions: (account: string) => void;
  getTransactions: (account: string) => StarknetTransaction[];
  getTransaction: (
    account: string,
    hash: string
  ) => StarknetTransaction | undefined;
  setTransactionStatus: (
    account: string,
    hash: string,
    status: TransactionStatus
  ) => void;
  waitForPendingTransactions: (account: string) => Promise<void>;
  setProvider: (provider: ProviderInterface) => void;
  onChange: (fn: () => void) => () => void;
  onTransactionStatus: (
    fn: (status: TransactionStatus, hash: string) => void
  ) => () => void;
}

export function createTransactionStore(): TransactionStore {
  let data: TransactionData = loadData();

  let provider: ProviderInterface | null = null;
  const listeners: Set<() => void> = new Set();
  const transactionListeners: Set<
    (status: TransactionStatus, hash: string) => void
  > = new Set();
  const transactionRequestCache: Map<string, Promise<void>> = new Map();

  function setProvider(newProvider: ProviderInterface): void {
    provider = newProvider;
  }

  // Stable empty array reference for accounts with no transactions
  const EMPTY_TRANSACTIONS: StarknetTransaction[] = [];

  function getTransactions(account: string): StarknetTransaction[] {
    return data[account] ?? EMPTY_TRANSACTIONS;
  }

  function addTransaction(account: string, transaction: NewTransaction): void {
    const errors = validateTransaction(transaction);

    if (errors.length > 0) {
      throw new Error(["Unable to add transaction", ...errors].join("\n"));
    }

    updateTransactions(account, (transactions) => {
      const sanitizedTransaction = normalizeTransaction(transaction);
      const newTx: StarknetTransaction = {
        ...sanitizedTransaction,
        status: "pending",
        timestamp: Date.now(),
        accountAddress: account,
      };

      return [
        newTx,
        ...transactions.filter(({ hash }) => hash !== transaction.hash),
      ];
    });
  }

  function clearTransactions(account: string): void {
    updateTransactions(account, () => []);
  }

  function setTransactionStatus(
    account: string,
    hash: string,
    status: TransactionStatus
  ): void {
    updateTransactions(account, (transactions) => {
      return transactions.map((transaction) =>
        transaction.hash === hash ? { ...transaction, status } : transaction
      );
    });

    // Notify transaction status listeners
    for (const listener of transactionListeners) {
      listener(status, hash);
    }
  }

  async function waitForPendingTransactions(account: string): Promise<void> {
    if (!provider) {
      console.warn("No provider set for transaction monitoring");
      return;
    }

    await Promise.all(
      getTransactions(account)
        .filter((transaction) => transaction.status === "pending")
        .map(async (transaction) => {
          const { hash } = transaction;
          const existingRequest = transactionRequestCache.get(hash);

          if (existingRequest) {
            return await existingRequest;
          }

          // Provider is guaranteed to be non-null here due to check above
          const requestPromise = provider!
            .waitForTransaction(hash, {
              retryInterval: 1000, // 1 second
            })
            .then((receipt) => {
              transactionRequestCache.delete(hash);

              if (!receipt) {
                return;
              }

              // Check if transaction is successful based on receipt
              const isSuccessful = receipt.isSuccess();

              setTransactionStatus(
                account,
                hash,
                isSuccessful ? "success" : "error"
              );
            })
            .catch(() => {
              // If transaction not found or error occurs
              setTransactionStatus(account, hash, "error");
            });

          transactionRequestCache.set(hash, requestPromise);

          return await requestPromise;
        })
    );
  }

  function updateTransactions(
    account: string,
    updateFn: (transactions: StarknetTransaction[]) => StarknetTransaction[]
  ): void {
    // Ensure we're always operating on the latest data in case we have
    // multiple instances/tabs/etc. since we write all data back to
    // local storage after updating
    data = loadData();

    let completedTransactionCount = 0;
    const transactions = updateFn(data[account] ?? [])
      // Keep the list of completed transactions from growing indefinitely
      .filter(({ status }) => {
        return status === "pending"
          ? true
          : completedTransactionCount++ <= MAX_COMPLETED_TRANSACTIONS;
      });

    data[account] = transactions.length > 0 ? transactions : undefined;

    persistData();
    notifyListeners();

    // Start monitoring any pending transactions
    waitForPendingTransactions(account);
  }

  function persistData(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function notifyListeners(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function onChange(fn: () => void): () => void {
    listeners.add(fn);

    return () => {
      listeners.delete(fn);
    };
  }

  function onTransactionStatus(
    fn: (status: TransactionStatus, hash: string) => void
  ): () => void {
    transactionListeners.add(fn);

    return () => {
      transactionListeners.delete(fn);
    };
  }

  function getTransaction(
    account: string,
    hash: string
  ): StarknetTransaction | undefined {
    const transactions = getTransactions(account);
    return transactions.find((tx) => tx.hash === hash);
  }

  return {
    addTransaction,
    clearTransactions,
    getTransactions,
    getTransaction,
    setTransactionStatus,
    waitForPendingTransactions,
    setProvider,
    onChange,
    onTransactionStatus,
  };
}
