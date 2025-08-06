import { Card, CardContent } from "~/components/ui/card";
import { Edit3, XCircle, AlertTriangle } from "lucide-react";
import type { Route } from "./+types/borrow.$troveId._index";
import { useParams, useNavigate } from "react-router";
import { UBTC_TOKEN, GBTC_TOKEN } from "~/lib/contracts/constants";
import { useQueryState } from "nuqs";
import { useTroveOverview } from "~/hooks/use-trove-overview";
import { TroveLoadingState } from "~/components/borrow/loading-state";
import { ErrorState } from "~/components/borrow/error-state";
import { PositionMetricsCard } from "~/components/borrow/position-metrics-card";
import { ActionCard } from "~/components/borrow/action-card";
import { PositionSummaryCard } from "~/components/borrow/position-summary-card";

const ACTION_CARDS = [
  {
    title: "Update Position",
    description: "Adjust your collateral, debt, and interest rate",
    icon: Edit3,
    route: "update",
    color: "blue",
  },
  {
    title: "Close Position",
    description: "Repay debt and withdraw collateral",
    icon: XCircle,
    route: "close",
    color: "red",
  },
] as const;

function TroveOverviewIndex() {
  const { troveId } = useParams();
  const navigate = useNavigate();

  // Get collateral type from URL or default to UBTC
  const [troveCollateralType] = useQueryState("type", {
    defaultValue: "UBTC",
  });

  // Use the new hook for all trove data and metrics
  const { position, isLoading, bitcoin, usdu, metrics } = useTroveOverview(troveId);

  // Get the collateral token based on position data or URL param
  const selectedCollateralToken = position?.collateralAsset === "GBTC" ? GBTC_TOKEN : UBTC_TOKEN;

  const handleActionClick = (route: string) => {
    navigate(`/borrow/${troveId}/${route}?type=${troveCollateralType}`);
  };

  // Check for special states
  const isZombie = false; // TODO: Get from trove status
  const isRedeemed = false; // TODO: Get from trove status

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        <TroveLoadingState />
      </div>
    );
  }

  if (!position || !metrics) {
    return (
      <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        <ErrorState 
          title="Position not found"
          description="We couldn't find the position you're looking for. It may have been closed or doesn't exist."
        />
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
          <PositionMetricsCard
            collateral={position.collateralAmount}
            debt={position.borrowedAmount}
            collateralToken={selectedCollateralToken}
            bitcoinPrice={bitcoin?.price}
            usduPrice={usdu?.price}
            interestRate={metrics.currentInterestRate}
            ltvValue={metrics.ltvValue}
            liquidationPrice={metrics.liquidationPrice}
          />

          {/* Action Cards */}
          <div className="grid grid-cols-1 gap-4">
            {ACTION_CARDS.map((action) => (
              <ActionCard
                key={action.route}
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                onClick={() => handleActionClick(action.route)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Quick Info */}
        <div className="md:col-span-1">
          <PositionSummaryCard
            totalValue={metrics.totalValue}
            netValue={metrics.netValue}
            onUpdatePosition={() => handleActionClick("update")}
            onChangeRate={() => handleActionClick("update")}
            isZombie={isZombie}
            liquidationPrice={metrics.liquidationPrice}
            ltvValue={metrics.ltvValue}
            collateralRatio={metrics.collateralizationRatio}
            interestRate={metrics.currentInterestRate}
          />
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