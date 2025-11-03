import { NumericFormat } from "react-number-format";
import Big from "big.js";

interface ManagedStrategyProps {
  borrowAmount?: Big;
  apr?: Big;
  managementFee?: Big;
  managedDebt?: Big;
}

function formatPercentage(value?: Big, defaultValue?: string) {
  if (!value) return defaultValue ?? "—";
  return `${value.toFixed(2)}%`;
}

export function ManagedStrategy({
  borrowAmount,
  apr,
  managementFee,
  managedDebt,
}: ManagedStrategyProps) {
  const feePercent = managementFee;
  const aprDecimal = apr?.div(100);

  const annualInterestUSD =
    borrowAmount && borrowAmount.gt(0) && aprDecimal
      ? borrowAmount.times(aprDecimal)
      : new Big(0);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Interest Rate Display */}
      <div className="flex items-baseline gap-3">
        <NumericFormat
          displayType="text"
          value={apr ? Number(apr.toFixed(2)) : 0}
          decimalScale={2}
          fixedDecimalScale={true}
          suffix="%"
          style={{
            width: apr
              ? `${(Number(apr.toFixed(2)).toFixed(2).length + 1) * 0.65}em`
              : "3em",
          }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-sora leading-10 text-neutral-800 bg-transparent border-none text-left md:mt-1 lg:mt-2"
        />
        {borrowAmount && borrowAmount.gt(0) && (
          <div className="flex items-baseline">
            <span className="text-sm text-neutral-800 font-medium font-sora">
              <NumericFormat
                displayType="text"
                value={annualInterestUSD.toString()}
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale
              />
            </span>
            <span className="text-xs text-neutral-500 block ml-1">
              {" "}
              USDU / year
            </span>
          </div>
        )}
      </div>
      {/* Managed Strategy Info */}
      <div className="w-full bg-neutral-50 rounded-xl p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <p className="text-neutral-600 text-xs font-normal font-sora leading-relaxed">
              Automated interest rate management
            </p>
            <p className="text-neutral-500 text-xs font-normal font-sora">
              USDU Managed:{" "}
              {managedDebt ? (
                <>
                  $
                  <NumericFormat
                    displayType="text"
                    value={managedDebt.toString()}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </>
              ) : (
                "—"
              )}
              , Annual Fee:{" "}
              {managementFee ? `${formatPercentage(feePercent)} on your debt` : "—"}
            </p>
          </div>
          <img
            src="/telos.svg"
            alt="Telos"
            className="h-4 w-auto object-contain flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
