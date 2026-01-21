import { NumericFormat } from "react-number-format";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { ToggleSwitch } from "~/components/ui/toggle-switch";
import { HelpCircle, ArrowRight } from "lucide-react";
import { TOKENS } from "~/lib/collateral";
import type { CollateralOutputToken } from "~/hooks/use-stability-pool";
import { bigintToBig } from "~/lib/decimal";
import { getSlippageForPair } from "~/lib/contracts/avnu";
import type Big from "big.js";

function getCollateralIcon(collateralId: string): string {
  switch (collateralId) {
    case "WWBTC":
      return "/wbtc.png";
    case "TBTC":
      return "/tbtc.webp";
    case "SOLVBTC":
      return "/SolvBTC.png";
    default:
      return `/${collateralId.toLowerCase()}.png`;
  }
}

interface ExpectedUsduDisplayProps {
  isLoading: boolean;
  error: Error | null;
  amount: bigint | null;
  isEnabled: boolean;
}

function ExpectedUsduDisplay({
  isLoading,
  error,
  amount,
  isEnabled,
}: ExpectedUsduDisplayProps) {
  if (isLoading) {
    return <span className="text-neutral-400 animate-pulse">...</span>;
  }

  if (error) {
    return <span className="text-red-500 text-xs">unavailable</span>;
  }

  if (amount) {
    return (
      <span className={isEnabled ? "font-medium" : ""}>
        <NumericFormat
          displayType="text"
          value={bigintToBig(amount, TOKENS.USDU.decimals).toString()}
          thousandSeparator=","
          decimalScale={2}
        />
      </span>
    );
  }

  return <span>-</span>;
}

interface CollateralSwapSelectorProps {
  collateralOutputToken: CollateralOutputToken;
  setCollateralOutputToken: (value: CollateralOutputToken) => void;
  collateralSymbol: string;
  collateralId: string;
  collateralAmount: Big;
  expectedUsduAmount: bigint | null;
  isQuoteLoading: boolean;
  quoteError: Error | null;
  disabled?: boolean;
}

export function CollateralSwapSelector({
  collateralOutputToken,
  setCollateralOutputToken,
  collateralSymbol,
  collateralId,
  collateralAmount,
  expectedUsduAmount,
  isQuoteLoading,
  quoteError,
  disabled = false,
}: CollateralSwapSelectorProps) {
  const slippagePercent = (
    getSlippageForPair(collateralSymbol, "USDU") * 100
  ).toFixed(1);

  const collateralIcon = getCollateralIcon(collateralId);

  const isEnabled = collateralOutputToken === "USDU";

  return (
    <div className="space-y-1">
      {/* Main toggle row */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600 font-sora">
            Auto-convert {collateralSymbol} → USDU
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-xs bg-slate-900 text-white"
            >
              <p className="text-xs">
                Automatically swap your {collateralSymbol} rewards to USDU in a
                single transaction via Avnu
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <ToggleSwitch
          enabled={isEnabled}
          onChange={(enabled) =>
            setCollateralOutputToken(enabled ? "USDU" : "COLLATERAL")
          }
          disabled={disabled}
        />
      </div>

      {/* Conversion details - always visible to prevent CLS, muted when disabled */}
      <div
        className={`flex items-center gap-2 text-sm font-sora transition-opacity ${
          isEnabled ? "text-neutral-700" : "text-neutral-400"
        }`}
      >
        {/* From amount */}
        <div className="flex items-center gap-1.5">
          <img
            src={collateralIcon}
            alt={collateralSymbol}
            className={`w-4 h-4 object-contain ${!isEnabled && "opacity-50"}`}
          />
          <NumericFormat
            displayType="text"
            value={collateralAmount.toString()}
            thousandSeparator=","
            decimalScale={6}
          />
        </div>

        <ArrowRight className={`w-3.5 h-3.5 ${isEnabled ? "text-neutral-400" : "text-neutral-300"}`} />

        <div className="flex items-center gap-1.5">
          <img
            src="/usdu.png"
            alt="USDU"
            className={`w-4 h-4 object-contain ${!isEnabled && "opacity-50"}`}
          />
          <ExpectedUsduDisplay
            isLoading={isQuoteLoading}
            error={quoteError}
            amount={expectedUsduAmount}
            isEnabled={isEnabled}
          />
        </div>

        {/* Separator */}
        <span className={isEnabled ? "text-neutral-300" : "text-neutral-200"}>•</span>

        {/* Provider and slippage */}
        <span className={`text-xs ${isEnabled ? "text-neutral-500" : "text-neutral-400"}`}>
          via Avnu • {slippagePercent}% slippage
        </span>
      </div>
    </div>
  );
}
