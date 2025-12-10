export type TransactionStatus = "pending" | "success" | "error";

export type TransactionType =
  | "borrow"
  | "adjust"
  | "close"
  | "claim"
  | "claim_surplus"
  | "adjust_rate"
  | "deposit"
  | "withdraw"
  | "unknown";

// Transaction details for each type
export interface BorrowDetails {
  collateralAmount: number;
  collateralToken: string;
  borrowAmount: number;
  interestRate: number;
  troveId?: string;
  collateralType?: string;
}

export interface AdjustDetails {
  collateralToken?: string;
  newCollateral?: number;
  previousCollateral?: number;
  collateralChange?: number;
  hasCollateralChange?: boolean;
  isCollateralIncrease?: boolean;
  newDebt?: number;
  previousDebt?: number;
  debtChange?: number;
  hasDebtChange?: boolean;
  isDebtIncrease?: boolean;
  newInterestRate?: number;
  previousInterestRate?: number;
  interestRate?: number;
  hasInterestRateChange?: boolean;
  troveId?: string;
  collateralType?: string;
}

export interface CloseDetails {
  debt: number;
  collateral: number;
  collateralType?: string;
  troveId?: string;
}

export interface ClaimDetails {
  usduRewards?: number | string;
  collateralRewards?: number | string;
  collateralToken?: string;
  pool?: string;
  amount?: number | string;
  token?: string;
  proofLength?: number;
}

export interface ClaimSurplusDetails {
  amount: number;
  token?: string;
}

export interface AdjustRateDetails {
  oldRate: number;
  newRate: number;
}

export interface DepositDetails {
  amount: number;
  pool?: string;
}

export interface WithdrawDetails {
  amount: number;
  usduRewards?: number;
  collateralRewards?: number;
  collateralToken?: string;
  pool?: string;
}

export type TransactionDetails =
  | BorrowDetails
  | AdjustDetails
  | CloseDetails
  | ClaimDetails
  | ClaimSurplusDetails
  | AdjustRateDetails
  | DepositDetails
  | WithdrawDetails;

export interface StarknetTransaction {
  hash: string;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  confirmations?: number;
  accountAddress: string;
  error?: string;
  details?: TransactionDetails;
}

export type NewTransaction = Omit<
  StarknetTransaction,
  "status" | "timestamp" | "accountAddress"
>;

export type TransactionData = Record<string, StarknetTransaction[] | undefined>;
