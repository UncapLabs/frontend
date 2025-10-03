import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { useUserTroves } from "~/hooks/use-user-troves";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import BorrowCard from "~/components/dashboard/borrow-card";
import StabilityPoolCard from "~/components/dashboard/stability-pool-card";
import Stats from "~/components/dashboard/stats";
import LiquidationWarning from "~/components/dashboard/liquidation-warning";

export default function Dashboard() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const {
    troves,
    isLoading,
    hasActiveTroves,
    partialDataAvailable,
    failedTroves,
    refetch,
    error,
  } = useUserTroves(address);

  const { bitcoin: ubtcPrice } = useFetchPrices({
    collateralType: "UBTC",
    fetchUsdu: false,
  });
  const { bitcoin: gbtcPrice } = useFetchPrices({
    collateralType: "GBTC",
    fetchUsdu: false,
  });
  const { usdu } = useFetchPrices({ fetchBitcoin: false, fetchUsdu: true });

  // Fetch stability pool positions
  const allStabilityPoolPositions = useAllStabilityPoolPositions();

  // Check if user has any stability pool positions
  const hasStabilityPoolPositions =
    (allStabilityPoolPositions.UBTC?.userDeposit?.gt(0) ?? false) ||
    (allStabilityPoolPositions.GBTC?.userDeposit?.gt(0) ?? false) ||
    (allStabilityPoolPositions.WMWBTC?.userDeposit?.gt(0) ?? false);

  // Separate liquidated from active/zombie positions
  const liquidatedTroves = troves.filter((t) => t.status === "liquidated");
  const activeTroves = troves.filter((t) => t.status !== "liquidated");

  const handleCreateNew = () => {
    navigate("/unanim/borrow");
  };

  const handleUpdatePosition = (troveId: string, collateralAsset: string) => {
    // collateralAsset is already the CollateralType
    navigate(`/unanim/borrow/${troveId}/update?type=${collateralAsset}`);
  };

  const handleClosePosition = (troveId: string, collateralAsset: string) => {
    // collateralAsset is already the CollateralType
    navigate(`/unanim/borrow/${troveId}/close?type=${collateralAsset}`);
  };

  const handleLiquidatedPosition = () => {
    navigate(`/unanim/borrow/liquidated`);
  };

  return (
    <>
      <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 min-h-screen pb-32">
        {/* Header with title and dynamic button */}
        <div className="flex justify-between items-baseline pb-2">
          <h1 className="text-2xl md:text-3xl font-medium leading-none font-sora text-neutral-800">
            Dashboard
          </h1>

          <Button
            onClick={handleCreateNew}
            className="px-4 py-2.5 md:px-6 md:py-4 bg-[#006CFF] hover:bg-[#0056CC] rounded-xl inline-flex items-center gap-2 md:gap-2.5 transition-colors border-0 h-auto"
          >
            <span className="text-white text-xs font-medium font-sora leading-none">
              Open new position
            </span>
            <Plus className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
          </Button>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left Section: Stats */}
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px]">
            <Stats />
          </div>

          {/* Right Section: Positions */}
          <div className="flex-1 lg:flex-[2]">
            {/* Error Alert for partial data */}
            {partialDataAvailable && (
              <Alert className="mb-6 border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Some positions couldn't be loaded</strong>
                      <p className="text-sm mt-1">
                        {failedTroves.length} trove
                        {failedTroves.length > 1 ? "s" : ""} failed to load due
                        to network issues. The data shown below may be
                        incomplete.
                      </p>
                    </div>
                    <Button
                      onClick={() => refetch()}
                      variant="outline"
                      size="sm"
                      className="ml-4"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Complete failure error */}
            {error && !hasActiveTroves && !isLoading && address && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Failed to load positions</strong>
                      <p className="text-sm mt-1">
                        Unable to fetch your position data. Please try again.
                      </p>
                    </div>
                    <Button
                      onClick={() => refetch()}
                      variant="outline"
                      size="sm"
                      className="ml-4"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Position Cards */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Loading skeletons */}
                {[1, 2, 3, 4].map((i) => (
                  <BorrowCard key={i} isLoading={true} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Show active positions when wallet is connected */}
                {address &&
                  activeTroves.map((trove) => (
                    <BorrowCard
                      key={trove.id}
                      trove={trove}
                      collateralPrice={
                        trove.collateralAsset === "GBTC" ? gbtcPrice : ubtcPrice
                      }
                      onUpdatePosition={handleUpdatePosition}
                      onClosePosition={handleClosePosition}
                    />
                  ))}

                {/* Stability Pool Positions */}
                {address && (
                  <>
                    {allStabilityPoolPositions.UBTC &&
                      allStabilityPoolPositions.UBTC.userDeposit.gt(0) && (
                        <StabilityPoolCard
                          poolType="UBTC"
                          userDeposit={
                            allStabilityPoolPositions.UBTC.userDeposit
                          }
                          poolShare={allStabilityPoolPositions.UBTC.poolShare}
                          usduRewards={
                            allStabilityPoolPositions.UBTC.rewards.usdu
                          }
                          collateralRewards={
                            allStabilityPoolPositions.UBTC.rewards.collateral
                          }
                          usduPrice={usdu?.price}
                          onManagePosition={() => navigate("/unanim/earn")}
                        />
                      )}

                    {allStabilityPoolPositions.GBTC &&
                      allStabilityPoolPositions.GBTC.userDeposit.gt(0) && (
                        <StabilityPoolCard
                          poolType="GBTC"
                          userDeposit={
                            allStabilityPoolPositions.GBTC.userDeposit
                          }
                          poolShare={allStabilityPoolPositions.GBTC.poolShare}
                          usduRewards={
                            allStabilityPoolPositions.GBTC.rewards.usdu
                          }
                          collateralRewards={
                            allStabilityPoolPositions.GBTC.rewards.collateral
                          }
                          usduPrice={usdu?.price}
                          onManagePosition={() =>
                            navigate("/unanim/earn?collateral=GBTC")
                          }
                        />
                      )}

                    {allStabilityPoolPositions.WMWBTC &&
                      allStabilityPoolPositions.WMWBTC.userDeposit.gt(0) && (
                        <StabilityPoolCard
                          poolType="WMWBTC"
                          userDeposit={
                            allStabilityPoolPositions.WMWBTC.userDeposit
                          }
                          poolShare={allStabilityPoolPositions.WMWBTC.poolShare}
                          usduRewards={
                            allStabilityPoolPositions.WMWBTC.rewards.usdu
                          }
                          collateralRewards={
                            allStabilityPoolPositions.WMWBTC.rewards.collateral
                          }
                          usduPrice={usdu?.price}
                          onManagePosition={() =>
                            navigate("/unanim/earn?collateral=WMWBTC")
                          }
                        />
                      )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <LiquidationWarning
        liquidatedCount={liquidatedTroves.length}
        onViewDetails={handleLiquidatedPosition}
      />
    </>
  );
}

export function meta() {
  return [
    { title: "Dashboard - Uncap" },
    {
      name: "description",
      content: "Manage your USDU borrowing and stability pool positions",
    },
  ];
}
