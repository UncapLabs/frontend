import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import { AlertTriangle, DollarSign, Info } from "lucide-react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/borrow.liquidated";
import { CollateralSurplusCard } from "~/components/claim/collateral-surplus-card";
import { useAccount } from "@starknet-react/core";
import { useCollateralSurplus } from "~/hooks/use-collateral-surplus";

function LiquidatedPositionsPage() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { totalSurplusesCount, isLoading } = useCollateralSurplus(address);

  return (
    <>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">
        Liquidated Positions
      </h2>

      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Your positions were liquidated</strong>
          <p className="mt-1">
            One or more of your positions' health factor fell below 110%, triggering 
            automatic liquidation to protect the protocol's stability.
          </p>
        </AlertDescription>
      </Alert>

      {/* Info cards about liquidation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* What Happened Card */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">What Happened?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                When your position's collateralization ratio dropped below 110%
                (health factor below 1.0), it became eligible for liquidation.
              </p>
              <p>
                A liquidator repaid your debt and received your collateral at a
                discount as compensation.
              </p>
              <p>
                This process helps maintain the protocol's solvency and protects
                other users.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Surplus Status Card */}
        <Card className={`border ${totalSurplusesCount > 0 && !isLoading ? 'border-green-200 bg-green-50/50' : 'border-slate-200'}`}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className={`h-5 w-5 ${totalSurplusesCount > 0 && !isLoading ? 'text-green-600' : 'text-slate-600'}`} />
              Collateral Surplus Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm text-slate-600">
              {isLoading ? (
                <p>Checking for collateral surplus...</p>
              ) : totalSurplusesCount > 0 ? (
                <>
                  <p className="font-medium text-green-800">
                    You have collateral surplus available!
                  </p>
                  <p>
                    Your collateral value exceeded the debt plus liquidation penalty.
                    You can claim the surplus below.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-slate-800">
                    No collateral surplus available.
                  </p>
                  <p>
                    The liquidation penalty and debt repayment consumed
                    all of your collateral value.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collateral Surplus Section - shows if surplus available */}
      {!isLoading && totalSurplusesCount > 0 && (
        <div className="mb-8">
          <CollateralSurplusCard />
        </div>
      )}

      {/* Additional Information */}
      <Card className="mt-6 border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Understanding Liquidations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-700 mb-2">
                Why do liquidations happen?
              </h4>
              <p className="text-sm text-slate-600">
                Liquidations ensure the protocol remains overcollateralized.
                When Bitcoin's price drops or your debt grows from interest,
                your position may become undercollateralized and require
                liquidation.
              </p>
            </div>

            <Separator className="bg-slate-100" />

            <div>
              <h4 className="font-medium text-slate-700 mb-2">
                How to avoid liquidations
              </h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>
                  • Maintain a health factor well above 1.0 (ideally above 1.5)
                </li>
                <li>• Monitor Bitcoin price movements</li>
                <li>• Add collateral when your health factor decreases</li>
                <li>• Repay debt to improve your collateralization ratio</li>
              </ul>
            </div>

            <Separator className="bg-slate-100" />

            <div>
              <h4 className="font-medium text-slate-700 mb-2">What's next?</h4>
              <p className="text-sm text-slate-600">
                You can open a new position at any time. Consider using a lower
                leverage ratio to reduce liquidation risk in the future.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button
          variant="outline"
          onClick={() => navigate("/unanim/dashboard")}
          className="flex-1"
        >
          Back to Dashboard
        </Button>
        <Button
          onClick={() => navigate("/unanim/borrow")}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
        >
          Open New Position
        </Button>
      </div>
    </>
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
