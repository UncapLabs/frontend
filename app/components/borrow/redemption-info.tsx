import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { Info, ExternalLink } from "lucide-react";

interface RedemptionInfoProps {
  variant?: "inline" | "modal";
  className?: string;
}

export function RedemptionInfo({
  variant = "inline",
  className,
}: RedemptionInfoProps) {
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
            <div className="space-y-4 text-[#004BB2] font-sora">
              <p className="text-sm font-normal leading-relaxed">
                Redemptions help maintain USDU's peg in a decentralized way. If
                a user is redeemed, their collateral and debt are reduced
                equally, resulting in no net loss.
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li className="text-sm font-normal leading-relaxed">
                  Redemptions occur when USDU drops below $1
                </li>
                <li className="text-sm font-normal leading-relaxed">
                  Redemptions first affect loans with the lowest interest rate
                </li>
                <li className="text-sm font-normal leading-relaxed">
                  Raising the interest rate reduces your redemption risk
                </li>
              </ul>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  // Inline version with Figma styling
  return (
    <div className={cn("bg-[#CEE3FF] rounded-[22px] p-6 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-[#004BB2] text-base font-medium font-sora">
          Redemptions
        </h3>
        <Info className="h-4 w-4 text-[#004BB2]" />
      </div>

      <div className="space-y-4 text-[#004BB2] font-sora">
        <p className="text-sm font-normal leading-relaxed">
          Redemptions help maintain USDU's peg in a decentralized way.
        </p>
        <p className="text-sm font-normal leading-relaxed">
          If a user is redeemed, their collateral and debt are reduced equally,
          resulting in no net loss.
        </p>
        <ul className="space-y-2 list-disc list-inside">
          <li className="text-sm font-normal leading-relaxed">
            Redemptions occur when USDU drops below $1
          </li>
          <li className="text-sm font-normal leading-relaxed">
            Redemptions first affect loans with the lowest interest rate
          </li>
          <li className="text-sm font-normal leading-relaxed">
            Raising the interest rate reduces your redemption risk
          </li>
        </ul>
        
        {/* Learn more link */}
        <div className="pt-2">
          <a 
            href="https://docs.uncap.finance/redemptions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#004BB2] hover:text-[#0039A0] transition-colors"
          >
            Learn more about redemptions
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
