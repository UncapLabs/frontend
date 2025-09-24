import { Alert, AlertDescription } from "~/components/ui/alert";
import { useBranchTCR } from "~/hooks/use-branch-tcr";
import type { CollateralType } from "~/lib/contracts/constants";
import { AlertTriangle, ExternalLink } from "lucide-react";

export function BorrowingRestrictionsAlert({
  collateralType,
}: {
  collateralType: CollateralType;
}) {
  const { data, isLoading } = useBranchTCR(collateralType);

  // Don't show alert if loading or not below CCR
  if (isLoading || !data?.isBelowCcr || data.tcr === null) {
    return null;
  }

  const tcrPercentage = (data.tcr * 100).toFixed(1);
  const ccrPercentage = (data.ccr * 100).toFixed(0);

  return (
    <Alert className="border-amber-200 bg-amber-50 rounded-xl">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-amber-800 font-semibold font-sora text-base">
            Borrowing Restrictions Active
          </h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-amber-700 font-sora uppercase tracking-tight">
              Current TCR:
            </span>
            <span className="text-base font-bold text-amber-900 font-sora">
              {tcrPercentage}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-amber-700 font-sora uppercase tracking-tight">
              Critical Threshold:
            </span>
            <span className="text-base font-bold text-amber-900 font-sora">
              {ccrPercentage}%
            </span>
          </div>
        </div>

        <p className="text-sm text-amber-700 font-normal leading-relaxed">
          The Total Collateralization Ratio has fallen below the Critical
          Collateral Ratio. The following restrictions apply:
        </p>

        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-1.5 text-xs">•</span>
            <span className="font-normal">
              <span className="font-medium">Opening positions:</span> only if resulting TCR exceeds {ccrPercentage}%
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-1.5 text-xs">•</span>
            <span className="font-normal">
              <span className="font-medium">New borrowing:</span> must bring TCR above {ccrPercentage}%
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-1.5 text-xs">•</span>
            <span className="font-normal">
              <span className="font-medium">Collateral withdrawal:</span> requires matching debt repayment
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-1.5 text-xs">•</span>
            <span className="font-normal">
              <span className="font-medium">Closing positions:</span> only if resulting TCR exceeds {ccrPercentage}%
            </span>
          </li>
        </ul>

        <a
          href="https://uncap.finance/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors group"
        >
          Learn more about restrictions
          <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </AlertDescription>
    </Alert>
  );
}
