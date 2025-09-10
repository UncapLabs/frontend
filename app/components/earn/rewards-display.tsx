import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Gift } from "lucide-react";
import { dnumOrNull } from "~/lib/decimal";
import * as dn from "dnum";

interface RewardsDisplayProps {
  selectedPosition: any;
  selectedCollateral?: any;
  claimRewards?: boolean;
}

function formatTokenAmount(
  amount: string | bigint,
  decimals: number = 18
): string {
  const dnum = dnumOrNull(amount, decimals);
  if (!dnum) return "0";
  return dn.format(dnum, { digits: 7 });
}

function hasRewards(position: any): boolean {
  if (!position) return false;
  return (
    Number(position.pendingUsduGain) > 0 || Number(position.pendingCollGain) > 0
  );
}

export function RewardsDisplay({
  selectedPosition,
  selectedCollateral,
  claimRewards = true,
}: RewardsDisplayProps) {
  if (!hasRewards(selectedPosition)) {
    return null;
  }

  const toWallet = claimRewards;
  const cardClass = toWallet ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200";
  const iconClass = toWallet ? "text-green-600" : "text-blue-600";
  const titleClass = toWallet ? "text-green-900" : "text-blue-900";
  const textClass = toWallet ? "text-green-700" : "text-blue-700";
  const badgeClass = toWallet ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
  const borderClass = toWallet ? "border-green-200" : "border-blue-200";

  return (
    <Card className={cardClass}>
      <CardContent className="pt-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Gift className={`h-4 w-4 ${iconClass}`} />
            <span className={`text-sm font-medium ${titleClass}`}>
              {toWallet ? "Rewards will be sent to your wallet" : "Rewards will be re-deposited to pool"}
            </span>
          </div>

          <div className="space-y-2">
            {Number(selectedPosition.pendingUsduGain) > 0 && (
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textClass}`}>
                  USDU Interest
                </span>
                <Badge variant="secondary" className={badgeClass}>
                  {formatTokenAmount(
                    selectedPosition.pendingUsduGain.toString(),
                    18
                  )}{" "}
                  USDU
                </Badge>
              </div>
            )}

            {Number(selectedPosition.pendingCollGain) > 0 && (
              <div className="flex justify-between items-center">
                <span className={`text-sm ${textClass}`}>
                  Collateral Gains
                </span>
                <Badge variant="secondary" className={badgeClass}>
                  {formatTokenAmount(
                    selectedPosition.pendingCollGain.toString(),
                    selectedCollateral?.decimals || 18
                  )}{" "}
                  {selectedCollateral?.symbol || selectedCollateral}
                </Badge>
              </div>
            )}
          </div>

          <div className={`pt-2 border-t ${borderClass}`}>
            <p className={`text-xs ${textClass}`}>
              {toWallet 
                ? "✓ Rewards will be claimed and sent to your wallet" 
                : "↻ Rewards will be claimed and re-deposited to the stability pool"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}