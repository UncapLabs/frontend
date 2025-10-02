import { AlertTriangle, Shield, Clock } from "lucide-react";
import type { Route } from "./+types/borrow.liquidated";
import { CollateralSurplusCard } from "~/components/borrow/collateral-surplus-card";
import { useAccount } from "@starknet-react/core";
import { useCollateralSurplus } from "~/hooks/use-collateral-surplus";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

function LiquidatedPositionsPage() {
  const { address } = useAccount();
  const { totalSurplusesCount, isLoading } = useCollateralSurplus(address);

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between pb-6 items-baseline">
        <h1 className="text-2xl md:text-3xl font-medium leading-none font-sora text-neutral-800">
          Liquidated Positions
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Panel - Main Content */}
        <div className="flex-1 lg:flex-[2]">
          <div className="space-y-6">
            {/* How Liquidation Works */}
            <Card className="rounded-2xl border-0 shadow-none bg-white">
              <CardHeader className="border-b border-[#F5F3EE]">
                <CardTitle className="text-lg font-medium font-sora text-neutral-800 flex items-center gap-2">
                  How Liquidation Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alert Message */}
                <div className="bg-token-bg-red/10 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-token-bg-red flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium font-sora text-neutral-800 mb-1">
                        Position Liquidated
                      </p>
                      <p className="text-sm font-sora text-neutral-600">
                        Your position was liquidated because the loan-to-value
                        (LTV) ratio exceeded the maximum threshold of{" "}
                        <span className="font-medium text-neutral-800">
                          90.91%
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium font-sora text-neutral-800 mb-2">
                      Example Scenario
                    </h4>
                    <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm font-sora">
                        <span className="text-neutral-600">
                          Initial Deposit:
                        </span>
                        <span className="font-medium text-neutral-800">
                          1 WBTC ($100,000)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-sora">
                        <span className="text-neutral-600">
                          Amount Borrowed:
                        </span>
                        <span className="font-medium text-neutral-800">
                          $70,000 USDU
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-sora">
                        <span className="text-neutral-600">Initial LTV:</span>
                        <span className="font-medium text-neutral-800">
                          70%
                        </span>
                      </div>
                      <div className="border-t border-neutral-200 pt-2 mt-2">
                        <div className="flex items-center justify-between text-sm font-sora">
                          <span className="text-neutral-600">
                            Liquidation Price:
                          </span>
                          <span className="font-medium text-token-bg-red">
                            $77,000
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-sora text-neutral-500 pt-2">
                        When WBTC price drops to $77,000, your LTV reaches
                        90.91% (70,000 ÷ 77,000)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neutral-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium font-sora text-neutral-800 mb-1">
                        What Happened Next
                      </p>
                      <p className="text-sm font-sora text-neutral-600">
                        A liquidator repaid your debt and received your
                        collateral at a discount. Any excess collateral value
                        may be available as surplus for you to claim.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neutral-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium font-sora text-neutral-800 mb-1">
                        Protocol Protection
                      </p>
                      <p className="text-sm font-sora text-neutral-600">
                        This process ensures the protocol remains solvent and
                        protects other users from bad debt.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collateral Surplus Section - shows if surplus available */}
            {!isLoading && totalSurplusesCount > 0 && <CollateralSurplusCard />}
          </div>
        </div>

        {/* Right Panel - Info */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px]">
          <Card className="rounded-2xl border-0 shadow-none bg-white lg:sticky lg:top-8">
            <CardHeader className="border-b border-[#F5F3EE]">
              <CardTitle className="text-lg font-medium font-sora text-neutral-800 flex items-center gap-2">
                Liquidation Thresholds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="bg-token-bg-red/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-medium font-sora text-token-bg-red">
                    90.91%
                  </div>
                  <div className="text-xs font-sora text-token-bg-red/80 mt-1">
                    Maximum LTV
                  </div>
                </div>
              </div>

              <p className="text-sm font-sora text-neutral-600">
                When your position's loan-to-value ratio exceeds 90.91%, it
                becomes eligible for liquidation to protect the protocol.
              </p>

              <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-medium font-sora uppercase tracking-tight text-neutral-800">
                  How to Avoid Liquidation
                </h4>
                <ul className="text-xs font-sora text-neutral-600 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span>Monitor your position's LTV regularly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span>Add more collateral when LTV increases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span>Repay debt to reduce your LTV</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-neutral-400 mt-0.5">•</span>
                    <span>Keep LTV well below 90% for safety margin</span>
                  </li>
                </ul>
              </div>

              <div className="text-xs font-sora text-neutral-500 space-y-1 pt-2">
                <p>• Liquidations are automated and irreversible</p>
                <p>• Check for surplus collateral in the surplus section</p>
                <p>• Consider lower LTV ratios for safer positions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
