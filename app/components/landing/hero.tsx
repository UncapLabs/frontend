import { Button } from "../ui/button";
import { Container } from "./container";
import { Gradient } from "./gradient";
import { TokenInput } from "../token-input";
import { ArrowIcon } from "../icons/arrow-icon";
import { TOKENS, DEFAULT_COLLATERAL } from "~/lib/collateral";
import Big from "big.js";
import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { useCollateralPrice, useUsduPrice } from "~/hooks/use-fetch-prices";

export default function Hero() {
  // Local state for the form
  const [collateralAmount, setCollateralAmount] = useState<Big | undefined>(
    new Big("0.5")
  );
  const [borrowAmount, setBorrowAmount] = useState<Big | undefined>(
    new Big("20000")
  );
  const [interestRate, setInterestRate] = useState<number>(2);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Fetch real prices
  const bitcoin = useCollateralPrice(DEFAULT_COLLATERAL.id, {
    enabled: true,
  });
  const usdu = useUsduPrice({ enabled: true });

  // Update rate from client X position
  const updateRateFromClientX = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.min(rect.width, Math.max(0, clientX - rect.x));
    const percentage = x / rect.width;
    // Map 0-1 to 0.5-20
    const newRate = 0.5 + percentage * 19.5;
    setInterestRate(Math.round(newRate * 10) / 10);
  }, []);

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      updateRateFromClientX(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        updateRateFromClientX(touch.clientX);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, updateRateFromClientX]);

  // Build URL with query params
  const buildBorrowUrl = () => {
    const params = new URLSearchParams();
    if (collateralAmount) {
      params.set("amount", collateralAmount.toString());
    }
    if (borrowAmount) {
      params.set("borrow", borrowAmount.toString());
    }
    params.set("rate", interestRate.toString());
    return `/borrow?${params.toString()}`;
  };

  return (
    <div className="relative bg-[#F5F3EE] mb-10 overflow-hidden isolate">
      {/* Subtle Background Pattern - Diagonal Pinstripes */}
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-[#001B40]/[0.03] [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="hero-pattern"
            width={20}
            height={20}
            x="50%"
            y={-1}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="20" strokeWidth="1" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          strokeWidth={0}
          fill="url(#hero-pattern)"
        />
      </svg>

      {/* Brand Aurora - Left (Bitcoin Orange) */}
      <div
        className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
        aria-hidden="true"
      >
        <div
          className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#FF9300]/20 to-[#FFA933]/20 opacity-30"
          style={{
            clipPath:
              "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
          }}
        />
      </div>

      {/* Brand Aurora - Right (Electric Blue) */}
      <div
        className="absolute right-[calc(50%-4rem)] top-40 -z-10 transform-gpu blur-3xl sm:right-[calc(50%-18rem)] lg:right-20 lg:top-[calc(50%-20rem)] xl:right-[calc(50%-10rem)]"
        aria-hidden="true"
      >
        <div
          className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-l from-[#1E50BC]/15 to-[#0051BF]/15 opacity-30"
          style={{
            clipPath:
              "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
          }}
        />
      </div>

      <Container className="relative">
        <div className="py-16 relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Left Column: Text Content */}
            <div className="lg:col-span-6 relative z-10">
              <h1 className="font-sora text-5xl/[1.1] font-medium tracking-tight text-balance text-[#001B40] sm:text-7xl/[1.1] md:text-8xl/[1.1]">
                Finally, do more with your Bitcoin.
              </h1>
              <p className="mt-6 max-w-2xl text-base font-normal font-sora text-[#001B40]/70 sm:text-lg leading-normal">
                Borrow against your Bitcoin at rates as low as 0.5%—the cheapest
                in DeFi. You set the rate and keep full control of your Bitcoin.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  className="bg-token-bg-blue hover:bg-[#0051BF] text-white font-sora rounded-xl h-12 px-8 shadow-lg shadow-blue-900/10 transition-all hover:scale-105"
                >
                  <Link to="/borrow">Start Borrowing</Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-neutral-200 bg-white hover:bg-neutral-50 text-[#001B40] font-sora rounded-xl h-12 px-8 transition-all hover:scale-105"
                  onClick={() => {
                    const nextSection =
                      document.querySelector("#problem-section");
                    nextSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Learn more
                </Button>
              </div>
            </div>

            {/* Right Column: Borrow Preview */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-full">
                {/* Main Borrow Preview Card - Exact replica from borrow.tsx */}
                <div className="bg-[#FDFBF7] rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/5 border border-neutral-200/60 relative z-20">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-semibold tracking-tight text-[#001B40] font-sora">
                      Borrow
                    </h2>
                  </div>

                  <div className="space-y-1">
                    {/* Deposit Collateral Section */}
                    <TokenInput
                      token={DEFAULT_COLLATERAL}
                      price={bitcoin}
                      value={collateralAmount}
                      onChange={(value) => {
                        setCollateralAmount(value);
                      }}
                      label="Deposit Amount"
                      percentageButtons
                      onPercentageClick={(percentage) => {
                        // Simple percentage of a mock balance
                        const mockBalance = new Big("2.5");
                        const newValue = mockBalance.times(percentage);
                        setCollateralAmount(newValue);
                      }}
                      disabled={false}
                      includeMax={true}
                      tokenSelectorBgColor="bg-token-bg"
                      tokenSelectorTextColor="text-token-orange"
                      compact={true}
                    />

                    <div className="relative flex justify-center items-center">
                      <div className="absolute z-10">
                        <ArrowIcon
                          size={32}
                          className="sm:w-10 sm:h-10 md:w-14 md:h-14"
                          innerCircleColor="#242424"
                          direction="down"
                        />
                      </div>
                    </div>

                    {/* Borrow Stablecoin Section */}
                    <TokenInput
                      token={TOKENS.USDU}
                      price={usdu}
                      value={borrowAmount}
                      onChange={(value) => {
                        setBorrowAmount(value);
                      }}
                      label="Borrow Amount"
                      percentageButtons
                      onPercentageClick={(percentage) => {
                        // Percentage based on collateral value
                        if (
                          !collateralAmount ||
                          !bitcoin?.price ||
                          !usdu?.price
                        )
                          return;
                        const btcPrice = bitcoin.price;
                        const usduPrice = usdu.price;
                        const collateralValueUSD =
                          collateralAmount.times(btcPrice);
                        const borrowAmountUSD =
                          collateralValueUSD.times(percentage);
                        const newValue = borrowAmountUSD.div(usduPrice);
                        setBorrowAmount(newValue);
                      }}
                      disabled={false}
                      showBalance={false}
                      tokenSelectorBgColor="bg-token-bg-red/10"
                      tokenSelectorTextColor="text-token-bg-red"
                      compact={true}
                      bottomRightContent={
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
                            <span className="hidden sm:inline">
                              Liquidation Risk:
                            </span>
                            <span className="sm:hidden">Risk:</span>
                          </span>
                          <div className="px-1.5 sm:px-2 py-3 h-6 flex items-center justify-center rounded-md border bg-green-500/10 border-green-500/20">
                            <span className="text-xs font-normal font-sora text-green-700">
                              Low
                            </span>
                          </div>
                        </div>
                      }
                    />

                    {/* Interest Rate Selector - Minimal version for hero */}
                    <div className="bg-white rounded-2xl p-5 mt-4">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
                            Interest Rate
                          </h3>
                          <span className="text-xs text-neutral-500 font-sora leading-3">
                            avg: 3.11%
                          </span>
                        </div>
                      </div>

                      {/* Large rate display */}
                      <div className="flex items-baseline gap-3 mb-4">
                        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal font-sora leading-tight text-[#242424]">
                          {interestRate.toFixed(2)}%
                        </div>
                        {/* Yearly cost */}
                        {borrowAmount && borrowAmount.gt(0) && (
                          <div className="flex items-baseline">
                            <span className="text-sm text-neutral-800 font-medium font-sora">
                              {borrowAmount
                                .times(interestRate)
                                .div(100)
                                .toFixed(2)}
                            </span>
                            <span className="text-xs text-neutral-500 ml-1">
                              USDU / year
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Custom slider - inspired by interest-slider.tsx */}
                      <div className="w-full mb-4">
                        <div
                          ref={sliderRef}
                          className="relative overflow-hidden select-none rounded cursor-pointer"
                          style={{
                            minWidth: "280px",
                            width: "100%",
                            height: "32px",
                          }}
                          onMouseDown={(e) => {
                            setIsDragging(true);
                            updateRateFromClientX(e.clientX);
                          }}
                          onTouchStart={(e) => {
                            setIsDragging(true);
                            const touch = e.touches[0];
                            if (touch) {
                              updateRateFromClientX(touch.clientX);
                            }
                          }}
                        >
                          {/* Simplified slider track */}
                          <div
                            className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
                            style={{ height: 2 }}
                          >
                            <div className="absolute inset-0 rounded-full bg-neutral-200" />
                            {/* Active portion of the track */}
                            <div
                              className="absolute left-0 h-full rounded-full"
                              style={{
                                width: `${
                                  ((interestRate - 0.5) / 19.5) * 100
                                }%`,
                                backgroundColor:
                                  interestRate < 2
                                    ? "#dc2626"
                                    : interestRate < 5
                                    ? "#f59e0b"
                                    : "#10b981",
                                transition: isDragging
                                  ? "none"
                                  : "width 150ms ease-out",
                              }}
                            />
                          </div>

                          {/* Handle */}
                          <div
                            className="pointer-events-none absolute inset-y-0"
                            style={{
                              width: "calc(100% + 16px)",
                              transform: "translateX(-8px)",
                            }}
                          >
                            <div
                              className="h-full"
                              style={{
                                width: "calc(100% - 16px)",
                                transform: `translateX(${
                                  ((interestRate - 0.5) / 19.5) * 100
                                }%)`,
                                transition: "transform 150ms ease-out",
                              }}
                            >
                              <div
                                className="absolute left-0 top-1/2"
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  transform: "translateY(-50%)",
                                }}
                              >
                                <div
                                  className="h-full w-full rounded-full shadow-md"
                                  style={{
                                    backgroundColor:
                                      interestRate < 2
                                        ? "#dc2626"
                                        : interestRate < 5
                                        ? "#f59e0b"
                                        : "#10b981",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info footer */}
                      <div className="flex items-center justify-between text-xs font-medium text-neutral-500 font-sora">
                        <span>
                          Redeemable before you:{" "}
                          <span className="text-neutral-700">$0.10M</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span>Redemption Risk:</span>
                          <div className="px-2 py-0.5 bg-green-50 border border-green-100 rounded text-green-700">
                            Low
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Get Started Button - navigates to /borrow with URL params */}
                    <div className="flex flex-col items-start space-y-2 mt-4">
                      <Button
                        asChild
                        className="w-full h-12 bg-token-bg-blue hover:bg-[#0051BF] text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all whitespace-nowrap"
                      >
                        <Link to={buildBorrowUrl()}>Get Started</Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Decorative shadow layer */}
                <div className="absolute -top-6 -right-6 w-full h-full bg-neutral-200/50 rounded-3xl -z-10 transform rotate-3 scale-[0.98]"></div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
