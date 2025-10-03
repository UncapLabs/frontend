import { useBranchTCR } from "~/hooks/use-branch-tcr";
import type { CollateralId } from "~/lib/collateral";
import { AlertTriangle, ExternalLink } from "lucide-react";

export function BorrowingRestrictionsAlert({
  collateralType,
}: {
  collateralType: CollateralId;
}) {
  const { data, isLoading } = useBranchTCR(collateralType);

  // Don't show alert if loading or not below CCR
  if (isLoading || !data?.isBelowCcr || data.tcr === null) {
    return null;
  }

  const tcrPercentage = data.tcr.times(100).toFixed(1);
  const ccrPercentage = data.ccr.times(100).toFixed(0);

  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-200/50">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-neutral-800 font-medium font-sora text-base mb-1">
            Borrowing Restrictions Active
          </h3>
          <p className="text-sm font-sora text-neutral-600">
            TCR has fallen below the critical threshold.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200/50">
          <div className="text-xs font-medium font-sora uppercase tracking-tight text-amber-700 mb-1">
            Current TCR
          </div>
          <div className="text-xl font-medium font-sora text-amber-900">
            {tcrPercentage}%
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200/50">
          <div className="text-xs font-medium font-sora uppercase tracking-tight text-amber-700 mb-1">
            Threshold
          </div>
          <div className="text-xl font-medium font-sora text-amber-900">
            {ccrPercentage}%
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-xs font-medium font-sora uppercase tracking-tight text-neutral-800 mb-3">
          What you can do:
        </div>
        <div className="flex items-start gap-2 text-sm">
          <span className="text-green-600 mt-0.5">✓</span>
          <span className="text-neutral-700 font-sora">
            Repay debt and close positions (if final TCR stays above {ccrPercentage}%)
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <span className="text-green-600 mt-0.5">✓</span>
          <span className="text-neutral-700 font-sora">
            Add collateral without borrowing more
          </span>
        </div>

        <div className="text-xs font-medium font-sora uppercase tracking-tight text-neutral-800 mb-3 mt-4">
          What you can't do:
        </div>
        <div className="flex items-start gap-2 text-sm">
          <span className="text-red-600 mt-0.5">✕</span>
          <span className="text-neutral-700 font-sora">
            Borrow more (unless it brings TCR above {ccrPercentage}%)
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <span className="text-red-600 mt-0.5">✕</span>
          <span className="text-neutral-700 font-sora">
            Withdraw collateral (unless you repay equal amount of debt)
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <span className="text-red-600 mt-0.5">✕</span>
          <span className="text-neutral-700 font-sora">
            Open new positions (unless it brings TCR above {ccrPercentage}%)
          </span>
        </div>
      </div>

      <a
        href="https://uncap.finance/docs"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium font-sora text-amber-700 hover:text-amber-900 transition-colors group"
      >
        Learn more
        <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    </div>
  );
}
