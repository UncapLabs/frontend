import type { TransactionType } from "~/types/transaction";

export function createTransactionDescription(
  type: TransactionType,
  details?: Record<string, any>
): string {
  switch (type) {
    case "borrow":
      if (details?.collateralAmount && details?.borrowAmount) {
        const managerText = details.batchManager
          ? " under Telos management"
          : "";
        return `Open trove with ${details.collateralAmount} ${
          details.collateralToken || "collateral"
        } to borrow ${details.borrowAmount} USDU${managerText}`;
      }
      return "Open new trove";

    case "adjust":
      if (details?.troveId) {
        const parts: string[] = [];
        if (details.hasCollateralChange && details.collateralChange) {
          parts.push(
            `${
              details.isCollIncrease ? "Add" : "Remove"
            } ${details.collateralChange.abs().toFixed(7)} ${
              details.collateralToken || "collateral"
            }`
          );
        }
        if (details.hasDebtChange && details.debtChange) {
          parts.push(
            `${details.isDebtIncrease ? "Borrow" : "Repay"} ${details.debtChange
              .abs()
              .toFixed(2)} USDU`
          );
        }
        if (
          details.hasInterestRateChange &&
          details.newInterestRate !== undefined
        ) {
          parts.push(`Change rate to ${details.newInterestRate.toFixed(2)}%`);
        }
        if (details.hasBatchManagerChange) {
          if (details.targetBatchManager) {
            parts.push("Delegate interest to Telos");
          } else {
            parts.push("Return to manual interest control");
          }
        }
        return parts.length > 0
          ? parts.join(" and ")
          : `Adjust trove #${details.troveId}`;
      }
      return "Adjust trove";

    case "close":
      return details?.troveId
        ? `Close trove #${details.troveId}`
        : "Close trove";

    case "claim":
      // Handle stability pool claims with separate USDU and collateral rewards
      if (details?.usduRewards || details?.collateralRewards) {
        const parts: string[] = [];
        if (details.usduRewards && Number(details.usduRewards) > 0) {
          const usduAmount = Number(details.usduRewards).toFixed(2);
          parts.push(`${usduAmount} USDU`);
        }
        if (details.collateralRewards && Number(details.collateralRewards) > 0) {
          const collateralSymbol = details.collateralToken || "wBTC";
          const collateralAmount = Number(details.collateralRewards).toFixed(7);
          parts.push(`${collateralAmount} ${collateralSymbol}`);
        }
        if (parts.length > 0) {
          return `Claim ${parts.join(" and ")} from Stability Pool`;
        }
      }
      // Handle simple claims
      if (details?.amount && details?.token) {
        return `Claim ${details.amount} ${details.token}`;
      }
      return "Claim rewards";

    case "claim_surplus":
      if (details?.collateralType) {
        return `Claim ${details.collateralType} collateral surplus`;
      }
      return "Claim collateral surplus";

    case "adjust_rate":
      if (details?.newRate) {
        return `Change interest rate to ${details.newRate}%`;
      }
      return "Adjust interest rate";

    case "deposit":
      if (details?.amount) {
        return `Deposit ${details.amount} ${
          details.token || "USDU"
        } to Stability Pool`;
      }
      return "Deposit to Stability Pool";

    case "withdraw":
      if (details?.amount) {
        return `Withdraw ${details.amount} ${
          details.token || "USDU"
        } from Stability Pool`;
      }
      return "Withdraw from Stability Pool";

    default:
      return "Transaction";
  }
}
