export type TransactionStatus = 'pending' | 'success' | 'error';

export type TransactionType =
  | 'borrow'
  | 'adjust'
  | 'close'
  | 'claim'
  | 'adjust_rate'
  | 'unknown';

export interface StarknetTransaction {
  hash: string;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  confirmations?: number;
  accountAddress: string;
  error?: string;
  details?: Record<string, any>;
}

export type NewTransaction = Omit<StarknetTransaction, 'status' | 'timestamp' | 'accountAddress'>;

export type TransactionData = Record<string, StarknetTransaction[] | undefined>;