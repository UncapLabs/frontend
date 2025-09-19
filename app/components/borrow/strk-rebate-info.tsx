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
      className="bg-white rounded-lg border border-neutral-200 mt-4"
    >
      <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:border-neutral-200/80 transition-opacity">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-neutral-800" />
          </div>
          <span className="text-xs font-medium text-neutral-800 font-sora">
            STRK Rebate Program
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-green-600 font-sora">
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
            <ChevronUp className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-3 pb-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-600 font-sora mt-3 mb-3">
            You get a 30% discount on your interest rate, paid as STRK tokens
            claimable weekly.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600 font-sora">
                Original Annual Interest
              </span>
              <span className="text-xs text-neutral-500 line-through font-sora">
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
              <span className="text-xs text-neutral-600 font-sora">
                Effective Annual Interest
              </span>
              <span className="text-xs font-medium text-green-600 font-sora">
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
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
