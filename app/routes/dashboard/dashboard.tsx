import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { useUserTroves } from "~/hooks/use-user-troves";
import { NumericFormat } from "react-number-format";
import {
  Plus,
  DollarSign,
  Percent,
  AlertCircle,
  RefreshCw,
  Edit3,
  X,
  Info,
} from "lucide-react";
import { UBTC_TOKEN, GBTC_TOKEN } from "~/lib/contracts/constants";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import BorrowCard from "~/components/dashboard/borrow-card";

export default function Dashboard() {
  const navigate = useNavigate();
  const { address, status } = useAccount();
  const {
    troves,
    isLoading,
    hasActiveTroves,
    partialDataAvailable,
    failedTroves,
    refetch,
    error,
    isRefetching,
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
  const hasNonLiquidatedTroves = activeTroves.length > 0;

  const handleCreateNew = () => {
    navigate("/unanim/borrow");
  };

  const handleEarn = () => {
    navigate("/unanim/earn");
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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium font-sora text-neutral-800 leading-tight">
            Dashboard
          </h1>
          {isRefetching && (
            <div className="flex items-center text-sm text-slate-800">
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Borrow Positions Section */}
      <div className="py-4">
        {address && (
          <>
            <div className="flex justify-between items-center pb-4">
              <h2 className="text-2xl md:text-3xl font-medium leading-none font-sora text-neutral-800">
                Borrow Positions
              </h2>

              <Button
                onClick={handleCreateNew}
                className="px-4 py-2.5 md:px-6 md:py-3.5 bg-[#006CFF] hover:bg-[#0056CC] rounded-xl inline-flex items-center gap-2 md:gap-2.5 transition-colors border-0 h-auto"
              >
                <span className="text-white text-xs font-medium font-sora">
                  Open new trove
                </span>
                <Plus className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
              </Button>
            </div>
          </>
        )}

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
        {error && !hasActiveTroves && !isLoading && (
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

        {/* Main content area */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Loading skeletons */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BorrowCard key={i} isLoading={true} />
            ))}
          </div>
        ) : !address ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-slate-600 mb-4">
              Connect your wallet to view your positions
            </p>
          </div>
        ) : !hasNonLiquidatedTroves && !error ? (
          <>
            <Card className="bg-white rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-slate-100 p-4 mb-4">
                  <DollarSign className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Active Borrow Positions
                </h3>
                <p className="text-slate-600 text-center mb-6 max-w-md">
                  You don't have any active borrowing positions yet. Create your
                  first trove to start borrowing USDU against your Bitcoin
                  collateral.
                </p>
                <Button
                  onClick={handleCreateNew}
                  className="px-4 py-2.5 md:px-6 md:py-3.5 bg-[#006CFF] hover:bg-[#0056CC] rounded-xl inline-flex items-center gap-2 md:gap-2.5 transition-colors border-0 h-auto"
                >
                  <span className="text-white text-[10px] md:text-xs font-medium font-sora">
                    Open your first trove
                  </span>
                  <Plus className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeTroves.map((trove) => (
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
            </div>
          </>
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
      </div>

      <div>
        {/* Stability Pool Positions Section */}
        {address && hasStabilityPoolPositions && (
          <>
            <div className="flex justify-between items-center pb-4">
              <h2 className="text-2xl md:text-3xl font-medium leading-none font-sora text-neutral-800">
                Stability Pool Positions
              </h2>

              <Button
                onClick={handleEarn}
                className="px-4 py-2.5 md:px-6 md:py-3.5 bg-[#006CFF] hover:bg-[#0056CC] rounded-xl inline-flex items-center gap-2 md:gap-2.5 transition-colors border-0 h-auto"
              >
                <span className="text-white text-xs font-medium font-sora">
                  Earn rewards
                </span>
                <Plus className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* UBTC Pool Card */}
              {allStabilityPoolPositions.UBTC &&
                allStabilityPoolPositions.UBTC.userDeposit > 0 && (
                  <Card className="border border-slate-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <img
                            src={UBTC_TOKEN.icon}
                            alt="UBTC"
                            className="w-5 h-5"
                          />
                          UBTC Stability Pool
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Deposited Amount */}
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-600">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Your Deposit
                        </div>
                        <div className="font-semibold">
                          <NumericFormat
                            displayType="text"
                            value={allStabilityPoolPositions.UBTC.userDeposit}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          USDU
                        </div>
                        {usdu?.price && (
                          <div className="text-sm text-slate-600">
                            $
                            <NumericFormat
                              displayType="text"
                              value={
                                allStabilityPoolPositions.UBTC.userDeposit *
                                usdu.price
                              }
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />
                          </div>
                        )}
                      </div>

                      {/* Pool Share */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-slate-600">
                            <Percent className="h-3 w-3 mr-1" />
                            Pool Share
                          </div>
                          <div className="text-sm font-medium">
                            <NumericFormat
                              displayType="text"
                              value={allStabilityPoolPositions.UBTC.poolShare}
                              decimalScale={3}
                              suffix="%"
                            />
                          </div>
                        </div>

                        {/* Rewards */}
                        <div className="space-y-1">
                          <div className="text-xs text-slate-600">
                            Claimable Rewards
                          </div>
                          <div className="text-sm font-medium">
                            <div>
                              {allStabilityPoolPositions.UBTC.rewards.usdu.toFixed(
                                2
                              )}{" "}
                              USDU
                            </div>
                            <div className="text-slate-500">
                              {allStabilityPoolPositions.UBTC.rewards.collateral.toFixed(
                                6
                              )}{" "}
                              UBTC
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          className="w-full hover:bg-blue-50 hover:border-blue-300"
                          onClick={() => navigate("/unanim/earn")}
                          size="sm"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Manage Position
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* GBTC Pool Card */}
              {allStabilityPoolPositions.GBTC &&
                allStabilityPoolPositions.GBTC.userDeposit > 0 && (
                  <Card className="border border-slate-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <img
                            src={GBTC_TOKEN.icon}
                            alt="GBTC"
                            className="w-5 h-5"
                          />
                          GBTC Stability Pool
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Deposited Amount */}
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-600">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Your Deposit
                        </div>
                        <div className="font-semibold">
                          <NumericFormat
                            displayType="text"
                            value={allStabilityPoolPositions.GBTC.userDeposit}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          USDU
                        </div>
                        {usdu?.price && (
                          <div className="text-sm text-slate-600">
                            $
                            <NumericFormat
                              displayType="text"
                              value={
                                allStabilityPoolPositions.GBTC.userDeposit *
                                usdu.price
                              }
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />
                          </div>
                        )}
                      </div>

                      {/* Pool Share */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-slate-600">
                            <Percent className="h-3 w-3 mr-1" />
                            Pool Share
                          </div>
                          <div className="text-sm font-medium">
                            <NumericFormat
                              displayType="text"
                              value={allStabilityPoolPositions.GBTC.poolShare}
                              decimalScale={3}
                              suffix="%"
                            />
                          </div>
                        </div>

                        {/* Rewards */}
                        <div className="space-y-1">
                          <div className="text-xs text-slate-600">
                            Claimable Rewards
                          </div>
                          <div className="text-sm font-medium">
                            <div>
                              {allStabilityPoolPositions.GBTC.rewards.usdu.toFixed(
                                2
                              )}{" "}
                              USDU
                            </div>
                            <div className="text-slate-500">
                              {allStabilityPoolPositions.GBTC.rewards.collateral.toFixed(
                                6
                              )}{" "}
                              GBTC
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          className="w-full hover:bg-blue-50 hover:border-blue-300"
                          onClick={() => navigate("/unanim/earn")}
                          size="sm"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Manage Position
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function meta() {
  return [
    { title: "My Positions - Uncap" },
    {
      name: "description",
      content: "Manage your USDU borrowing and stability pool positions",
    },
  ];
}
