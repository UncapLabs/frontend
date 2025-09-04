import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";

interface STRKRebateInfoProps {
  yearlyInterestUSD: number;
  effectiveYearlyInterestUSD: number;
  yearlyRebateUSD: number;
}

export function STRKRebateInfo({
  yearlyInterestUSD,
  effectiveYearlyInterestUSD,
  yearlyRebateUSD,
}: STRKRebateInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-white rounded-lg border border-slate-200 mt-4"
    >
      <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-purple-600" />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            STRK Rebate Program
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-purple-600">
            +$
            <NumericFormat
              displayType="text"
              value={yearlyRebateUSD}
              thousandSeparator=","
              decimalScale={0}
              fixedDecimalScale={false}
            />
            /year
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-3 pb-3 border-t border-slate-100">
          <p className="text-xs text-slate-600 mt-3 mb-3">
            You get a 30% discount on your interest rate, paid as STRK tokens
            claimable weekly.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Original Annual Interest
              </span>
              <span className="text-xs text-slate-400 line-through">
                $
                <NumericFormat
                  displayType="text"
                  value={yearlyInterestUSD}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Effective Annual Interest
              </span>
              <span className="text-xs font-semibold text-green-600">
                $
                <NumericFormat
                  displayType="text"
                  value={effectiveYearlyInterestUSD}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-600">
                Annual Savings (paid in STRK)
              </span>
              <span className="text-sm font-bold text-purple-600">
                $
                <NumericFormat
                  displayType="text"
                  value={yearlyRebateUSD}
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />{" "}
                worth
              </span>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
