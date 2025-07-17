import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { useUserTroves } from "~/hooks/use-user-troves";
import { NumericFormat } from "react-number-format";
import { Badge } from "~/components/ui/badge";
import {
  ArrowRight,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
} from "lucide-react";

function MyTroves() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { troves, isLoading, hasActiveTroves } = useUserTroves();

  const handleCreateNew = () => {
    navigate("/");
  };

  const handleAdjustTrove = (troveId: string) => {
    navigate(`/borrow/${troveId}`);
  };

  const getHealthBadgeColor = (healthFactor: number) => {
    if (healthFactor >= 2) return "bg-green-100 text-green-800";
    if (healthFactor >= 1.5) return "bg-yellow-100 text-yellow-800";
    if (healthFactor >= 1.2) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getHealthText = (healthFactor: number) => {
    if (healthFactor >= 2) return "Healthy";
    if (healthFactor >= 1.5) return "Moderate";
    if (healthFactor >= 1.2) return "At Risk";
    return "Critical";
  };

  if (!address) {
    return (
      <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="flex justify-between items-baseline">
          <h1 className="text-3xl font-bold mb-2 text-slate-800">My Troves</h1>
        </div>
        <Separator className="mb-8 bg-slate-200" />
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-slate-600 mb-4">
            Connect your wallet to view your troves
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">My Troves</h1>
        <Button
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Open New Trove
        </Button>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-600">Loading your troves...</p>
        </div>
      ) : !hasActiveTroves ? (
        <Card className="border border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <DollarSign className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No Active Troves
            </h3>
            <p className="text-slate-600 text-center mb-6 max-w-md">
              You don't have any active borrowing positions yet. Create your
              first trove to start borrowing bitUSD against your Bitcoin
              collateral.
            </p>
            <Button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Open Your First Trove
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {troves.map((trove) => (
            <Card
              key={trove.id}
              className="border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleAdjustTrove(trove.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Trove #{trove.id}</CardTitle>
                  <Badge
                    variant="secondary"
                    className={getHealthBadgeColor(trove.healthFactor)}
                  >
                    {getHealthText(trove.healthFactor)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Collateral */}
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-slate-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Collateral
                  </div>
                  <div className="font-semibold">
                    <NumericFormat
                      displayType="text"
                      value={trove.collateralAmount}
                      thousandSeparator=","
                      decimalScale={7}
                      fixedDecimalScale={false}
                    />{" "}
                    {trove.collateralAsset}
                  </div>
                  <div className="text-sm text-slate-600">
                    $
                    <NumericFormat
                      displayType="text"
                      value={trove.collateralValue}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </div>
                </div>

                {/* Debt */}
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-slate-600">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Debt
                  </div>
                  <div className="font-semibold">
                    <NumericFormat
                      displayType="text"
                      value={trove.borrowedAmount}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />{" "}
                    {trove.borrowedAsset}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-slate-600">
                      <Percent className="h-3 w-3 mr-1" />
                      Interest Rate
                    </div>
                    <div className="text-sm font-medium">
                      {trove.interestRate}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-600">
                      Liquidation Price
                    </div>
                    <div className="text-sm font-medium">
                      $
                      <NumericFormat
                        displayType="text"
                        value={trove.liquidationPrice}
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="ghost"
                  className="w-full justify-between hover:bg-slate-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjustTrove(trove.id);
                  }}
                >
                  Adjust Position
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTroves;

export function meta() {
  return [
    { title: "My Troves - BitUSD" },
    { name: "description", content: "Manage your BitUSD borrowing positions" },
  ];
}
