import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { NumericFormat } from "react-number-format";
import type { Token } from "~/components/token-input";

interface PositionMetricsCardProps {
  collateral: number;
  debt: number;
  collateralToken: Token;
  bitcoinPrice?: number;
  usduPrice?: number;
  interestRate: number;
  ltvValue: number;
  liquidationPrice: number;
}

export function PositionMetricsCard({
  collateral,
  debt,
  collateralToken,
  bitcoinPrice,
  usduPrice,
  interestRate,
  ltvValue,
  liquidationPrice,
}: PositionMetricsCardProps) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Position Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Collateral</p>
            <p className="text-xl font-semibold">
              <NumericFormat
                displayType="text"
                value={collateral}
                thousandSeparator=","
                decimalScale={7}
                fixedDecimalScale={false}
              />{" "}
              {collateralToken.symbol}
            </p>
            {bitcoinPrice && (
              <p className="text-sm text-slate-500">
                ≈ $<NumericFormat
                  displayType="text"
                  value={collateral * bitcoinPrice}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Debt</p>
            <p className="text-xl font-semibold">
              <NumericFormat
                displayType="text"
                value={debt}
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale
              />{" "}
              USDU
            </p>
            {usduPrice && (
              <p className="text-sm text-slate-500">
                ≈ $<NumericFormat
                  displayType="text"
                  value={debt * usduPrice}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </p>
            )}
          </div>
        </div>

        <Separator className="bg-slate-100" />

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Interest Rate</p>
            <p className="text-lg font-medium">{interestRate}% APR</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-600">LTV</p>
            <p className="text-lg font-medium">
              {ltvValue.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Liquidation Price</p>
            <p className="text-lg font-medium">
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
        </div>
      </CardContent>
    </Card>
  );
}