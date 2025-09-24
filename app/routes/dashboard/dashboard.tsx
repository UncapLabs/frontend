import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { useUserTroves } from "~/hooks/use-user-troves";
import { Plus, AlertCircle, RefreshCw, Info } from "lucide-react";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import BorrowCard from "~/components/dashboard/borrow-card";
import StabilityPoolCard from "~/components/dashboard/stability-pool-card";
import Stats from "~/components/dashboard/stats";

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
    (allStabilityPoolPositions.UBTC?.userDeposit ?? 0) > 0 ||
    (allStabilityPoolPositions.GBTC?.userDeposit ?? 0) > 0;

  // Separate liquidated from active/zombie positions
  const liquidatedTroves = troves.filter((t) => t.status === "liquidated");
  const activeTroves = troves.filter((t) => t.status !== "liquidated");

  const handleCreateNew = () => {
    navigate("/unanim/borrow");
  };

  const handleUpdatePosition = (troveId: string, collateralAsset: string) => {
    const collateralType = collateralAsset === "GBTC" ? "GBTC" : "UBTC";
    navigate(`/unanim/borrow/${troveId}/update?type=${collateralType}`);
  };

  const handleClosePosition = (troveId: string, collateralAsset: string) => {
    const collateralType = collateralAsset === "GBTC" ? "GBTC" : "UBTC";
    navigate(`/unanim/borrow/${troveId}/close?type=${collateralType}`);
  };

  const handleLiquidatedPosition = () => {
    navigate(`/unanim/borrow/liquidated`);
  };

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
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

      {/* Main Layout with Sticky Rates */}
      <div className="flex flex-col-reverse lg:flex-row gap-5">
        {/* Left Section: Positions */}
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
                      {failedTroves.length > 1 ? "s" : ""} failed to load due to
                      network issues. The data shown below may be incomplete.
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

              {/* Always show the placeholder card for new position */}
              <Card
                className="rounded-2xl border-2 border-dashed border-neutral-300 shadow-none bg-neutral-50/50 cursor-pointer hover:bg-neutral-100/50 hover:border-neutral-400 transition-all duration-300"
                onClick={handleCreateNew}
              >
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[320px] p-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-neutral-600" />
                    </div>
                    <span className="text-lg font-medium font-sora text-neutral-700">
                      Open position
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Liquidation Notice */}
          {liquidatedTroves.length > 0 && (
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Info className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 mb-1">
                    Liquidated Positions
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    You have {liquidatedTroves.length} position
                    {liquidatedTroves.length > 1 ? "s" : ""}
                    that {liquidatedTroves.length > 1 ? "were" : "was"}{" "}
                    liquidated. You may have collateral surplus to claim.
                  </p>
                  <Button
                    onClick={() => {
                      handleLiquidatedPosition();
                    }}
                    variant="outline"
                    size="sm"
                    className="hover:bg-slate-100"
                  >
                    View Details & Check Surplus →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stability Pool Positions Section */}
          {address && hasStabilityPoolPositions && (
            <div className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* UBTC Pool Card */}
                {allStabilityPoolPositions.UBTC &&
                  allStabilityPoolPositions.UBTC.userDeposit > 0 && (
                    <StabilityPoolCard
                      poolType="UBTC"
                      userDeposit={allStabilityPoolPositions.UBTC.userDeposit}
                      poolShare={allStabilityPoolPositions.UBTC.poolShare}
                      usduRewards={allStabilityPoolPositions.UBTC.rewards.usdu}
                      collateralRewards={
                        allStabilityPoolPositions.UBTC.rewards.collateral
                      }
                      usduPrice={usdu?.price}
                      onManagePosition={() => navigate("/unanim/earn")}
                    />
                  )}

                {/* GBTC Pool Card */}
                {allStabilityPoolPositions.GBTC &&
                  allStabilityPoolPositions.GBTC.userDeposit > 0 && (
                    <StabilityPoolCard
                      poolType="GBTC"
                      userDeposit={allStabilityPoolPositions.GBTC.userDeposit}
                      poolShare={allStabilityPoolPositions.GBTC.poolShare}
                      usduRewards={allStabilityPoolPositions.GBTC.rewards.usdu}
                      collateralRewards={
                        allStabilityPoolPositions.GBTC.rewards.collateral
                      }
                      usduPrice={usdu?.price}
                      onManagePosition={() => navigate("/unanim/earn")}
                    />
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Sticky Rates */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px]">
          <div className="lg:sticky lg:top-16">
            <Stats />
          </div>
        </div>
      </div>
    </div>
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
