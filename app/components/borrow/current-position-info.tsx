import { memo } from "react";
import { NumericFormat } from "react-number-format";
import type { Token } from "~/components/token-input";

interface CurrentPositionInfoProps {
  troveData: {
    collateral: number;
    debt: number;
  };
  selectedCollateralToken: Token;
}

export const CurrentPositionInfo = memo(function CurrentPositionInfo({
  troveData,
  selectedCollateralToken,
}: CurrentPositionInfoProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
      <h3 className="font-medium text-slate-700">
        Current Position
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-600">
            Collateral:
          </span>{" "}
          <span className="font-medium">
            <NumericFormat
              displayType="text"
              value={troveData.collateral}
              thousandSeparator=","
              decimalScale={7}
              fixedDecimalScale={false}
            />{" "}
            {selectedCollateralToken.symbol}
          </span>
        </div>
        <div>
          <span className="text-slate-600">Debt:</span>{" "}
          <span className="font-medium">
            <NumericFormat
              displayType="text"
              value={troveData.debt}
              thousandSeparator=","
              decimalScale={2}
              fixedDecimalScale
            />{" "}
            USDU
          </span>
        </div>
      </div>
    </div>
  );
});