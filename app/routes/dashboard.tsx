import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { useUserTroves } from "~/hooks/use-user-troves";
import { useBitcoinPrice } from "~/hooks/use-bitcoin-price";
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
} from "lucide-react";

function MyTroves() {
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
  const { price: bitcoinPrice } = useBitcoinPrice();

  const handleCreateNew = () => {
    navigate("/");
  };

  const handleUpdatePosition = (troveId: string, collateralAsset: string) => {
    const collateralType = collateralAsset === "GBTC" ? "GBTC" : "UBTC";
    navigate(`/borrow/${troveId}/update?type=${collateralType}`);
  };

  const handleClosePosition = (troveId: string, collateralAsset: string) => {
    const collateralType = collateralAsset === "GBTC" ? "GBTC" : "UBTC";
    navigate(`/borrow/${troveId}/close?type=${collateralType}`);
  };

  return (
    <div className="w-full mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            My Positions
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
              No Active Positions
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
          {troves.map((trove) => (
            <Card
              key={trove.id}
              className="border border-slate-200 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  Position #{truncateTroveId(trove.id)}
                </CardTitle>
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
                    {bitcoinPrice ? (
                      <>
                        $
                        <NumericFormat
                          displayType="text"
                          value={trove.collateralAmount * (bitcoinPrice || 0)}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />
                      </>
                    ) : (
                      "Loading..."
                    )}
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

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() =>
                      handleUpdatePosition(trove.id, trove.collateralAsset)
                    }
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-red-50 hover:border-red-300"
                    onClick={() =>
                      handleClosePosition(trove.id, trove.collateralAsset)
                    }
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
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
    { title: "My Positions - Uncap" },
    { name: "description", content: "Manage your USDU borrowing positions" },
  ];
}
