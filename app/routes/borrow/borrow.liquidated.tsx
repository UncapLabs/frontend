import { AlertTriangle } from "lucide-react";
import type { Route } from "./+types/borrow.liquidated";
import { CollateralSurplusCard } from "~/components/borrow/collateral-surplus-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { createMeta } from "~/lib/utils/meta";

function LiquidatedPositionsPage() {
  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between pb-6 items-baseline">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
          Liquidated Positions
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Panel - Main Content */}
        <div className="flex-1 lg:flex-[2]">
          <div className="space-y-6">
            {/* Liquidation Info */}
            <div className="bg-white rounded-2xl p-5 border border-red-200/50">
              {/* Header with icon and title */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-neutral-800 font-medium font-sora text-base mb-1">
                    Position Liquidated
                  </h3>
                  <p className="text-sm font-sora text-neutral-600">
                    Your position was liquidated when LTV exceeded 86.95%.
                  </p>
                </div>
              </div>

              {/* Liquidation threshold card */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200/50 mb-4">
                <div className="text-xs font-medium font-sora uppercase tracking-tight text-red-700 mb-2">
                  Liquidation Threshold
                </div>
                <div className="text-2xl font-medium font-sora text-red-900">
                  86.95% LTV
                </div>
              </div>

              {/* What happened */}
              <div className="space-y-2">
                <div className="text-xs font-medium font-sora uppercase tracking-tight text-neutral-800 mb-3">
                  What Happened
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span className="text-neutral-700 font-sora">
                    A liquidator repaid your debt and received your collateral
                    at a discount
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span className="text-neutral-700 font-sora">
                    Any excess collateral value may be available as surplus
                    below
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span className="text-neutral-700 font-sora">
                    This process protects the protocol and other users from bad
                    debt
                  </span>
                </div>
              </div>
            </div>

            {/* Collateral Surplus Section - always show */}
            <CollateralSurplusCard />
          </div>
        </div>

        {/* Right Panel - Info */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px]">
          <Card className="rounded-2xl border-0 shadow-none bg-white">
            <CardHeader className="border-b border-[#F5F3EE]">
              <CardTitle className="text-lg font-medium font-sora text-neutral-800">
                How to Avoid This
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-sora text-neutral-600">
                To prevent future liquidations, keep your LTV well below the
                86.95% threshold.
              </p>

              <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-medium font-sora uppercase tracking-tight text-neutral-800">
                  Best Practices
                </h4>
                <ul className="text-xs font-sora text-neutral-600 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span>Monitor your position's LTV regularly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span>Add collateral when LTV approaches 80%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span>Repay debt to reduce your LTV</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span>Keep a safety margin below 70% LTV</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LiquidatedPositionsPage;

export function meta(args: Route.MetaArgs) {
  return createMeta(args, {
    title: "Uncap - Liquidated position",
    description:
      "Information about your liquidated positions and possible collateral surplus",
  });
}
