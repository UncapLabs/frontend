import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { NumericFormat } from "react-number-format";
import { AlertCircle, Info } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";

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
  redemptionRisk?: "High" | "Medium" | "Low";
}

export function TransactionSummary({
  type,
  changes,
  liquidationPrice,
  liquidationRisk,
  className,
  warnings = [],
  redemptionRisk,
}: TransactionSummaryProps) {
  const title =
    type === "open"
      ? "Position Summary"
      : type === "update"
      ? "Position Changes"
      : "Close Position";

  // Calculate annual interest cost
  const annualInterestCost = changes.debt?.to && changes.interestRate?.to 
    ? (changes.debt.to * changes.interestRate.to) / 100
    : 0;

  const getRiskBadgeVariant = (
    risk?: "High" | "Medium" | "Low"
  ): "destructive" | "warning" | "success" | "secondary" => {
    switch (risk) {
      case "High":
        return "destructive";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "secondary";
    }
  };

  // Calculate redemption risk based on interest rate
  const calculatedRedemptionRisk =
    redemptionRisk ||
    (changes.interestRate?.to !== undefined
      ? changes.interestRate.to < 5
        ? "High"
        : changes.interestRate.to < 10
        ? "Medium"
        : "Low"
      : undefined);

  return (
    <Card
      className={cn(
        "border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100">
        <CardTitle className="text-base font-semibold text-slate-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        {/* Collateral with value */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-700 font-medium">
              Collateral
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The amount and value of your collateral</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-right">
            {type === "update" &&
            changes.collateral?.from !== changes.collateral?.to ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm text-slate-400 line-through">
                    <NumericFormat
                      displayType="text"
                      value={changes.collateral?.from || 0}
                      thousandSeparator=","
                      decimalScale={4}
                      fixedDecimalScale={false}
                    />{" "}
                    {changes.collateral?.token || "BTC"}
                  </span>
                  <span className="text-xs text-slate-400">→</span>
                  <span className="text-sm font-semibold text-slate-900">
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
                <div className="text-xs text-slate-500">
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
                <div className="text-sm font-semibold text-slate-900">
                  <NumericFormat
                    displayType="text"
                    value={changes.collateral?.to || 0}
                    thousandSeparator=","
                    decimalScale={4}
                    fixedDecimalScale={false}
                  />{" "}
                  {changes.collateral?.token || "BTC"}
                </div>
                <div className="text-xs text-slate-500">
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-700 font-medium">Loan</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Amount of USDU you are borrowing</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-right">
            {type === "update" && changes.debt?.from !== changes.debt?.to ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 line-through">
                  <NumericFormat
                    displayType="text"
                    value={changes.debt?.from || 0}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />{" "}
                  USDU
                </span>
                <span className="text-xs text-slate-400">→</span>
                <span className="text-sm font-semibold text-slate-900">
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
            ) : (
              <span className="text-sm font-semibold text-slate-900">
                <NumericFormat
                  displayType="text"
                  value={changes.debt?.to || 0}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />{" "}
                USDU
              </span>
            )}
          </div>
        </div>

        {/* Interest Rate with annual cost */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-700 font-medium">
              Interest rate
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-slate-400 cursor-help" />
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
                  <span className="text-sm text-slate-400 line-through">
                    {changes.interestRate?.from}.00%
                  </span>
                  <span className="text-xs text-slate-400">→</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {changes.interestRate?.to}.00%
                  </span>
                </div>
                {annualInterestCost > 0 && (
                  <div className="text-xs text-slate-500">
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
                <div className="text-sm font-semibold text-slate-900">
                  {changes.interestRate?.to || 5}.00%
                </div>
                {annualInterestCost > 0 && (
                  <div className="text-xs text-slate-500">
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

        {/* Liquidation Price */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-700 font-medium">
              Liquidation Price
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Bitcoin price at which your position will be liquidated (110%
                  collateral ratio)
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-semibold text-slate-900">
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
              <span className="text-slate-400">—</span>
            )}
          </span>
        </div>

        {/* Redemption Risk */}
        {calculatedRedemptionRisk && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-slate-700 font-medium">
                Redemption Risk
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-slate-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Risk of your position being redeemed. Lower interest rates
                    have higher redemption risk.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Badge
              variant={getRiskBadgeVariant(calculatedRedemptionRisk)}
              className="text-xs"
            >
              {calculatedRedemptionRisk}
            </Badge>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="pt-2 space-y-2 border-t border-slate-100">
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
      </CardContent>
    </Card>
  );
}
