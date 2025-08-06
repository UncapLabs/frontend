import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { NumericFormat } from "react-number-format";
import { AlertCircle, Info } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

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

  const title = type === "open" ? "LOAN DETAILS" : type === "update" ? "POSITION CHANGES" : "CLOSE POSITION";

  const getRiskColor = (risk?: "High" | "Medium" | "Low") => {
    switch (risk) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-slate-600";
    }
  };

  // Calculate redemption risk based on interest rate
  const calculatedRedemptionRisk = redemptionRisk || (
    changes.interestRate?.to !== undefined
      ? changes.interestRate.to < 5
        ? "High"
        : changes.interestRate.to < 10
        ? "Medium"
        : "Low"
      : undefined
  );

  return (
    <Card className={cn("border-2 border-slate-900 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium tracking-wider text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Collateral */}
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-1">
            <span className="text-sm">Collateral</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The amount of Bitcoin you deposit as collateral</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-medium text-right">
            {type === "update" && changes.collateral?.from !== changes.collateral?.to ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  <NumericFormat
                    displayType="text"
                    value={changes.collateral?.from || 0}
                    thousandSeparator=","
                    decimalScale={4}
                    fixedDecimalScale={false}
                  />
                </span>
                <span className="text-xs">→</span>
                <span>
                  <NumericFormat
                    displayType="text"
                    value={changes.collateral?.to || 0}
                    thousandSeparator=","
                    decimalScale={4}
                    fixedDecimalScale={false}
                  />
                </span>
              </div>
            ) : changes.collateral?.to ? (
              <NumericFormat
                displayType="text"
                value={changes.collateral.to}
                thousandSeparator=","
                decimalScale={4}
                fixedDecimalScale={false}
              />
            ) : (
              "0.0000"
            )}
            <span className="text-xs text-slate-600 ml-1">{changes.collateral?.token || "BTC"}</span>
          </span>
        </div>

        {/* Collateral Value */}
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-1">
            <span className="text-sm">Collateral Value</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Current USD value of your Bitcoin collateral</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-medium text-right">
            {type === "update" && changes.collateralValueUSD?.from !== changes.collateralValueUSD?.to ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  <NumericFormat
                    displayType="text"
                    value={changes.collateralValueUSD?.from || 0}
                    prefix="$"
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
                <span className="text-xs">→</span>
                <span>
                  <NumericFormat
                    displayType="text"
                    value={changes.collateralValueUSD?.to || 0}
                    prefix="$"
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
              </div>
            ) : changes.collateralValueUSD?.to ? (
              <NumericFormat
                displayType="text"
                value={changes.collateralValueUSD.to}
                prefix="$"
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale
              />
            ) : (
              "$0.00"
            )}
          </span>
        </div>

        {/* Loan Value */}
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-1">
            <span className="text-sm">Loan Value</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Amount of USDU you are borrowing</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-medium text-right">
            {type === "update" && changes.debt?.from !== changes.debt?.to ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  <NumericFormat
                    displayType="text"
                    value={changes.debt?.from || 0}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
                <span className="text-xs">→</span>
                <span>
                  <NumericFormat
                    displayType="text"
                    value={changes.debt?.to || 0}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </span>
              </div>
            ) : changes.debt?.to ? (
              <>
                <NumericFormat
                  displayType="text"
                  value={changes.debt.to}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </>
            ) : (
              "0.00"
            )}
            <span className="text-xs text-slate-600 ml-1">USDU</span>
          </span>
        </div>

        {/* Interest Rate */}
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-1">
            <span className="text-sm">Interest Rate</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Annual interest rate on your loan. Higher rates reduce redemption risk.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-medium">
            {type === "update" && changes.interestRate?.from !== changes.interestRate?.to ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{changes.interestRate?.from}.00%</span>
                <span className="text-xs">→</span>
                <span>{changes.interestRate?.to}.00%</span>
              </div>
            ) : (
              `${changes.interestRate?.to || 5}.00%`
            )}
          </span>
        </div>

        {/* Liquidation Price */}
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-1">
            <span className="text-sm">Liquidation Price</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Bitcoin price at which your position will be liquidated (110% collateral ratio)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-medium">
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
              "—"
            )}
          </span>
        </div>

        {/* Liquidation Risk */}
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-1">
            <span className="text-sm">Liquidation Risk</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Risk of liquidation based on current Bitcoin price vs liquidation price</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className={cn("text-sm font-medium", getRiskColor(liquidationRisk))}>
            {liquidationRisk || "—"}
          </span>
        </div>

        {/* Redemption Risk */}
        {calculatedRedemptionRisk && (
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-1">
              <span className="text-sm">Redemption Risk</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-slate-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Risk of your position being redeemed. Lower interest rates have higher redemption risk.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className={cn("text-sm font-medium", getRiskColor(calculatedRedemptionRisk))}>
              {calculatedRedemptionRisk}
            </span>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">{warning}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}