import { NumericFormat } from "react-number-format";

interface DebtStatisticsProps {
  debtInFront: number;
  totalDebt: number;
}

export function DebtStatistics({ debtInFront, totalDebt }: DebtStatisticsProps) {
  if (totalDebt <= 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      <div className="bg-white rounded-lg border border-slate-200 p-2">
        <p className="text-xs text-slate-500">Debt in front</p>
        <p className="text-sm font-semibold text-slate-700">
          <NumericFormat
            displayType="text"
            value={debtInFront}
            thousandSeparator=","
            decimalScale={0}
            fixedDecimalScale={false}
          />{" "}
          USDU
        </p>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-2">
        <p className="text-xs text-slate-500">Total debt</p>
        <p className="text-sm font-semibold text-slate-700">
          <NumericFormat
            displayType="text"
            value={totalDebt}
            thousandSeparator=","
            decimalScale={0}
            fixedDecimalScale={false}
          />{" "}
          USDU
        </p>
      </div>
    </div>
  );
}
