import { Skeleton } from "~/components/ui/skeleton";

export function InterestRateSkeleton() {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Interest rate input skeleton at the top */}
      <div className="flex items-baseline gap-3">
        <Skeleton className="h-12 w-36 animate-none" />
        {/* Yearly Interest Cost skeleton */}
        <div className="flex items-baseline">
          <Skeleton className="h-4 w-20 animate-none" />
          <span className="text-xs text-neutral-500 ml-1">USDU / year</span>
        </div>
      </div>

      {/* Full width slider skeleton */}
      <div className="w-full mt-2">
        <div
          className="relative"
          style={{ height: 60 }} // Matches CHART_CONSTANTS.HEIGHT
        >
          {/* Skeleton bars for histogram */}
          <div
            className="absolute inset-x-0 top-0 flex items-end"
            style={{ height: 32 }} // Matches CHART_CONSTANTS.CHART_MAX_HEIGHT + 2
          >
            <div className="absolute inset-0 flex items-end mb-[5px]">
              {Array.from({ length: 50 }).map((_, i) => {
                // Create a more realistic distribution with a peak around 25-35 (middle-high area)
                let heightPercent: number;
                if (i >= 20 && i <= 35) {
                  // Peak area - taller bars where most debt typically concentrates
                  heightPercent =
                    50 + Math.sin((i - 20) * 0.4) * 25 + Math.random() * 10;
                } else if (i < 20) {
                  // Lower rates - gradually increasing
                  heightPercent = 10 + (i / 20) * 30 + Math.random() * 10;
                } else {
                  // Higher rates - gradually decreasing
                  heightPercent = 40 - ((i - 35) / 15) * 30 + Math.random() * 10;
                }

                // Ensure height is within reasonable bounds
                heightPercent = Math.max(5, Math.min(85, heightPercent));

                return (
                  <div
                    key={`skeleton-bar-${i}`}
                    className="flex-1 flex justify-center items-end"
                    style={{
                      height: "100%",
                      paddingLeft: "1px",
                      paddingRight: "1px",
                    }}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        width: "45%",
                        height: `${heightPercent}%`,
                        backgroundColor: "#e2e8f0",
                        opacity: 0.5,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Base line */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: "2px",
                backgroundColor: "#e2e8f0",
              }}
            />
          </div>

          {/* Handle container positioned exactly like InterestSlider */}
          <div
            className="pointer-events-none absolute inset-y-0"
            style={{
              width: `calc(100% + 20px)`,
              transform: `translateX(-10px)`,
            }}
          >
            <div
              className="h-full"
              style={{
                width: `calc(100% - 20px)`,
                transform: `translateX(30%)`, // 30% position
              }}
            >
              {/* Handle */}
              <div
                className="absolute left-0 top-1/2"
                style={{
                  width: 20,
                  height: 20,
                  transform: `translateY(-50%)`,
                }}
              >
                <Skeleton className="h-full w-full rounded-full animate-none bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redeemable before you and Redemption Risk skeleton */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-neutral-800 text-xs font-medium font-sora leading-3 whitespace-nowrap">
            <span className="hidden sm:inline">Redeemable before you:</span>
            <span className="sm:hidden">Ahead:</span>
          </span>
          <Skeleton className="h-3 w-16 animate-none bg-neutral-200 rounded" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-neutral-800 text-xs font-medium font-sora leading-3">
            <span className="hidden sm:inline">Redemption Risk:</span>
            <span className="sm:hidden">Risk:</span>
          </span>
          <div className="px-1.5 sm:px-2 py-3 h-6 flex items-center justify-center rounded-md border bg-neutral-100 border-neutral-200">
            <Skeleton className="h-3 w-12 animate-none bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
