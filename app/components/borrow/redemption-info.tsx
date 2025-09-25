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
      <p className="text-[#004BB2] text-sm font-normal leading-relaxed font-sora">
        Redemptions help maintain USDU's peg in a decentralized way.
      </p>
      <p className="text-[#004BB2] text-sm font-normal leading-relaxed font-sora">
        If a user is redeemed, their collateral and debt are reduced equally,
        resulting in no net loss.
      </p>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="flex flex-col items-start">
          <div className="w-12 h-12 rounded-full bg-[#f5f3ee] flex items-center justify-center mb-2">
            <TrendingDown className="h-6 w-6 text-[#004BB2]" />
          </div>
          <p className="text-xs font-normal leading-relaxed">
            Redemptions occur when USDU drops below $1
          </p>
        </div>
        <div className="flex flex-col items-start">
          <div className="w-12 h-12 rounded-full bg-[#f5f3ee] flex items-center justify-center mb-2">
            <Shield className="h-6 w-6 text-[#004BB2]" />
          </div>
          <p className="text-xs font-normal leading-relaxed">
            Redemptions first affect loans with the lowest interest rate
          </p>
        </div>
        <div className="flex flex-col items-start">
          <div className="w-12 h-12 rounded-full bg-[#f5f3ee] flex items-center justify-center mb-2">
            <TrendingUp className="h-6 w-6 text-[#004BB2]" />
          </div>
          <p className="text-xs font-normal leading-relaxed">
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
              Redemptions
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
      title="Redemptions"
      variant="blue"
      className={className}
      learnMoreUrl="https://docs.uncap.finance/redemptions"
      learnMoreText="Learn more about redemptions"
    >
      {content}
    </InfoBox>
  );
}
