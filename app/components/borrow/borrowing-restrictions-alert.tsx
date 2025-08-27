import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useBranchTCR } from "~/hooks/use-branch-tcr";
import type { CollateralType } from "~/lib/contracts/constants";
import { AlertTriangle } from "lucide-react";

export function BorrowingRestrictionsAlert({ 
  collateralType 
}: { 
  collateralType: CollateralType 
}) {
  const { data, isLoading } = useBranchTCR(collateralType);

  // Don't show alert if loading or not below CCR
  if (isLoading || !data?.isBelowCcr || data.tcr === null) {
    return null;
  }

  const tcrPercentage = (data.tcr * 100).toFixed(1);
  const ccrPercentage = (data.ccr * 100).toFixed(0);

  return (
    <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800 dark:text-orange-500">
        Borrowing Restrictions Active
      </AlertTitle>
      <AlertDescription className="space-y-3 text-orange-700 dark:text-orange-400">
        <div className="flex gap-4 font-semibold">
          <div>Current TCR: {tcrPercentage}%</div>
          <div>Critical Threshold: {ccrPercentage}%</div>
        </div>
        
        <p>
          When the Total Collateralization Ratio falls below the Critical 
          Collateral Ratio, these restrictions apply:
        </p>
        
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Opening positions: only if resulting TCR &gt; {ccrPercentage}%
          </li>
          <li>
            New borrowing: must bring TCR above {ccrPercentage}%
          </li>
          <li>
            Collateral withdrawal: requires matching debt repayment
          </li>
        </ul>
        
        <a 
          href="https://docs.bitusd.io/recovery-mode" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block text-sm underline hover:no-underline"
        >
          Learn more about borrowing restrictions →
        </a>
      </AlertDescription>
    </Alert>
  );
}