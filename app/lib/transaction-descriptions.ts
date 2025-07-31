import type { TransactionType } from '~/types/transaction';

export function createTransactionDescription(
  type: TransactionType,
  details?: Record<string, any>
): string {
  switch (type) {
    case 'borrow':
      if (details?.collateralAmount && details?.borrowAmount) {
        return `Open trove with ${details.collateralAmount} ${details.collateralToken || 'collateral'} to borrow ${details.borrowAmount} USDU`;
      }
      return 'Open new trove';

    case 'adjust':
      if (details?.troveId) {
        const parts: string[] = [];
        if (details.collateralChange) {
          parts.push(`${details.isCollateralIncrease ? 'Add' : 'Remove'} ${Math.abs(details.collateralChange)} collateral`);
        }
        if (details.debtChange) {
          parts.push(`${details.isDebtIncrease ? 'Borrow' : 'Repay'} ${Math.abs(details.debtChange)} USDU`);
        }
        return parts.length > 0 ? parts.join(' and ') : `Adjust trove #${details.troveId}`;
      }
      return 'Adjust trove';

    case 'close':
      return details?.troveId ? `Close trove #${details.troveId}` : 'Close trove';

    case 'claim':
      if (details?.amount && details?.token) {
        return `Claim ${details.amount} ${details.token}`;
      }
      return 'Claim rewards';

    case 'adjust_rate':
      if (details?.newRate) {
        return `Change interest rate to ${details.newRate}%`;
      }
      return 'Adjust interest rate';

    default:
      return 'Transaction';
  }
}