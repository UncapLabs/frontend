import { RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Separator } from "~/components/ui/separator";
import { NumericFormat } from "react-number-format";

interface PositionSummaryProps {
  debtLimit: number;
  healthFactor: number;
  liquidationPrice: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function PositionSummary({
  debtLimit,
  healthFactor,
  liquidationPrice,
  isRefreshing,
  onRefresh,
}: PositionSummaryProps) {
  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-slate-800">Position Summary</CardTitle>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-slate-100 transition-colors"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-600 ${
                isRefreshing ? "animate-spin" : ""
              }`}
              style={isRefreshing ? { animationDuration: "2s" } : undefined}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-3">
        {/* Health Factor and Liquidation Price */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm items-center">
            <span className="flex items-center text-slate-700 font-medium">
              Debt Limit
              <div className="relative group">
                <HelpCircle className="h-3 w-3 ml-1 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-white rounded shadow-lg text-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  The maximum amount you can borrow.
                </div>
              </div>
            </span>
            <NumericFormat
              className="font-medium"
              displayType="text"
              value={debtLimit}
              prefix={"$"}
              thousandSeparator=","
              decimalScale={2}
              fixedDecimalScale
            />
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="flex items-center text-slate-700 font-medium">
              Health Factor
              <div className="relative group">
                <HelpCircle className="h-3 w-3 ml-1 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-white rounded shadow-lg text-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  Health factor indicates the safety of your position. Higher is
                  better.
                </div>
              </div>
            </span>
            <div className="flex items-center justify-between">
              <NumericFormat
                className="text-green-600 font-semibold"
                displayType="text"
                value={healthFactor}
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale
              />
            </div>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="flex items-center text-slate-700 font-medium">
              Liquidation Price
              <div className="relative group">
                <HelpCircle className="h-3 w-3 ml-1 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-white rounded shadow-lg text-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  Your position will be liquidated if the price reaches this
                  level.
                </div>
              </div>
            </span>

            <NumericFormat
              className="font-medium"
              displayType="text"
              value={liquidationPrice}
              prefix={"$"}
              thousandSeparator=","
              decimalScale={2}
              fixedDecimalScale
            />
          </div>
        </div>

        <Separator className="bg-slate-200" />
      </CardContent>
      <CardFooter className="pt-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="text-sm font-medium text-slate-600 hover:text-slate-800 py-2">
              Transaction Details
            </AccordionTrigger>
            <AccordionContent className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
              {/* Placeholder for transaction details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gas Fee (est.)</span>
                  <span>$0.001</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Time</span>
                  <span>~2 seconds</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  );
}
