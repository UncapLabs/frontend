import { Skeleton } from "~/components/ui/skeleton";

export function InterestRateSkeleton() {
  return (
    <>
      <div className="flex items-center gap-3">
        {/* Input field skeleton on the left */}
        <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 px-3 py-2">
          <Skeleton className="h-5 w-16 animate-none" />
          <span className="text-sm font-semibold text-slate-400">
            %
          </span>
        </div>

        <div className="flex-1 max-w-md">
          <div
            className="relative"
            style={{ height: 60 }} // Matches CHART_CONSTANTS.HEIGHT
          >
            {/* Skeleton bars for histogram using SVG like InterestSlider */}
            <div
              className="absolute inset-x-0 top-0"
              style={{ height: 30 }} // Matches CHART_CONSTANTS.CHART_MAX_HEIGHT
            >
              <svg
                width="100%"
                height={30}
                viewBox="0 0 100 30"
                preserveAspectRatio="none"
                className="absolute inset-0"
              >
                {/* Render thin bars with realistic distribution - peak around middle */}
                {Array.from({ length: 50 }).map((_, i) => {
                  const barWidth = 100 / 50;
                  const x = i * barWidth;

                  // Create a more realistic distribution with a peak around 25-35 (middle-high area)
                  // This mimics typical interest rate distributions where there's usually a concentration
                  let heightPercent: number;
                  if (i >= 20 && i <= 35) {
                    // Peak area - taller bars where most debt typically concentrates
                    heightPercent =
                      50 +
                      Math.sin((i - 20) * 0.4) * 25 +
                      Math.random() * 10;
                  } else if (i < 20) {
                    // Lower rates - gradually increasing
                    heightPercent =
                      10 + (i / 20) * 30 + Math.random() * 10;
                  } else {
                    // Higher rates - gradually decreasing
                    heightPercent =
                      40 - ((i - 35) / 15) * 30 + Math.random() * 10;
                  }

                  // Ensure height is within reasonable bounds
                  heightPercent = Math.max(
                    5,
                    Math.min(85, heightPercent)
                  );

                  const barHeight = (heightPercent / 100) * 30;
                  const y = 30 - barHeight;

                  return (
                    <rect
                      key={`skeleton-bar-${i}`}
                      x={`${x}%`}
                      y={y}
                      width={`${barWidth * 0.5}%`} // Very thin bars (50% of allocated width)
                      height={barHeight}
                      fill="#e2e8f0"
                      opacity={0.5}
                      style={{
                        transform: `translateX(${barWidth * 0.25}%)`, // Center the bar
                      }}
                    />
                  );
                })}

                {/* Base line */}
                <rect
                  x="0"
                  y={28}
                  width="100"
                  height="2"
                  fill="#94a3b8"
                  opacity={0.3}
                />
              </svg>
            </div>

            {/* Handle container positioned exactly like InterestSlider */}
            <div
              className="pointer-events-none absolute inset-y-0"
              style={{
                width: `calc(100% + 26px)`,
                transform: `translateX(-13px)`,
              }}
            >
              <div
                className="h-full"
                style={{
                  width: `calc(100% - 26px)`,
                  transform: `translateX(30%)`, // 30% position
                }}
              >
                {/* Handle */}
                <div
                  className="absolute left-0 top-1/2"
                  style={{
                    width: 26,
                    height: 26,
                    transform: `translateY(-50%)`,
                  }}
                >
                  <Skeleton className="h-full w-full rounded-full animate-none bg-slate-200 border-2 border-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton for Risk Indicator */}
      <div className="mt-3 p-2 rounded-lg border bg-slate-50 border-slate-200">
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4 mt-0.5 rounded animate-none" />
          <div className="flex-1">
            <Skeleton className="h-3 w-24 mb-1 animate-none" />
            <Skeleton className="h-3 w-full animate-none" />
          </div>
        </div>
      </div>

      {/* Skeleton for Debt Statistics */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-white rounded-lg border border-slate-200 p-2">
          <Skeleton className="h-3 w-16 mb-1 animate-none" />
          <Skeleton className="h-4 w-20 animate-none" />
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-2">
          <Skeleton className="h-3 w-14 mb-1 animate-none" />
          <Skeleton className="h-4 w-24 animate-none" />
        </div>
      </div>
    </>
  );
}
