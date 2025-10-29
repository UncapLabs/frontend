import { InfoBox } from "~/components/ui/info-box";
import { TrendingDown, Shield, TrendingUp } from "lucide-react";

interface RedemptionInfoProps {
  className?: string;
  children?: React.ReactNode;
}

export function RedemptionInfo({ className, children }: RedemptionInfoProps) {
  return (
    <InfoBox
      title="Setting Your Interest Rate"
      variant="blue"
      className={className}
      learnMoreUrl="https://uncap.finance/resources/docs/how-to/redemptions-and-delegations"
      learnMoreText="Learn more about interest rates and redemptions"
    >
      {children && (
        <div className="mb-4 pb-4 border-b border-blue-200">{children}</div>
      )}
      <div className="text-[#004BB2] text-sm font-normal leading-relaxed font-sora">
        <p className="mb-2 font-medium">
          You control your loan's interest rate:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Lower rates cost less but carry higher redemption risk</li>
          <li>
            Higher rates cost more but provide better redemption protection
          </li>
        </ul>
      </div>
      <p className="text-[#004BB2] text-sm font-normal leading-relaxed font-sora mt-4">
        When redeemed, your debt and collateral are reduced equally, so no net
        loss is incurred.
      </p>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="flex flex-col items-start">
          <div className="w-12 h-12 rounded-full bg-[#f5f3ee] flex items-center justify-center mb-2">
            <TrendingDown className="h-6 w-6 text-[#004BB2]" />
          </div>
          <p className="text-xs font-normal leading-relaxed text-[#004BB2]">
            Redemptions occur when USDU drops below $1
          </p>
        </div>
        <div className="flex flex-col items-start">
          <div className="w-12 h-12 rounded-full bg-[#f5f3ee] flex items-center justify-center mb-2">
            <Shield className="h-6 w-6 text-[#004BB2]" />
          </div>
          <p className="text-xs font-normal leading-relaxed text-[#004BB2]">
            Loans with the lowest interest rate are affected first
          </p>
        </div>
        <div className="flex flex-col items-start">
          <div className="w-12 h-12 rounded-full bg-[#f5f3ee] flex items-center justify-center mb-2">
            <TrendingUp className="h-6 w-6 text-[#004BB2]" />
          </div>
          <p className="text-xs font-normal leading-relaxed text-[#004BB2]">
            Raising the interest rate reduces your redemption risk
          </p>
        </div>
      </div>
    </InfoBox>
  );
}
