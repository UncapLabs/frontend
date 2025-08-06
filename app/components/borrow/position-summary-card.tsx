import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Edit3, Percent } from "lucide-react";
import { NumericFormat } from "react-number-format";

interface PositionSummaryCardProps {
  totalValue: number;
  netValue: number;
  onUpdatePosition: () => void;
  onChangeRate: () => void;
  isZombie?: boolean;
  // Additional optional props for more detailed view
  liquidationPrice?: number;
  ltvValue?: number;
  collateralRatio?: number;
  interestRate?: number;
}

export function PositionSummaryCard({
  totalValue,
  netValue,
  onUpdatePosition,
  onChangeRate,
  isZombie = false,
  liquidationPrice,
  ltvValue,
  collateralRatio,
  interestRate,
}: PositionSummaryCardProps) {
  return (
    <Card className="border border-slate-200 shadow-sm sticky top-8">
      <CardHeader>
        <CardTitle>Position Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-600 mb-1">Total Value</p>
              <p className="text-lg font-semibold">
                <NumericFormat
                  displayType="text"
                  value={totalValue}
                  prefix="$"
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Net Value</p>
              <p className="text-lg font-semibold">
                <NumericFormat
                  displayType="text"
                  value={netValue}
                  prefix="$"
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </p>
            </div>
          </div>

          {/* Additional metrics if provided */}
          {(liquidationPrice !== undefined || ltvValue !== undefined) && (
            <>
              <Separator className="bg-slate-100" />
              <div className="grid grid-cols-2 gap-3">
                {liquidationPrice !== undefined && (
                  <div>
                    <p className="text-xs text-slate-600 mb-1">
                      Liquidation Price
                    </p>
                    <p className="text-sm font-medium">
                      <NumericFormat
                        displayType="text"
                        value={liquidationPrice}
                        prefix="$"
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </p>
                  </div>
                )}
                {ltvValue !== undefined && (
                  <div>
                    <p className="text-xs text-slate-600 mb-1">LTV</p>
                    <p className="text-sm font-medium">
                      {ltvValue.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {(collateralRatio !== undefined || interestRate !== undefined) && (
            <div className="grid grid-cols-2 gap-3">
              {collateralRatio !== undefined && (
                <div>
                  <p className="text-xs text-slate-600 mb-1">
                    Collateral Ratio
                  </p>
                  <p className="text-sm font-medium">
                    {collateralRatio.toFixed(0)}%
                  </p>
                </div>
              )}
              {interestRate !== undefined && (
                <div>
                  <p className="text-xs text-slate-600 mb-1">Interest Rate</p>
                  <p className="text-sm font-medium">{interestRate}% APR</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
