import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import { useUserTroves } from "~/hooks/use-user-troves";
import { NumericFormat } from "react-number-format";
import { truncateTroveId } from "~/lib/utils/trove-id";
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
import { MIN_DEBT, UBTC_TOKEN, GBTC_TOKEN } from "~/lib/contracts/constants";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useFetchPrices } from "~/hooks/use-fetch-prices";

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

      <div className="py-4">
        {/* Borrow Positions Section */}
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
              <Card
                key={i}
                className="rounded-2xl border-0 shadow-none bg-white"
              >
                <CardHeader
                  className="border-b border-[#F5F3EE]"
                  style={{ paddingBottom: "0.75rem" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Status Badge skeleton */}
                      <div className="h-8 w-20 bg-slate-200 rounded-lg animate-pulse" />
                      {/* Position ID skeleton */}
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                    </div>
                    {/* Action buttons skeleton */}
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
                      <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <div className="flex flex-col flex-1">
                    {/* Header with Collateral Value and Rate */}
                    <div className="flex justify-between items-center mb-4 lg:mb-8">
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="flex items-center gap-2 px-2 py-2 rounded-md border border-[#F5F3EE]">
                        <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
                        <div className="h-3 w-px bg-[#F5F3EE]" />
                        <div className="h-3 w-4 bg-slate-200 rounded animate-pulse" />
                      </div>
                    </div>

                    {/* Collateral Amount Values */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div>
                        <div className="flex items-baseline gap-3">
                          {/* Large amount */}
                          <div className="h-9 w-32 bg-slate-200 rounded animate-pulse" />
                        </div>
                        {/* USD value */}
                        <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mt-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-[#F5F3EE]">
                  <div className="w-full grid grid-cols-2 relative -my-6">
                    {/* Divider */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-[#F5F3EE]" />

                    {/* Debt section */}
                    <div className="pr-4 py-6">
                      <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-2" />
                      <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
                    </div>

                    {/* Liquidation Price section */}
                    <div className="pl-6 py-6">
                      <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-2" />
                      <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                </CardFooter>
              </Card>
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
              {activeTroves.map((trove) => {
                // Zombie = redeemed trove with debt < MIN_DEBT
                const isZombie =
                  trove.status === "redeemed" &&
                  trove.borrowedAmount < MIN_DEBT;
                const isFullyRedeemed =
                  trove.status === "redeemed" && trove.borrowedAmount === 0;

                return (
                  <Card
                    key={trove.id}
                    className={`rounded-2xl border-0 shadow-none transition-all duration-300 gap-4 ${
                      isZombie || isFullyRedeemed ? "bg-blue-800" : "bg-white"
                    }`}
                  >
                    <CardHeader
                      className="border-b border-[#F5F3EE]"
                      style={{ paddingBottom: "0.75rem" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Status Badge */}
                          {isZombie || isFullyRedeemed ? (
                            <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-800 border border-white/20 rounded-lg text-xs font-medium font-sora text-white leading-tight">
                              <svg
                                width="12"
                                height="11"
                                viewBox="0 0 12 11"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M5.15332 0.511841C6.28241 0.457884 7.53193 0.597008 8.61816 0.865356C8.72856 0.892643 8.85095 0.963428 8.96973 1.05579C9.09054 1.14974 9.2161 1.27229 9.33301 1.41223C9.56535 1.69043 9.77364 2.04971 9.83887 2.40833C9.84402 2.43405 9.84375 2.45809 9.84375 2.46887V5.26965C9.90085 5.26048 9.95938 5.25505 10.0195 5.255C10.701 5.255 11.2529 5.82395 11.2529 6.51575C11.2527 7.20724 10.7024 7.77649 10.0195 7.77649C9.95965 7.77644 9.90093 7.77 9.84375 7.76086V8.19446C9.84348 9.12779 9.27875 9.93155 8.47461 10.2863L8.46875 10.2892L8.46387 10.2902C8.16523 10.3885 7.64681 10.4321 7.2168 10.4523C6.99907 10.4625 6.79872 10.4671 6.65332 10.4689C6.58082 10.4698 6.5215 10.4698 6.48047 10.4698H6.41602L6.39551 10.4689C5.28545 10.5324 4.51428 10.4901 4.01758 10.4298C3.76731 10.3994 3.58591 10.3645 3.4668 10.337C3.40777 10.3234 3.36372 10.3115 3.33398 10.3029C3.31907 10.2985 3.30669 10.2956 3.29883 10.2931C3.29514 10.2919 3.29218 10.2899 3.29004 10.2892C3.28905 10.2888 3.28772 10.2884 3.28711 10.2882H3.28613L3.27832 10.2853C2.47371 9.93202 1.90928 9.1275 1.90918 8.1925V7.75891C1.85189 7.76813 1.79278 7.77452 1.73242 7.77454C1.05121 7.77429 0.500095 7.20536 0.5 6.51379C0.50011 5.82234 1.04965 5.25329 1.73242 5.25305C1.77349 5.25306 1.81474 5.2562 1.85449 5.26086C1.82528 5.07248 1.79117 4.85216 1.76465 4.65051C1.74753 4.5203 1.73297 4.39659 1.72363 4.29407C1.7146 4.19482 1.70973 4.10586 1.71484 4.04993L1.75684 3.64075C1.85611 2.74061 1.97049 2.20269 2.07617 1.87512C2.13666 1.68773 2.19452 1.56544 2.24805 1.48254C2.30319 1.39714 2.35095 1.3563 2.38086 1.33118C3.0015 0.810821 4.0295 0.565574 5.15332 0.511841ZM2.5752 5.71399V8.1925C2.57533 9.08485 3.3023 9.80966 4.19434 9.80969H4.46973L4.46777 9.81067H7.55762C8.45066 9.81039 9.17542 9.08511 9.17578 8.19446V5.79114L7.73145 4.25012L6.82031 4.93176C6.69822 5.02248 6.52913 5.02048 6.40918 4.92297L5.43945 4.13391L4.80762 4.34094C4.69297 4.37835 4.56544 4.35261 4.47559 4.2677L4.14941 3.96301L2.5752 5.71399ZM4.46191 7.8429L7.69043 8.45813C7.87106 8.49155 7.99252 8.66754 7.95703 8.84875L7.93945 8.94055H7.92188C7.86514 9.04901 7.7535 9.12014 7.62793 9.12024C7.60603 9.12022 7.58501 9.11751 7.56445 9.1134L4.33594 8.49719C4.15535 8.46369 4.03475 8.28875 4.07031 8.10754C4.10574 7.92835 4.28041 7.80734 4.46191 7.8429ZM4.50879 4.71204C4.60847 4.55725 4.81531 4.51282 4.96973 4.61243C5.12475 4.71215 5.17155 4.9189 5.07129 5.07336L4.81836 5.46204L5.06836 5.63586C5.15657 5.6968 5.18933 5.79472 5.19238 5.88098C5.19509 5.95865 5.17263 6.03913 5.13184 6.10657L5.13867 6.1134L5.10742 6.14368H5.10645C5.07807 6.18018 5.04514 6.20956 5 6.22571C4.95516 6.24163 4.90846 6.24231 4.87695 6.24231C4.82693 6.24228 4.77648 6.23045 4.73047 6.20813L4.68652 6.18176L4.45508 6.02161L4.3877 6.12512L4.55469 6.23352C4.70851 6.33382 4.75299 6.54035 4.65332 6.69543L4.65234 6.69641C4.58804 6.79374 4.48165 6.84763 4.37305 6.84778C4.30981 6.84776 4.24749 6.82893 4.19238 6.79504L4.19043 6.79407L4.02539 6.68762L3.75488 7.10754L3.75391 7.10852C3.69035 7.20439 3.58467 7.25984 3.47461 7.25989C3.41164 7.25989 3.34885 7.24226 3.29395 7.20715C3.13852 7.10732 3.09342 6.89985 3.19434 6.74524L3.46582 6.32434L3.29199 6.21204C3.13839 6.11162 3.09461 5.90413 3.19434 5.74915C3.28224 5.61516 3.45118 5.56433 3.5957 5.62024L3.65625 5.65149L3.82812 5.76282L3.90723 5.64172L3.67871 5.48352C3.52705 5.37866 3.48961 5.16926 3.59668 5.0177C3.70265 4.86806 3.90944 4.82866 4.06152 4.93567L4.26953 5.08118L4.50879 4.71204ZM1.73242 5.91907C1.42614 5.91932 1.16797 6.18173 1.16797 6.51282C1.16821 6.84368 1.42629 7.10437 1.73242 7.10461C1.79332 7.10458 1.85272 7.09502 1.90918 7.07532V5.94836C1.85247 5.92871 1.79228 5.9191 1.73242 5.91907ZM10.0195 5.91907C9.95893 5.91914 9.89995 5.9288 9.84375 5.94836V7.07532C9.90039 7.09498 9.95974 7.10453 10.0195 7.10461C10.3259 7.10461 10.5847 6.84384 10.585 6.51282C10.585 6.18157 10.326 5.91907 10.0195 5.91907ZM7.61621 5.22375C8.10568 5.22392 8.49805 5.63077 8.49805 6.12512C8.49786 6.61932 8.10556 7.02535 7.61621 7.02551C7.12681 7.02541 6.73358 6.61936 6.7334 6.12512C6.7334 5.63073 7.12669 5.22386 7.61621 5.22375ZM7.61621 5.89172C7.50424 5.89183 7.40137 5.99015 7.40137 6.12512C7.40154 6.25992 7.50434 6.35841 7.61621 6.35852C7.72774 6.35834 7.83088 6.25873 7.83105 6.12512C7.83105 5.99019 7.72814 5.8919 7.61621 5.89172ZM5.08691 1.18274C4.06612 1.24555 3.24648 1.47541 2.81055 1.84094C2.8138 1.83819 2.80786 1.84354 2.79492 1.86633C2.7831 1.88726 2.76865 1.91844 2.75195 1.96106C2.71825 2.04719 2.67807 2.17559 2.63574 2.35559C2.55105 2.71581 2.45871 3.27692 2.38086 4.11047L2.37891 4.11926C2.37896 4.13558 2.38034 4.16741 2.38477 4.21594C2.39008 4.27416 2.39902 4.34954 2.41016 4.43762C2.42481 4.55353 2.44531 4.69073 2.4668 4.83801L3.88184 3.26379C3.94175 3.19737 4.02638 3.15788 4.11523 3.15344C4.1834 3.15012 4.24901 3.1684 4.30469 3.20227L4.35645 3.24133L4.3584 3.24231L4.78809 3.64465L5.40625 3.44153C5.48789 3.41492 5.57593 3.42079 5.65137 3.4552L5.72266 3.49915V3.50012L6.63086 4.24036L7.57324 3.53625C7.63228 3.49258 7.7022 3.46995 7.77344 3.46985C7.86261 3.46985 7.95237 3.50583 8.01855 3.57629L9.17773 4.81458V2.5011C9.12868 2.27217 8.98061 2.03116 8.81934 1.83801C8.73861 1.74136 8.657 1.65939 8.58789 1.60071C8.55342 1.57147 8.52257 1.54906 8.49805 1.53333C8.48609 1.52566 8.47635 1.51949 8.46875 1.51575C8.46143 1.51218 8.45704 1.51088 8.45703 1.51086C7.29433 1.22474 6.10165 1.12032 5.08691 1.18274Z"
                                  fill="white"
                                />
                              </svg>
                              Zombie
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#F5F3EE] rounded-lg text-xs font-medium font-sora text-neutral-800 leading-tight">
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 11 11"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.4873 5.49974C10.4873 8.13695 8.44782 10.2969 5.86334 10.4863C5.74111 10.4955 5.61811 10.5001 5.49358 10.5001C5.36904 10.5001 5.24528 10.4955 5.12305 10.4863V8.15619C4.8463 8.12617 4.60184 8.06305 4.39121 7.96606C4.08987 7.8275 3.86078 7.63044 3.7055 7.37411C3.54945 7.11855 3.47181 6.81526 3.47181 6.46425H4.27436C4.27436 6.62051 4.31357 6.77523 4.39121 6.92842C4.46885 7.08237 4.598 7.20861 4.77789 7.30868C4.95854 7.40875 5.19915 7.45879 5.5005 7.45879C5.89947 7.45879 6.20004 7.37796 6.40222 7.21708C6.60363 7.0562 6.7051 6.86376 6.7051 6.63976C6.7051 6.41576 6.61593 6.24795 6.43835 6.10631C6.26077 5.96544 5.9971 5.88 5.64655 5.85075L5.20146 5.80687C4.72023 5.763 4.33586 5.61674 4.04836 5.36811C3.76162 5.11947 3.61786 4.76692 3.61786 4.30891C3.61786 3.99177 3.69166 3.72389 3.8408 3.50451C3.98916 3.28513 4.20057 3.11732 4.47577 3.00031C4.66719 2.91872 4.88243 2.86561 5.12305 2.84174V1.25757C2.94753 1.44539 1.24017 3.27281 1.24017 5.49974C1.24017 7.46494 2.56931 9.11994 4.37737 9.61104V10.3747C2.1565 9.86738 0.499878 7.87754 0.499878 5.49974C0.499878 2.8633 2.53779 0.70334 5.12305 0.513978C5.24528 0.504741 5.36904 0.500122 5.49358 0.500122C5.61811 0.500122 5.74111 0.504741 5.86334 0.513978V2.85329C6.07551 2.88485 6.26616 2.94104 6.43528 3.02264C6.70741 3.15427 6.9165 3.34286 7.06256 3.58918C7.20862 3.83474 7.28165 4.1311 7.28165 4.47672H6.48601C6.48601 4.31584 6.44835 4.16343 6.37301 4.02025C6.29767 3.87631 6.18467 3.7593 6.03323 3.66924C5.88256 3.57918 5.68807 3.53376 5.44976 3.53376C5.23067 3.53376 5.04617 3.5684 4.89473 3.63614C4.74406 3.70465 4.62721 3.79702 4.54496 3.91402C4.46193 4.03103 4.42042 4.16266 4.42042 4.30891C4.42042 4.49827 4.48961 4.66454 4.62875 4.80541C4.76712 4.94705 4.98237 5.03249 5.27449 5.06174L5.71958 5.10485C6.26462 5.15411 6.70049 5.3073 7.02643 5.56594C7.35238 5.82381 7.51535 6.18175 7.51535 6.63976C7.51535 6.95151 7.43386 7.22247 7.27089 7.45109C7.10792 7.68048 6.87653 7.85829 6.57749 7.98453C6.3684 8.07306 6.13086 8.13079 5.86334 8.15696V9.74267C8.03886 9.55562 9.74698 7.72743 9.74698 5.49974C9.74698 3.53376 8.41554 1.87877 6.60594 1.38843V0.625594C8.82835 1.13133 10.4873 3.12117 10.4873 5.49974Z"
                                  fill="#242424"
                                />
                              </svg>
                              Active
                            </div>
                          )}
                          {/* Position ID */}
                          <span
                            className={`text-sm font-medium font-sora leading-none ${
                              isZombie || isFullyRedeemed
                                ? "text-white"
                                : "text-neutral-800"
                            }`}
                          >
                            Position #{truncateTroveId(trove.id)}
                          </span>
                        </div>
                        {/* Edit/Close Icons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleClosePosition(
                                trove.id,
                                trove.collateralAsset
                              )
                            }
                            className={`w-8 h-8 rounded-lg border transition-all flex items-center justify-center ${
                              isZombie || isFullyRedeemed
                                ? "border-white/20 hover:bg-white/20"
                                : "border-neutral-800/10 hover:bg-[#F5F3EE]"
                            }`}
                          >
                            <X
                              className={`h-4 w-4 ${
                                isZombie || isFullyRedeemed
                                  ? "text-white"
                                  : "text-neutral-800"
                              }`}
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleUpdatePosition(
                                trove.id,
                                trove.collateralAsset
                              )
                            }
                            disabled={isFullyRedeemed}
                            className={`w-8 h-8 rounded-lg border transition-all flex items-center justify-center ${
                              isZombie || isFullyRedeemed
                                ? isFullyRedeemed
                                  ? "border-white/10 bg-white/5 cursor-not-allowed"
                                  : "border-white/20 hover:bg-white/20"
                                : "border-neutral-800/10 hover:bg-[#F5F3EE]"
                            }`}
                          >
                            <Edit3
                              className={`h-4 w-4 ${
                                isZombie || isFullyRedeemed
                                  ? isFullyRedeemed
                                    ? "text-white/30"
                                    : "text-white"
                                  : "text-neutral-800"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-center mb-4 lg:mb-8">
                          <div
                            className={`text-xs font-medium font-sora uppercase tracking-tight ${
                              isZombie || isFullyRedeemed
                                ? "text-white/60"
                                : "text-neutral-800"
                            }`}
                          >
                            Collateral Value
                          </div>
                          <div
                            className={`flex items-center gap-2 px-2 py-2 rounded-md border ${
                              isZombie || isFullyRedeemed
                                ? "border-white/20"
                                : "border-[#F5F3EE]"
                            }`}
                          >
                            <span
                              className={`text-xs font-medium font-sora ${
                                isZombie || isFullyRedeemed
                                  ? "text-white/60"
                                  : "text-neutral-800"
                              }`}
                            >
                              Rate
                            </span>
                            <div
                              className={`h-3 w-px ${
                                isZombie || isFullyRedeemed
                                  ? "bg-white/20"
                                  : "bg-[#F5F3EE]"
                              }`}
                            />
                            <span
                              className={`text-xs font-medium font-sora leading-3 ${
                                isZombie || isFullyRedeemed
                                  ? "text-white"
                                  : "text-neutral-800"
                              }`}
                            >
                              {trove.interestRate}%
                            </span>
                          </div>
                        </div>

                        {/* Collateral Amount Values */}
                        <div className="flex-1 flex flex-col justify-center">
                          <div>
                            <div className="flex items-baseline gap-3">
                              <div
                                className={`text-3xl font-medium font-sora ${
                                  isZombie || isFullyRedeemed
                                    ? "text-white"
                                    : "text-neutral-800"
                                }`}
                              >
                                <NumericFormat
                                  displayType="text"
                                  value={trove.collateralAmount}
                                  thousandSeparator=","
                                  decimalScale={6}
                                  fixedDecimalScale={false}
                                />
                              </div>
                              {/* Token display inline like in token-input */}
                              <div
                                className={`p-2.5 rounded-lg inline-flex justify-start items-center gap-2 ${
                                  isZombie || isFullyRedeemed
                                    ? "bg-white/10"
                                    : "bg-token-bg"
                                }`}
                              >
                                <img
                                  src={
                                    trove.collateralAsset === "GBTC"
                                      ? GBTC_TOKEN.icon
                                      : UBTC_TOKEN.icon
                                  }
                                  alt={trove.collateralAsset}
                                  className="w-5 h-5 object-contain"
                                />
                                <span
                                  className={`text-sm font-medium font-sora leading-tight ${
                                    isZombie || isFullyRedeemed
                                      ? "text-white"
                                      : "text-token-orange"
                                  }`}
                                >
                                  {trove.collateralAsset}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`text-base font-normal font-sora mt-1 ${
                                isZombie || isFullyRedeemed
                                  ? "text-white/60"
                                  : "text-[#AAA28E]"
                              }`}
                            >
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
                        </div>
                      </div>
                    </CardContent>
                    {/* Card Footer with Debt and Liquidation Price */}
                    <CardFooter
                      className={`border-t ${
                        isZombie || isFullyRedeemed
                          ? "border-white/20"
                          : "border-[#F5F3EE]"
                      }`}
                    >
                      <div className="w-full grid grid-cols-2 relative -my-6">
                        {/* Full-height divider */}
                        {!(isZombie || isFullyRedeemed) && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-[#F5F3EE]" />
                        )}

                        {/* Debt section */}
                        <div className="pr-4 py-6">
                          <div
                            className={`text-xs font-medium font-sora uppercase tracking-tight mb-2 ${
                              isZombie || isFullyRedeemed
                                ? "text-white/60"
                                : "text-neutral-800"
                            }`}
                          >
                            Debt (USDU)
                          </div>
                          <div
                            className={`text-xl font-medium font-sora ${
                              isZombie || isFullyRedeemed
                                ? "text-white"
                                : "text-neutral-800"
                            }`}
                          >
                            <NumericFormat
                              displayType="text"
                              value={trove.borrowedAmount}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />
                          </div>
                        </div>

                        {/* Liquidation Price section */}
                        <div className="pl-6 py-6">
                          <div
                            className={`text-xs font-medium font-sora uppercase tracking-tight mb-2 ${
                              isZombie || isFullyRedeemed
                                ? "text-white/60"
                                : "text-neutral-800"
                            }`}
                          >
                            Liquidation
                          </div>
                          <div
                            className={`text-xl font-medium font-sora ${
                              isZombie || isFullyRedeemed
                                ? "text-white"
                                : "text-neutral-800"
                            }`}
                          >
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
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Liquidation Notice - After borrow positions */}
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
