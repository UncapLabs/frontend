import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";
import { cn } from "~/lib/utils";

type GradientMode = "low-to-high" | "high-to-low";
type Chart = number[];

const BAR_HEIGHT = 4;
const HANDLE_SIZE = 26;
const MIN_WIDTH = HANDLE_SIZE * 2;
const CHART_MAX_HEIGHT = 30;
const HEIGHT = 60;
const GRADIENT_TRANSITION_BLUR = 4;

interface LiquitySliderProps {
  value: number;
  onChange: (value: number) => void;
  chart?: Chart;
  gradient?: [number, number]; // [medium threshold, low threshold]
  gradientMode?: GradientMode;
  handleColor?: 0 | 1 | 2; // 0 = high risk (red), 1 = medium (yellow), 2 = low (green)
  disabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  className?: string;
}

// Define gradient colors to match Liquity's design
const riskGradient = {
  high: "#dc2626", // red-600
  mediumHigh: "#ea580c", // orange-600
  medium: "#f59e0b", // amber-500
  mediumLow: "#84cc16", // lime-500
  low: "#22c55e", // green-500
};

const riskGradientDimmed = {
  high: "rgba(220, 38, 38, 0.2)",
  medium: "rgba(245, 158, 11, 0.2)",
  low: "rgba(34, 197, 94, 0.2)",
};

export function InterestSlider({
  value,
  onChange,
  chart,
  gradient,
  gradientMode = "high-to-low",
  handleColor,
  disabled = false,
  onDragStart,
  onDragEnd,
  className,
}: LiquitySliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const svgId = useId();

  // Ensure value is between 0 and 1
  value = Math.max(0, Math.min(1, value));

  // Get gradient colors based on mode
  const gradientColors = useMemo(() => {
    const colors = [
      riskGradient.high,
      riskGradient.mediumHigh,
      riskGradient.medium,
      riskGradient.mediumLow,
      riskGradient.low,
    ];
    return gradientMode === "low-to-high" ? colors : colors.reverse();
  }, [gradientMode]);

  const gradientColorsDimmed = useMemo(() => {
    const colors = [
      riskGradientDimmed.high,
      riskGradientDimmed.medium,
      riskGradientDimmed.low,
    ];
    return gradientMode === "low-to-high" ? colors : colors.reverse();
  }, [gradientMode]);

  // Calculate handle color based on position and gradient
  const currentHandleColor = useMemo(() => {
    if (handleColor !== undefined) {
      return gradientColors[handleColor * 2];
    }
    if (gradient) {
      if (value <= gradient[0]) return gradientColors[0];
      if (value <= gradient[1]) return gradientColors[2];
      return gradientColors[4];
    }
    return "#ffffff";
  }, [value, gradient, handleColor, gradientColors]);

  const updateValueFromClientX = useCallback(
    (clientX: number) => {
      if (!sliderRef.current || disabled) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.min(rect.width, Math.max(0, clientX - rect.x));
      onChange(x / rect.width);
    },
    [onChange, disabled]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    onDragStart?.();
    updateValueFromClientX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    onDragStart?.();
    const touch = e.touches[0];
    if (touch) {
      updateValueFromClientX(touch.clientX);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      updateValueFromClientX(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        updateValueFromClientX(touch.clientX);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      onDragEnd?.();
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
  }, [isDragging, updateValueFromClientX, onDragEnd]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    const step = chart ? 1 / chart.length : 0.01;

    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(0, value - step));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(1, value + step));
    }
  };

  // Normalize chart data for rendering
  const normalizedChart = useMemo(() => {
    if (!chart || chart.length === 0) return [];
    const max = Math.max(...chart);
    if (max === 0) return chart.map(() => 0);
    return chart.map((v) => v / max);
  }, [chart]);

  // Calculate gradient geometry for zones
  const gradientGeometry = useMemo(() => {
    if (!gradient) return null;
    const steps = [0, ...gradient];
    return steps.map((step, index) => {
      const next = index === steps.length - 1 ? 1 : steps[index + 1];
      return { x: step * 100, width: (next - step) * 100, index };
    });
  }, [gradient]);

  return (
    <div
      ref={sliderRef}
      tabIndex={disabled ? -1 : 0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative select-none rounded",
        isFocused && "outline outline-2 outline-blue-500 outline-offset-2",
        disabled && "opacity-50",
        className
      )}
      style={{
        minWidth: MIN_WIDTH,
        width: "100%",
        height: HEIGHT,
        cursor: disabled ? "default" : "pointer",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Chart visualization */}
      {chart && chart.length > 0 ? (
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: CHART_MAX_HEIGHT }}
        >
          <svg
            width="100%"
            height={CHART_MAX_HEIGHT}
            viewBox={`0 0 100 ${CHART_MAX_HEIGHT}`}
            preserveAspectRatio="none"
            shapeRendering="optimizeSpeed"
            className="absolute inset-0"
          >
            <defs>
              {/* Gradient definitions for zone backgrounds */}
              {gradientColorsDimmed.map((color, index) => (
                <linearGradient
                  key={index}
                  id={`${svgId}-gradient-${index + 1}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={color} stopOpacity="0" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.2" />
                </linearGradient>
              ))}
            </defs>

            {/* Background gradient zones */}
            {gradientGeometry?.map(({ x, width, index }) => (
              <rect
                key={`zone-${index}`}
                x={`${x}%`}
                y="0"
                width={`${width}%`}
                height={CHART_MAX_HEIGHT}
                fill={`url(#${svgId}-gradient-${index + 1})`}
              />
            ))}

            {/* Histogram bars - each bar represents debt at that interest rate */}
            {normalizedChart.map((barValue, index) => {
              const barWidth = 100 / normalizedChart.length;
              const x = index * barWidth;
              const barHeight = barValue * CHART_MAX_HEIGHT;
              const y = CHART_MAX_HEIGHT - barHeight;
              const barPosition = index / normalizedChart.length;
              const isActive = barPosition <= value;

              // Determine bar color based on position and gradient zones
              let barColor = "#cbd5e1"; // default gray for inactive
              if (isActive) {
                if (gradient) {
                  if (barPosition <= gradient[0]) {
                    barColor = gradientColors[0]; // high risk
                  } else if (barPosition <= gradient[1]) {
                    barColor = gradientColors[2]; // medium risk
                  } else {
                    barColor = gradientColors[4]; // low risk
                  }
                } else {
                  barColor = currentHandleColor;
                }
              }

              return (
                <rect
                  key={`bar-${index}`}
                  x={`${x}%`}
                  y={y}
                  width={`${barWidth * 0.8}%`} // Slightly narrower for gap between bars
                  height={barHeight}
                  fill={barColor}
                  opacity={isActive ? 1 : 0.3}
                  style={{
                    transform: `translateX(${barWidth * 0.1}%)`, // Center the bar
                    transition: isDragging
                      ? "none"
                      : "fill 150ms ease-out, opacity 150ms ease-out",
                  }}
                />
              );
            })}

            {/* Base line */}
            <rect
              x="0"
              y={CHART_MAX_HEIGHT - 2}
              width="100"
              height="2"
              fill="#94a3b8"
            />

            {/* Active line */}
            <rect
              x="0"
              y={CHART_MAX_HEIGHT - 2}
              width={value * 100}
              height="2"
              fill={currentHandleColor}
            />
          </svg>
        </div>
      ) : (
        /* Simple slider track when no chart */
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
          style={{ height: BAR_HEIGHT }}
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: BAR_HEIGHT / 2 }}
          >
            {/* Background with gradient */}
            {gradient ? (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, 
                    ${gradientColors[0]} 0%, 
                    ${gradientColors[1]} calc(${
                    gradient[0] * 100
                  }% - ${GRADIENT_TRANSITION_BLUR}%), 
                    ${gradientColors[2]} calc(${
                    gradient[0] * 100
                  }% + ${GRADIENT_TRANSITION_BLUR}%), 
                    ${gradientColors[3]} calc(${
                    gradient[1] * 100
                  }% - ${GRADIENT_TRANSITION_BLUR}%), 
                    ${gradientColors[4]} calc(${
                    gradient[1] * 100
                  }% + ${GRADIENT_TRANSITION_BLUR}%), 
                    ${gradientColors[4]} 100%)`,
                }}
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-slate-200" />
                <div
                  className="absolute inset-y-0 left-0 bg-blue-500"
                  style={{
                    width: `${value * 100}%`,
                    transition: isDragging ? "none" : "width 150ms ease-out",
                  }}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Handle container */}
      <div
        className="pointer-events-none absolute inset-y-0"
        style={{
          width: `calc(100% + ${HANDLE_SIZE}px)`,
          transform: `translateX(-${HANDLE_SIZE / 2}px)`,
        }}
      >
        <div
          className="h-full"
          style={{
            width: `calc(100% - ${HANDLE_SIZE}px)`,
            transform: `translateX(${value * 100}%)`,
            transition: isDragging ? "none" : "transform 150ms ease-out",
          }}
        >
          {/* Handle */}
          <div
            className="pointer-events-auto absolute left-0 top-1/2"
            style={{
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              transform: `translateY(-50%) translateY(${
                isDragging ? "1px" : "0"
              })`,
              transition: "all 150ms ease-out",
            }}
          >
            <div
              className={cn(
                "h-full w-full rounded-full",
                "border-2 shadow-md",
                isDragging && "scale-105 shadow-lg"
              )}
              style={{
                borderColor: disabled ? "#cbd5e1" : "#64748b",
                backgroundColor: disabled
                  ? "#f1f5f9"
                  : gradient || chart
                  ? currentHandleColor
                  : "#ffffff",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
