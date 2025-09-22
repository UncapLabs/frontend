import { AlertTriangle, TrendingDown, Shield, Clock, Info } from "lucide-react";
import type { Route } from "./+types/borrow.liquidated";
import { CollateralSurplusCard } from "~/components/claim/collateral-surplus-card";
import { useAccount } from "@starknet-react/core";
import { useCollateralSurplus } from "~/hooks/use-collateral-surplus";

function LiquidatedPositionsPage() {
  const { address } = useAccount();
  const { totalSurplusesCount, isLoading } = useCollateralSurplus(address);

  return (
    <div className="mx-auto max-w-2xl md:max-w-4xl lg:max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-medium leading-none mb-4 font-sora text-neutral-800">
          Liquidated Positions
        </h1>
      </div>

      <div className="md:max-w-3xl lg:max-w-5xl space-y-1">
        {/* Liquidation Details Card */}
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
              WHY YOUR POSITION WAS LIQUIDATED
            </h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <AlertTriangle className="h-4 w-4 text-neutral-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">
                  LTV exceeded maximum threshold
                </p>
                <p className="text-sm">
                  Positions get liquidated when their loan-to-value (LTV) ratio
                  exceeds the maximum threshold of <strong>90.91%</strong> for
                  WBTC or GBTC.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Info className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Example scenario:</p>
                  <div className="bg-neutral-50 rounded-lg p-3 text-sm space-y-1">
                    <p>
                      • You deposited <strong>1 WBTC</strong> worth{" "}
                      <strong>$100,000</strong>
                    </p>
                    <p>
                      • You borrowed <strong>$70,000 USDU</strong> (70% LTV)
                    </p>
                    <p>
                      • If WBTC price drops below <strong>$77,000</strong>
                    </p>
                    <p>
                      • Your LTV would exceed 90.91% →{" "}
                      <strong>Liquidation triggers</strong>
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    (70,000 ÷ 77,000 = 90.91% LTV)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Clock className="h-4 w-4 text-neutral-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">What happened next</p>
                <p className="text-sm">
                  A liquidator repaid your debt and received your collateral at
                  a discount. Any excess collateral value may be available as
                  surplus.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Shield className="h-4 w-4 text-neutral-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Protocol protection</p>
                <p className="text-sm">
                  This process ensures the protocol remains solvent and protects
                  other users from bad debt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collateral Surplus Section - shows if surplus available */}
      {!isLoading && totalSurplusesCount > 0 && (
        <div className="md:max-w-3xl lg:max-w-5xl mt-6">
          <CollateralSurplusCard />
        </div>
      )}
    </div>
  );
}

export default LiquidatedPositionsPage;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Liquidated Positions - USDU" },
    {
      name: "description",
      content:
        "Information about your liquidated positions and possible collateral surplus",
    },
  ];
}
