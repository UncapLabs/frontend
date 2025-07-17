import { memo } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { NumericFormat } from "react-number-format";
import type { Token } from "~/components/token-input";

interface PositionSummaryCardProps {
  collateralAmount?: number;
  borrowAmount?: number;
  interestRate?: number;
  liquidationPrice: number;
  troveData?: {
    collateral: number;
    debt: number;
  };
  selectedCollateralToken: Token;
}

export const PositionSummaryCard = memo(function PositionSummaryCard({
  collateralAmount,
  borrowAmount,
  interestRate,
  liquidationPrice,
  troveData,
  selectedCollateralToken,
}: PositionSummaryCardProps) {
  return (
    <Card className="border border-slate-200 shadow-sm sticky top-8">
      <CardContent className="pt-6 space-y-4">
        <h3 className="font-semibold text-lg text-slate-800">
          Position Summary
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-slate-600">Collateral</span>
            <span className="font-medium">
              <NumericFormat
                displayType="text"
                value={collateralAmount ?? troveData?.collateral ?? 0}
                thousandSeparator=","
                decimalScale={7}
                fixedDecimalScale={false}
              />{" "}
              {selectedCollateralToken.symbol}
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-sm text-slate-600">Debt</span>
            <span className="font-medium">
              <NumericFormat
                displayType="text"
                value={borrowAmount ?? troveData?.debt ?? 0}
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale
              />{" "}
              bitUSD
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-sm text-slate-600">Interest Rate</span>
            <span className="font-medium">{interestRate ?? 0}%</span>
          </div>

          <Separator className="bg-slate-100" />

          <div className="flex justify-between items-baseline">
            <span className="text-sm text-slate-600">
              Liquidation Price
            </span>
            <span className="font-medium">
              <NumericFormat
                displayType="text"
                value={liquidationPrice}
                prefix="$"
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale
              />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});