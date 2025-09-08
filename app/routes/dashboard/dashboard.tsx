import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { useUserTroves } from "~/hooks/use-user-troves";
import { NumericFormat } from "react-number-format";
import { truncateTroveId } from "~/lib/utils/trove-id";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertCircle,
  RefreshCw,
  Edit3,
  XCircle,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { useLiquidate } from "~/hooks/use-liquidate";
import {
  MIN_DEBT,
  type CollateralType,
  USDU_TOKEN,
  UBTC_TOKEN,
  GBTC_TOKEN,
} from "~/lib/contracts/constants";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useFetchPrices } from "~/hooks/use-fetch-prices";

// Liquidate button component
function LiquidateButton({
  troveId,
  collateralType,
}: {
  troveId: string;
  collateralType: CollateralType;
}) {
  const { liquidate, isPending } = useLiquidate({ troveId, collateralType });

  return (
    <Button
      variant="outline"
      className="flex-1 hover:bg-yellow-50 hover:border-yellow-300"
      onClick={liquidate}
      disabled={isPending}
      size="sm"
    >
      <Zap className="h-3 w-3 mr-1" />
      {isPending ? "..." : "Liquidate"}
    </Button>
  );
}

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
    isRefetching,
  } = useUserTroves(address);
  // Fetch prices for both collateral types
  const { bitcoin: ubtcPrice } = useFetchPrices({ 
    collateralType: "UBTC", 
    fetchUsdu: false 
  });
  const { bitcoin: gbtcPrice } = useFetchPrices({ 
    collateralType: "GBTC", 
    fetchUsdu: false 
  });

  // Fetch stability pool positions
  const allStabilityPoolPositions = useAllStabilityPoolPositions();
  const { usdu } = useFetchPrices({ fetchBitcoin: false, fetchUsdu: true });

  // Check if user has any stability pool positions
  const hasStabilityPoolPositions =
    allStabilityPoolPositions.UBTC.userDeposit > 0 ||
    allStabilityPoolPositions.GBTC.userDeposit > 0;

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

  const handleLiquidatedPosition = (troveId: string) => {
    navigate(`/unanim/borrow/${troveId}/liquidated`);
  };

  return (
    <div className="w-full mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            My Borrow Positions
          </h1>
          {isRefetching && (
            <div className="flex items-center text-sm text-slate-500">
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              Refreshing...
            </div>
          )}
        </div>
        {address && (
          <Button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Open New Trove
          </Button>
        )}
      </div>
      <Separator className="mb-8 bg-slate-200" />

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
            <Card key={i} className="border border-slate-200">
              <CardHeader className="pb-4">
                <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Collateral section */}
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-slate-200 rounded animate-pulse mr-1" />
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                </div>

                {/* Debt section */}
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-slate-200 rounded animate-pulse mr-1" />
                    <div className="h-3 w-10 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-slate-200 rounded animate-pulse mr-1" />
                      <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <div className="h-9 flex-1 bg-slate-200 rounded-md animate-pulse" />
                  <div className="h-9 flex-1 bg-slate-200 rounded-md animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !address ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-slate-600 mb-4">
            Connect your wallet to view your positions
          </p>
        </div>
      ) : !hasActiveTroves && !error ? (
        <Card className="border border-slate-200">
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
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Open Your First Trove
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {troves.map((trove) => {
            const isLiquidated = trove.status === "liquidated";
            // Zombie = redeemed trove with debt < MIN_DEBT
            const isZombie =
              trove.status === "redeemed" && trove.borrowedAmount < MIN_DEBT;
            const isFullyRedeemed =
              trove.status === "redeemed" && trove.borrowedAmount === 0;

            return (
              <Card
                key={trove.id}
                className={`border transition-all duration-300 ${
                  isLiquidated
                    ? "border-orange-300 bg-orange-50/50 cursor-pointer hover:bg-orange-100/50"
                    : isZombie || isFullyRedeemed
                    ? "border-amber-300 bg-amber-50/50"
                    : "border-slate-200 hover:shadow-lg"
                }`}
                onClick={
                  isLiquidated
                    ? () => handleLiquidatedPosition(trove.id)
                    : undefined
                }
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Position #{truncateTroveId(trove.id)}
                    </CardTitle>
                    {isLiquidated && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Liquidated
                      </div>
                    )}
                    {(isZombie || isFullyRedeemed) && (
                      <div className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium">
                        🧟 Zombie
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Show different content based on liquidation status */}
                  {isLiquidated ? (
                    <>
                      {/* Simplified info for liquidated positions */}
                      <div className="py-8 text-center space-y-4">
                        <div className="inline-flex p-3 bg-orange-100 rounded-full">
                          <AlertTriangle className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-orange-800">
                            Position Liquidated
                          </p>
                          <p className="text-xs text-orange-700">
                            Was holding {trove.collateralAsset}
                          </p>
                        </div>
                        <div className="bg-orange-100 rounded-lg p-3 text-sm text-orange-800">
                          <p className="font-medium mb-1">
                            Click to check for collateral surplus
                          </p>
                          <p className="text-xs opacity-75">
                            You may have funds to claim
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
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
                          {(() => {
                            const price =
                              trove.collateralAsset === "GBTC"
                                ? gbtcPrice?.price
                                : ubtcPrice?.price;
                            return price ? (
                              <>
                                $
                                <NumericFormat
                                  displayType="text"
                                  value={trove.collateralAmount * price}
                                  thousandSeparator=","
                                  decimalScale={2}
                                  fixedDecimalScale
                                />
                              </>
                            ) : (
                              "Loading..."
                            );
                          })()}
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

                      {/* Zombie-specific warning */}
                      {isZombie && !isFullyRedeemed && (
                        <div className="bg-amber-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-amber-800 mb-2">
                            ⚠️ Position Below Minimum Debt
                          </p>
                          <div className="space-y-1 text-xs text-amber-700">
                            <div>
                              Current debt: {trove.borrowedAmount.toFixed(2)}{" "}
                              USDU
                            </div>
                            <div>Minimum required: {MIN_DEBT} USDU</div>
                            <div className="font-medium pt-1">
                              Must borrow{" "}
                              {(MIN_DEBT - trove.borrowedAmount).toFixed(2)}{" "}
                              USDU to restore
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Fully redeemed (zombie with 0 debt) info */}
                      {isFullyRedeemed && (
                        <div className="bg-amber-100 rounded-lg p-3">
                          <p className="text-sm font-medium text-amber-800">
                            Position fully redeemed - no debt remaining
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            You can only close this position to withdraw
                            collateral.
                          </p>
                        </div>
                      )}

                      {/* Action buttons - same for all non-liquidated troves */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                          onClick={() =>
                            handleUpdatePosition(
                              trove.id,
                              trove.collateralAsset
                            )
                          }
                          size="sm"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 hover:bg-red-50 hover:border-red-300"
                          onClick={() =>
                            handleClosePosition(trove.id, trove.collateralAsset)
                          }
                          size="sm"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Close
                        </Button>
                        {/* <LiquidateButton
                          troveId={trove.id}
                          collateralType={
                            trove.collateralAsset as CollateralType
                          }
                        /> */}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stability Pool Positions Section */}
      {address && hasStabilityPoolPositions && (
        <>
          <div className="flex justify-between items-baseline mt-12">
            <h2 className="text-2xl font-bold mb-2 text-slate-800">
              Stability Pool Positions
            </h2>
          </div>
          <Separator className="mb-6 bg-slate-200" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UBTC Pool Card */}
            {allStabilityPoolPositions.UBTC.userDeposit > 0 && (
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
            {allStabilityPoolPositions.GBTC.userDeposit > 0 && (
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
