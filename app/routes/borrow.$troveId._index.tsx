import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, Edit3, Percent, XCircle, AlertTriangle } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import type { Route } from "./+types/borrow.$troveId._index";
import { useParams, useNavigate } from "react-router";
import { NumericFormat } from "react-number-format";
import { useTroveData } from "~/hooks/use-trove-data";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import {
  INTEREST_RATE_SCALE_DOWN_FACTOR,
  UBTC_TOKEN,
  GBTC_TOKEN,
  type CollateralType,
} from "~/lib/contracts/constants";
import { useQueryState } from "nuqs";

const ACTION_CARDS = [
  {
    title: "Update Position",
    description: "Adjust your collateral and debt amounts",
    icon: Edit3,
    route: "update",
    color: "blue",
  },
  {
    title: "Adjust Interest Rate",
    description: "Change your position's interest rate",
    icon: Percent,
    route: "rate",
    color: "green",
  },
  {
    title: "Close Position",
    description: "Repay debt and withdraw collateral",
    icon: XCircle,
    route: "close",
    color: "red",
  },
];

function TroveOverviewIndex() {
  const { troveId } = useParams();
  const navigate = useNavigate();

  // Get collateral type from URL or default to UBTC
  const [troveCollateralType] = useQueryState("type", {
    defaultValue: "UBTC",
  });

  // Fetch existing trove data
  const { troveData, position, isLoading: isTroveLoading } = useTroveData(troveId);

  // Get the collateral token based on position data or URL param
  const selectedCollateralToken = position?.collateralAsset === "GBTC" ? GBTC_TOKEN : UBTC_TOKEN;

  // Conditional price fetching
  const { bitcoin, usdu } = useFetchPrices(troveData?.collateral);

  const handleActionClick = (route: string) => {
    navigate(`/borrow/${troveId}/${route}?type=${troveCollateralType}`);
  };

  // Calculate key metrics
  const currentInterestRate = troveData
    ? Number(troveData.annualInterestRate) /
      Number(INTEREST_RATE_SCALE_DOWN_FACTOR)
    : 0;
  
  const liquidationPrice = troveData && troveData.collateral > 0
    ? (troveData.debt * 1.1) / troveData.collateral
    : 0;

  // Calculate LTV
  const ltvValue = troveData && bitcoin?.price && usdu?.price && troveData.collateral > 0
    ? (troveData.debt * usdu.price) / (troveData.collateral * bitcoin.price) * 100
    : 0;

  // Check for special states
  const isZombie = false; // TODO: Get from trove status
  const isRedeemed = false; // TODO: Get from trove status

  if (isTroveLoading || !troveData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-slate-600">Loading position data...</p>
      </div>
    );
  }

  return (
    <>
      {/* Special Status Warnings */}
      {(isZombie || isRedeemed) && (
        <div className="mb-6">
          <Card className="border border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-amber-800">
                    {isZombie ? "Zombie Position" : "Redeemed Position"}
                  </h3>
                  <p className="text-sm text-amber-700">
                    {isZombie
                      ? "This position has fallen below the minimum debt threshold. You should adjust or close it."
                      : "This position has been partially redeemed. Consider adjusting your position or checking for surplus collateral."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Panel - Position Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Position Summary Card */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Position Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Collateral</p>
                  <p className="text-xl font-semibold">
                    <NumericFormat
                      displayType="text"
                      value={troveData.collateral}
                      thousandSeparator=","
                      decimalScale={7}
                      fixedDecimalScale={false}
                    />{" "}
                    {selectedCollateralToken.symbol}
                  </p>
                  {bitcoin?.price && (
                    <p className="text-sm text-slate-500">
                      ≈ $<NumericFormat
                        displayType="text"
                        value={troveData.collateral * bitcoin.price}
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Debt</p>
                  <p className="text-xl font-semibold">
                    <NumericFormat
                      displayType="text"
                      value={troveData.debt}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />{" "}
                    USDU
                  </p>
                  {usdu?.price && (
                    <p className="text-sm text-slate-500">
                      ≈ $<NumericFormat
                        displayType="text"
                        value={troveData.debt * usdu.price}
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Interest Rate</p>
                  <p className="text-lg font-medium">{currentInterestRate}% APR</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">LTV</p>
                  <p className="text-lg font-medium">
                    {ltvValue.toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Liquidation Price</p>
                  <p className="text-lg font-medium">
                    <NumericFormat
                      displayType="text"
                      value={liquidationPrice}
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Cards */}
          <div className="grid grid-cols-1 gap-4">
            {ACTION_CARDS.map((action) => {
              const Icon = action.icon;
              const isDisabled = isZombie && action.route === "rate";
              
              return (
                <Card
                  key={action.route}
                  className={`border border-slate-200 shadow-sm transition-all cursor-pointer hover:shadow-md ${
                    isDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => !isDisabled && handleActionClick(action.route)}
                >
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        action.color === 'blue' ? 'bg-blue-50' :
                        action.color === 'green' ? 'bg-green-50' :
                        'bg-red-50'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          action.color === 'blue' ? 'text-blue-600' :
                          action.color === 'green' ? 'text-green-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{action.title}</h3>
                        <p className="text-sm text-slate-600">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDisabled}
                    >
                      <ArrowLeft className="h-5 w-5 rotate-180" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Quick Info */}
        <div className="md:col-span-1">
          <Card className="border border-slate-200 shadow-sm sticky top-8">
            <CardHeader>
              <CardTitle>Position Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Total Value</p>
                  <p className="text-lg font-semibold">
                    {bitcoin?.price && (
                      <NumericFormat
                        displayType="text"
                        value={troveData.collateral * bitcoin.price}
                        prefix="$"
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Net Value</p>
                  <p className="text-lg font-semibold">
                    {bitcoin?.price && usdu?.price && (
                      <NumericFormat
                        displayType="text"
                        value={(troveData.collateral * bitcoin.price) - (troveData.debt * usdu.price)}
                        prefix="$"
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    )}
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              {/* Quick Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleActionClick("update")}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Update Position
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleActionClick("rate")}
                    disabled={isZombie}
                  >
                    <Percent className="h-4 w-4 mr-2" />
                    Change Rate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default TroveOverviewIndex;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Position Overview - USDU" },
    { name: "description", content: "Manage your USDU borrowing position" },
  ];
}