import { NumericFormat } from "react-number-format";
import { AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { usePredictUpfrontFee } from "~/hooks/use-predict-upfront-fee";
import { bigToBigint, bigintToBig } from "~/lib/decimal";
import { DEFAULT_COLLATERAL, type CollateralId } from "~/lib/collateral";
import Big from "big.js";

interface PositionChange {
  collateral?: {
    from?: Big;
    to: Big;
    token: string;
  };
  collateralValueUSD?: {
    from?: Big;
    to: Big;
  };
  debt?: {
    from?: Big;
    to: Big;
  };
  interestRate?: {
    from?: Big;
    to: Big;
  };
  batchManager?: {
    from?: string | null;
    to?: string | null;
    label?: string;
  };
}

interface TransactionSummaryProps {
  type: "open" | "update" | "close";
  changes: PositionChange;
  liquidationPrice?: Big;
  previousLiquidationPrice?: Big;
  className?: string;
  isValid?: boolean;
  warnings?: React.ReactNode[];
  collateralType?: CollateralId;
  troveId?: bigint; // For update operations
}

export function TransactionSummary({
  type,
  changes,
  liquidationPrice,
  previousLiquidationPrice,
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

  const annualInterestCost =
    changes.debt?.to && changes.interestRate?.to
      ? changes.debt.to.times(changes.interestRate.to).div(100)
      : new Big(0);

  // Determine if we're increasing debt (for updates)
  const isDebtIncrease =
    type === "update" &&
    changes.debt?.from !== undefined &&
    changes.debt?.to !== undefined &&
    changes.debt.to.gt(changes.debt.from);

  // Calculate upfront fee using the unified hook
  const { upfrontFee } = usePredictUpfrontFee(
    type === "open"
      ? {
          type: "open",
          collateralType: collateralType || DEFAULT_COLLATERAL.id,
          borrowedAmount: changes.debt?.to
            ? bigToBigint(changes.debt.to, 18)
            : undefined,
          interestRate: changes.interestRate?.to
            ? bigToBigint(changes.interestRate.to.div(100), 18)
            : undefined,
          enabled:
            !!collateralType &&
            !!changes.debt?.to &&
            !!changes.interestRate?.to,
        }
      : {
          type: "adjust",
          collateralType: collateralType || DEFAULT_COLLATERAL.id,
          troveId: troveId,
          debtIncrease:
            isDebtIncrease &&
            changes.debt?.from !== undefined &&
            changes.debt?.to !== undefined
              ? bigToBigint(changes.debt.to.minus(changes.debt.from), 18)
              : undefined,
          enabled: !!collateralType && !!troveId && isDebtIncrease,
        }
  );

  const upfrontFeeBig = upfrontFee ? bigintToBig(upfrontFee, 18) : null;

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
                      value={
                        changes.collateral?.from
                          ? changes.collateral.from.toString()
                          : "0"
                      }
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
                      value={
                        changes.collateral?.to
                          ? changes.collateral.to.toString()
                          : "0"
                      }
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
                    value={
                      changes.collateralValueUSD?.to
                        ? changes.collateralValueUSD.to.toString()
                        : "0"
                    }
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
                    value={
                      changes.collateral?.to
                        ? changes.collateral.to.toString()
                        : "0"
                    }
                    thousandSeparator=","
                    decimalScale={4}
                    fixedDecimalScale={false}
                  />{" "}
                  {changes.collateral?.token || "BTC"}
                </div>
                <div className="text-xs text-neutral-800/70 font-sora">
                  <NumericFormat
                    displayType="text"
                    value={
                      changes.collateralValueUSD?.to
                        ? changes.collateralValueUSD.to.toString()
                        : "0"
                    }
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
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-neutral-800 text-sm font-normal font-sora cursor-help">
                Loan
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Amount of USDU you are borrowing</p>
            </TooltipContent>
          </Tooltip>
          <div className="text-right">
            {type === "update" && changes.debt?.from !== changes.debt?.to ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-neutral-800/50 text-base font-medium font-sora line-through">
                    <NumericFormat
                      displayType="text"
                      value={
                        changes.debt?.from ? changes.debt.from.toString() : "0"
                      }
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
                      value={
                        changes.debt?.to ? changes.debt.to.toString() : "0"
                      }
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
                    Incl.{" "}
                    <NumericFormat
                      displayType="text"
                      value={upfrontFeeBig?.toString() ?? "0"}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />{" "}
                    USDU fee
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-0.5">
                <span className="text-neutral-800 text-base font-medium font-sora">
                  <NumericFormat
                    displayType="text"
                    value={changes.debt?.to ? changes.debt.to.toString() : "0"}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />{" "}
                  USDU
                </span>
                {/* Show fee for new loan */}
                {type === "open" && (
                  <div className="text-xs text-neutral-800/70 font-sora">
                    Incl.{" "}
                    <NumericFormat
                      displayType="text"
                      value={upfrontFeeBig?.toString() ?? "0"}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />{" "}
                    USDU creation fee
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Interest Rate with annual cost */}
        <div className="flex justify-between items-start">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-neutral-800 text-sm font-normal font-sora cursor-help">
                Interest rate
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Annual interest rate on your loan. Higher rates reduce
                redemption risk.
              </p>
            </TooltipContent>
          </Tooltip>
          <div className="text-right">
            {type === "update" &&
            changes.interestRate?.from !== undefined &&
            changes.interestRate?.to !== undefined &&
            !changes.interestRate.from.eq(changes.interestRate.to) ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-neutral-800/50 text-base font-medium font-sora line-through">
                    {changes.interestRate.from.toFixed(2)}%
                  </span>
                  <span className="text-xs text-neutral-800/50">→</span>
                  <span className="text-neutral-800 text-base font-medium font-sora">
                    {changes.interestRate.to.toFixed(2)}%
                  </span>
                </div>
                <div className="text-xs text-neutral-800/70 font-sora">
                  <NumericFormat
                    displayType="text"
                    value={annualInterestCost.toString()}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />{" "}
                  USDU per year
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="text-neutral-800 text-base font-medium font-sora">
                  {changes.interestRate?.to?.toFixed(2) ?? "5.00"}%
                </div>
                <div className="text-xs text-neutral-800/70 font-sora">
                  <NumericFormat
                    displayType="text"
                    value={annualInterestCost.toString()}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />{" "}
                  USDU per year
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Liquidation Price */}
        <div className="flex justify-between items-start">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-neutral-800 text-sm font-normal font-sora cursor-help">
                Liquidation Price
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Bitcoin price at which your position will be liquidated (115%
                collateral ratio)
              </p>
            </TooltipContent>
          </Tooltip>
          <div className="text-right">
            {type === "update" &&
            previousLiquidationPrice &&
            liquidationPrice &&
            previousLiquidationPrice.gt(0) &&
            liquidationPrice.gt(0) &&
            !previousLiquidationPrice.eq(liquidationPrice) ? (
              <div className="flex items-center gap-2 justify-end">
                <span className="text-neutral-800/50 text-base font-medium font-sora line-through">
                  <NumericFormat
                    displayType="text"
                    value={previousLiquidationPrice.toString()}
                    prefix="$"
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
                <span className="text-xs text-neutral-800/50">→</span>
                <span className="text-neutral-800 text-base font-medium font-sora">
                  <NumericFormat
                    displayType="text"
                    value={liquidationPrice.toString()}
                    prefix="$"
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
              </div>
            ) : (
              <span className="text-neutral-800 text-base font-medium font-sora">
                {liquidationPrice && liquidationPrice.gt(0) ? (
                  <NumericFormat
                    displayType="text"
                    value={liquidationPrice.toString()}
                    prefix="$"
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                ) : (
                  <span className="text-neutral-800/50">—</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Loan to Value Ratio */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-neutral-800 text-sm font-normal font-sora cursor-help">
                  Loan to Value
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Loan-to-Value ratio. Shows how much you're borrowing against
                  your collateral value.
                </p>
              </TooltipContent>
            </Tooltip>
            <div className="text-right">
              {(() => {
                const currentLTV =
                  changes.collateralValueUSD?.to &&
                  changes.debt?.to &&
                  changes.collateralValueUSD.to.gt(0)
                    ? changes.debt.to
                        .div(changes.collateralValueUSD.to)
                        .times(100)
                    : new Big(0);
                const previousLTV =
                  type === "update" &&
                  changes.collateralValueUSD?.from &&
                  changes.debt?.from &&
                  changes.collateralValueUSD.from.gt(0)
                    ? changes.debt.from
                        .div(changes.collateralValueUSD.from)
                        .times(100)
                    : undefined;

                // Check if LTV changed significantly (more than 0.01%)
                const ltvChanged =
                  previousLTV !== undefined &&
                  currentLTV.minus(previousLTV).abs().gt(0.01);

                if (type === "update" && ltvChanged) {
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
                      {currentLTV.gt(0) ? (
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

          {/* LTV Visual Bar - Always display */}
          {(() => {
            const currentLTV =
              changes.collateralValueUSD?.to &&
              changes.debt?.to &&
              changes.collateralValueUSD.to.gt(0)
                ? changes.debt.to
                    .div(changes.collateralValueUSD.to)
                    .times(100)
                : new Big(0);

            // Calculate the position percentage (scale to max 87% for display)
            const maxDisplayLTV = 87;
            const position = Math.min(
              (currentLTV.toNumber() / maxDisplayLTV) * 100,
              100
            );

            // Determine risk status and colors
            const getRiskStatus = (ltv: number) => {
              if (ltv >= 75) return { label: "Aggressive", color: "text-red-600", gradient: "from-red-400 to-red-600" };
              if (ltv >= 50) return { label: "Moderate", color: "text-amber-600", gradient: "from-amber-400 to-amber-600" };
              return { label: "Conservative", color: "text-green-600", gradient: "from-green-400 to-green-600" };
            };

            const riskStatus = getRiskStatus(currentLTV.toNumber());

            return (
              <div className="space-y-2">
                {/* Bar with gradient */}
                <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all duration-300 bg-gradient-to-r", riskStatus.gradient)}
                    style={{ width: `${position}%` }}
                  />
                </div>

                {/* Status label and max on same row */}
                <div className="flex justify-between items-center text-xs font-sora">
                  <span className={riskStatus.color}>{riskStatus.label}</span>
                  <span className="text-neutral-800/50">
                    Max. {maxDisplayLTV.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })()}
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
                <div className="text-xs text-amber-700 font-medium">
                  {warning}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
