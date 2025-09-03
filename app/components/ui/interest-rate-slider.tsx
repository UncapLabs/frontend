import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "~/lib/utils";
import {
  type RiskLevel,
  THUMB_COLOR_CLASSES,
  riskLevelToHandleColor,
} from "~/lib/interest-rate-visualization";

interface InterestRateSliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  gradient?: [medium: number, low: number];
  gradientMode?: "high-to-low";
  handleColor?: number; // 0 = red, 1 = yellow, 2 = green
  riskLevel?: RiskLevel; // New prop to use tRPC risk data directly
  chart?: number[]; // Array of heights (0-1) for chart bars
}

function InterestRateSlider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 1,
  gradient,
  gradientMode,
  handleColor,
  riskLevel,
  chart,
  ...props
}: InterestRateSliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
        ? defaultValue
        : [min],
    [value, defaultValue, min]
  );

  // Calculate gradient background
  const gradientStyle = React.useMemo(() => {
    if (!gradient || gradientMode !== "high-to-low") return {};

    const [mediumStop, lowStop] = gradient;
    const mediumPercent = mediumStop * 100;
    const lowPercent = lowStop * 100;

    return {
      background: `linear-gradient(to right, 
        #22c55e 0%, 
        #22c55e ${lowPercent}%, 
        #eab308 ${lowPercent}%, 
        #eab308 ${mediumPercent}%, 
        #ef4444 ${mediumPercent}%, 
        #ef4444 100%)`,
    };
  }, [gradient, gradientMode]);

  // Get thumb color based on handleColor or riskLevel
  const thumbColorClass = React.useMemo(() => {
    // If we have explicit risk level from tRPC, use it
    if (riskLevel) {
      const colorIndex = riskLevelToHandleColor(riskLevel);
      return THUMB_COLOR_CLASSES[colorIndex];
    }

    // Otherwise use the provided handleColor
    if (handleColor !== undefined && handleColor in THUMB_COLOR_CLASSES) {
      return THUMB_COLOR_CLASSES[handleColor as keyof typeof THUMB_COLOR_CLASSES];
    }

    return "border-primary bg-background";
  }, [handleColor, riskLevel]);

  return (
    <div className="relative">
      {/* Chart bars */}
      {chart && chart.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-8 flex items-end pointer-events-none">
          {chart.map((height, i) => (
            <div
              key={i}
              className="bg-gray-300 opacity-40"
              style={{
                height: `${height * 100}%`,
                width: `${100 / chart.length}%`,
              }}
            />
          ))}
        </div>
      )}

      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full h-2 w-full"
          style={gradientStyle}
        >
          {!gradient && (
            <SliderPrimitive.Range
              data-slot="slider-range"
              className="bg-blue-500 absolute h-full"
            />
          )}
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className={cn(
              "block size-5 shrink-0 rounded-full border-2 shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
              thumbColorClass
            )}
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
}

export { InterestRateSlider };
