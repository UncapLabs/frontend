import { Button } from "~/components/ui/button";
import {
  Alert,
  AlertIcon,
  AlertDescription,
  AlertContent,
} from "~/components/ui/alert";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { useUserTroves } from "~/hooks/use-user-troves";
import { Plus, AlertCircle } from "lucide-react";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import BorrowCard from "~/components/dashboard/borrow-card";
import StabilityPoolCard from "~/components/dashboard/stability-pool-card";
import Stats from "~/components/dashboard/stats";
import LiquidationWarning from "~/components/dashboard/liquidation-warning";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useQueryState } from "nuqs";

type FilterType = "all" | "borrow" | "earn";

export default function Dashboard() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [filter, setFilter] = useQueryState("filter", {
    defaultValue: "all" as FilterType,
  });
  const {
    troves,
    isLoading,
    hasActiveTroves,
    partialDataAvailable,
    failedTroves,
    refetch,
    error,
  } = useUserTroves(address);

  const allStabilityPoolPositions = useAllStabilityPoolPositions();

  const { bitcoin: ubtcPrice } = useFetchPrices({
    collateralType: "UBTC",
    fetchUsdu: false,
  });
  const { bitcoin: gbtcPrice } = useFetchPrices({
    collateralType: "GBTC",
    fetchUsdu: false,
  });
  const { usdu } = useFetchPrices({ fetchBitcoin: false, fetchUsdu: true });

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
      <div className="w-full mx-auto max-w-7xl py-8 lg:py-8 px-4 sm:px-6 lg:px-8 min-h-screen pb-32">
        <div className="flex justify-between pb-4 items-baseline-last">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
            Dashboard
          </h1>

          <div className="hidden lg:flex items-end gap-1.5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium font-sora leading-none text-[#AAA28E] tracking-tight uppercase pl-2.5">
                Filter by
              </p>
              <Select
                value={filter}
                onValueChange={(value) => setFilter(value as FilterType)}
              >
                <SelectTrigger className="w-56 px-6 py-4 bg-white border-0 rounded-xl font-sora text-xs font-medium text-[#242424] hover:bg-neutral-50 transition-colors !h-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All positions</SelectItem>
                  <SelectItem value="borrow">Borrow positions</SelectItem>
                  <SelectItem value="earn">Earn positions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateNew}
              className="px-6 py-4 bg-[#006CFF] hover:bg-[#0056CC] rounded-xl inline-flex items-center gap-5 transition-colors border-0 h-auto"
            >
              <span className="text-white text-xs font-medium font-sora leading-none">
                Open new position
              </span>
              <Plus className="h-2 w-2 text-white" />
            </Button>
          </div>
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
              <Alert variant="warning" className="mb-6">
                <AlertIcon variant="warning">
                  <svg
                    className="w-4 h-3"
                    viewBox="0 0 16 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.20549 10.8855L0.820557 5.49933L2.61511 3.70478L6.20549 7.29389L13.3837 0.114401L15.1795 1.91022L6.20549 10.8855Z"
                      fill="#FF9300"
                    />
                  </svg>
                </AlertIcon>
                <AlertContent>
                  <AlertDescription>
                    <strong>Some positions couldn't be loaded</strong>
                    <p>
                      {failedTroves.length} trove
                      {failedTroves.length > 1 ? "s" : ""} failed to load due to
                      network issues. The data shown below may be incomplete.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 border-b border-[#FF9300] pb-2 text-[#FF9300] text-xs font-medium font-sora leading-tight hover:opacity-80 transition-opacity"
                      >
                        Retry
                        <svg
                          width="9"
                          height="7"
                          viewBox="0 0 9 7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.74364e-05 4.27055L5.75291e-05 3.20992L6.80296 3.20992L5.08314 1.4901L5.83354 0.740233L8.83301 3.74023L5.83354 6.74023L5.08314 5.99037L6.80296 4.27055L5.74364e-05 4.27055Z"
                            fill="#FF9300"
                          />
                        </svg>
                      </button>
                    </div>
                  </AlertDescription>
                </AlertContent>
              </Alert>
            )}

            {/* Complete failure error */}
            {error && !hasActiveTroves && !isLoading && address && (
              <Alert variant="destructive" className="mb-6">
                <AlertIcon variant="destructive">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </AlertIcon>
                <AlertContent>
                  <AlertDescription>
                    <strong>Failed to load positions</strong>
                    <p>Unable to fetch your position data. Please try again.</p>
                    <div className="mt-4">
                      <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 border-b border-[#FF9300] pb-2 text-[#FF9300] text-xs font-medium font-sora leading-tight hover:opacity-80 transition-opacity"
                      >
                        Retry
                        <svg
                          width="9"
                          height="7"
                          viewBox="0 0 9 7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.74364e-05 4.27055L5.75291e-05 3.20992L6.80296 3.20992L5.08314 1.4901L5.83354 0.740233L8.83301 3.74023L5.83354 6.74023L5.08314 5.99037L6.80296 4.27055L5.74364e-05 4.27055Z"
                            fill="#FF9300"
                          />
                        </svg>
                      </button>
                    </div>
                  </AlertDescription>
                </AlertContent>
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
                  filter !== "earn" &&
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
                {address && filter !== "borrow" && (
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
