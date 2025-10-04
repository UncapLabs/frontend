import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { InfoBox } from "~/components/ui/info-box";
import { Info, TrendingDown, Shield, TrendingUp } from "lucide-react";

interface RedemptionInfoProps {
  variant?: "inline" | "modal";
  className?: string;
}

export function RedemptionInfo({
  variant = "inline",
  className,
}: RedemptionInfoProps) {
  const content = (
    <>
      <div className="text-[#004BB2] text-sm font-normal leading-relaxed font-sora">
        <p className="mb-2">You control your loan's interest rate:</p>
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
    </>
  );

  if (variant === "modal") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Info className="h-3.5 w-3.5 text-neutral-400 cursor-help" />
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#004BB2] text-base font-medium font-sora flex items-center gap-2">
              Setting Your Interest Rate
              <Info className="h-4 w-4 text-[#004BB2]" />
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="space-y-4 text-[#004BB2] font-sora">{content}</div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  // Inline version using InfoBox component
  return (
    <InfoBox
      title="Setting Your Interest Rate"
      variant="blue"
      className={className}
      learnMoreUrl="https://uncap.finance/docs/FAQ/redemptions-and-delegations"
      learnMoreText="Learn more about interest rates and redemptions"
    >
      {content}
    </InfoBox>
  );
}
