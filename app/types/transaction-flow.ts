// Simplified Transaction Flow Types
export type StepState = 
  | 'idle' 
  | 'loading' 
  | 'success' 
  | 'error';

export type TransactionType = 
  | 'borrow' 
  | 'stake';

export interface TransactionStep {
  id: string;
  name: string;
  description?: string;
  state: StepState;
  transactionHash?: string;
  error?: string;
}