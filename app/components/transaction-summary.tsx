import { NumericFormat } from "react-number-format";
import { AlertCircle, Info, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import { usePredictUpfrontFee } from "~/hooks/use-predict-upfront-fee";
import { decimalToBigint, bigintToDecimal } from "~/lib/decimal";
import type { CollateralType } from "~/lib/contracts/constants";
import { Skeleton } from "~/components/ui/skeleton";

interface PositionChange {
  collateral?: {
    from?: number;
    to: number;
    token: string;
  };
  collateralValueUSD?: {
    from?: number;
    to: number;
  };
  debt?: {
    from?: number;
    to: number;
  };
  interestRate?: {
    from?: number;
    to: number;
  };
}

interface TransactionSummaryProps {
  type: "open" | "update" | "close";
  changes: PositionChange;
  liquidationPrice?: number;
  liquidationRisk?: "High" | "Medium" | "Low" | undefined;
  className?: string;
  isValid?: boolean;
  warnings?: string[];
  // For fee calculation
  collateralType?: CollateralType;
  troveId?: bigint; // For update operations
}

export function TransactionSummary({
  type,
  changes,
  liquidationPrice,
  liquidationRisk,
  className,
  warnings = [],
  collateralType,
  troveId,
}: TransactionSummaryProps) {
  const title =
    type === "open"
      ? "Position Summary"
      : type === "update"
      ? "Position Changes"
      : "Close Position";

  // Calculate annual interest cost
  const annualInterestCost =
    changes.debt?.to && changes.interestRate?.to
      ? (changes.debt.to * changes.interestRate.to) / 100
      : 0;

  // Calculate STRK rebate (30% of yearly interest)
  // const REBATE_PERCENTAGE = 30;
  // const yearlyRebate = annualInterestCost > 0 ? (annualInterestCost * REBATE_PERCENTAGE) / 100 : 0;

  // Determine if we're increasing debt (for updates)
  const isDebtIncrease =
    type === "update" &&
    changes.debt?.from !== undefined &&
    changes.debt?.to !== undefined &&
    changes.debt.to > changes.debt.from;

  // Calculate upfront fee using the unified hook
  const { upfrontFee, isLoading: isFeeLoading } = usePredictUpfrontFee(
    type === "open"
      ? {
          type: "open",
          collateralType: collateralType || "UBTC",
          borrowedAmount: changes.debt?.to
            ? decimalToBigint(changes.debt.to, 18)
            : undefined,
          interestRate: changes.interestRate?.to
            ? decimalToBigint(changes.interestRate.to / 100, 18)
            : undefined,
          enabled:
            !!collateralType &&
            !!changes.debt?.to &&
            !!changes.interestRate?.to,
        }
      : {
          type: "adjust",
          collateralType: collateralType || "UBTC",
          troveId: troveId,
          debtIncrease:
            isDebtIncrease &&
            changes.debt?.from !== undefined &&
            changes.debt?.to !== undefined
              ? decimalToBigint(changes.debt.to - changes.debt.from, 18)
              : undefined,
          enabled: !!collateralType && !!troveId && isDebtIncrease,
        }
  );

  return (
    <div className={cn("bg-white rounded-2xl p-6 space-y-6", className)}>
      {/* Title */}
      <div className="flex items-center">
        <h3 className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Collateral with value */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-neutral-800 text-sm font-normal font-sora">
              Collateral
            </span>
          </div>
          <div className="text-right">
            {type === "update" &&
            changes.collateral?.from !== changes.collateral?.to ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-neutral-800/50 text-base font-medium font-sora line-through">
                    <NumericFormat
                      displayType="text"
                      value={changes.collateral?.from || 0}
                      thousandSeparator=","
                      decimalScale={4}
                      fixedDecimalScale={false}
                    />{" "}
                    {changes.collateral?.token || "BTC"}
                  </span>
                  <span className="text-xs text-neutral-800/50">→</span>
                  <span className="text-neutral-800 text-base font-medium font-sora">
                    <NumericFormat
                      displayType="text"
                      value={changes.collateral?.to || 0}
                      thousandSeparator=","
                      decimalScale={4}
                      fixedDecimalScale={false}
                    />{" "}
                    {changes.collateral?.token || "BTC"}
                  </span>
                </div>
                <div className="text-xs text-neutral-800/70 font-sora">
                  <NumericFormat
                    displayType="text"
                    value={changes.collateralValueUSD?.to || 0}
                    prefix="$"
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="text-neutral-800 text-base font-medium font-sora">
                  <NumericFormat
                    displayType="text"
                    value={changes.collateral?.to || 0}
                    thousandSeparator=","
                    decimalScale={4}
                    fixedDecimalScale={false}
                  />{" "}
                  {changes.collateral?.token || "BTC"}
                </div>
                <div className="text-xs text-neutral-800/70 font-sora">
                  <NumericFormat
                    displayType="text"
                    value={changes.collateralValueUSD?.to || 0}
                    prefix="$"
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loan */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-neutral-800 text-sm font-normal font-sora">
              Loan
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-neutral-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Amount of USDU you are borrowing</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-right">
            {type === "update" && changes.debt?.from !== changes.debt?.to ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-neutral-800/50 text-base font-medium font-sora line-through">
                    <NumericFormat
                      displayType="text"
                      value={changes.debt?.from || 0}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />{" "}
                    USDU
                  </span>
                  <span className="text-xs text-neutral-800/50">→</span>
                  <span className="text-neutral-800 text-base font-medium font-sora">
                    <NumericFormat
                      displayType="text"
                      value={changes.debt?.to || 0}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />{" "}
                    USDU
                  </span>
                </div>
                {/* Show fee for debt increase */}
                {isDebtIncrease && (
                  <div className="text-xs text-neutral-800/70 font-sora">
                    {isFeeLoading ? (
                      <Skeleton className="h-3 w-24 ml-auto" />
                    ) : upfrontFee ? (
                      <>
                        Incl.{" "}
                        <NumericFormat
                          displayType="text"
                          value={bigintToDecimal(upfrontFee, 18)}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />{" "}
                        USDU fee
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-0.5">
                <span className="text-neutral-800 text-base font-medium font-sora">
                  <NumericFormat
                    displayType="text"
                    value={changes.debt?.to || 0}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />{" "}
                  USDU
                </span>
                {/* Show fee for new loan */}
                {type === "open" && (
                  <div className="text-xs text-neutral-800/70 font-sora">
                    {isFeeLoading ? (
                      <Skeleton className="h-3 w-24 ml-auto" />
                    ) : upfrontFee ? (
                      <>
                        Incl.{" "}
                        <NumericFormat
                          displayType="text"
                          value={bigintToDecimal(upfrontFee, 18)}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />{" "}
                        USDU creation fee
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Interest Rate with annual cost */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-neutral-800 text-sm font-normal font-sora">
              Interest rate
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-neutral-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Annual interest rate on your loan. Higher rates reduce
                  redemption risk.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-right">
            {type === "update" &&
            changes.interestRate?.from !== changes.interestRate?.to ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-neutral-800/50 text-base font-medium font-sora line-through">
                    {changes.interestRate?.from?.toFixed(2)}%
                  </span>
                  <span className="text-xs text-neutral-800/50">→</span>
                  <span className="text-neutral-800 text-base font-medium font-sora">
                    {changes.interestRate?.to?.toFixed(2)}%
                  </span>
                </div>
                {annualInterestCost > 0 && (
                  <div className="text-xs text-neutral-800/70 font-sora">
                    <NumericFormat
                      displayType="text"
                      value={annualInterestCost}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />{" "}
                    USDU per year
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="text-neutral-800 text-base font-medium font-sora">
                  {(changes.interestRate?.to || 5).toFixed(2)}%
                </div>
                {annualInterestCost > 0 && (
                  <div className="text-xs text-neutral-800/70 font-sora">
                    <NumericFormat
                      displayType="text"
                      value={annualInterestCost}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />{" "}
                    USDU per year
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* LTV Ratio */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-neutral-800 text-sm font-normal font-sora">
              LTV
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-neutral-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Loan-to-Value ratio. Shows how much you're borrowing against
                  your collateral value.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-right">
            {(() => {
              const currentLTV =
                changes.collateralValueUSD?.to && changes.debt?.to
                  ? (changes.debt.to / changes.collateralValueUSD.to) * 100
                  : 0;
              const previousLTV =
                type === "update" &&
                changes.collateralValueUSD?.from &&
                changes.debt?.from
                  ? (changes.debt.from / changes.collateralValueUSD.from) * 100
                  : undefined;

              if (
                type === "update" &&
                previousLTV !== undefined &&
                Math.abs(currentLTV - previousLTV) > 0.01
              ) {
                return (
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-neutral-800/50 text-base font-medium font-sora line-through">
                      {previousLTV.toFixed(1)}%
                    </span>
                    <span className="text-xs text-neutral-800/50">→</span>
                    <span className="text-neutral-800 text-base font-medium font-sora">
                      {currentLTV.toFixed(1)}%
                    </span>
                  </div>
                );
              } else {
                return (
                  <span className="text-neutral-800 text-base font-medium font-sora">
                    {currentLTV > 0 ? (
                      `${currentLTV.toFixed(1)}%`
                    ) : (
                      <span className="text-neutral-800/50">—</span>
                    )}
                  </span>
                );
              }
            })()}
          </div>
        </div>

        {/* STRK Rebate - Only show if there's a yearly rebate */}
        {/* {yearlyRebate > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-neutral-800 text-sm font-normal font-sora">
                STRK Rebate
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-neutral-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    You earn a 30% rebate on interest payments through the STRK
                    rebate program
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-green-600 text-base font-medium font-sora">
              +$
              <NumericFormat
                displayType="text"
                value={yearlyRebate}
                thousandSeparator=","
                decimalScale={0}
                fixedDecimalScale={false}
              />{" "}
              /year
            </span>
          </div>
        )} */}

        {/* Liquidation Price */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-neutral-800 text-sm font-normal font-sora">
              Liquidation Price
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-neutral-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Bitcoin price at which your position will be liquidated (110%
                  collateral ratio)
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-neutral-800 text-base font-medium font-sora">
            {liquidationPrice && liquidationPrice > 0 ? (
              <NumericFormat
                displayType="text"
                value={liquidationPrice}
                prefix="$"
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale
              />
            ) : (
              <span className="text-neutral-800/50">—</span>
            )}
          </span>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="pt-2 space-y-2 border-t border-neutral-100">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-medium">{warning}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
