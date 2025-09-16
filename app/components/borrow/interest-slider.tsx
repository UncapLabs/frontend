import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "~/lib/utils";
import {
  type GradientMode,
  getGradientColors,
  getHandleColorFromPosition,
  CHART_CONSTANTS,
} from "~/lib/interest-rate-visualization";

interface InterestSliderProps {
  value: number;
  onChange: (value: number) => void;
  chart?: number[]; // Pre-normalized heights from server (0-1)
  riskZones?: { highRiskThreshold: number; mediumRiskThreshold: number }; // From server
  gradientMode?: GradientMode;
  disabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  className?: string;
}

export function InterestSlider({
  value,
  onChange,
  chart,
  riskZones = { highRiskThreshold: 0.1, mediumRiskThreshold: 0.25 }, // Default zones
  gradientMode = "high-to-low",
  disabled = false,
  onDragStart,
  onDragEnd,
  className,
}: InterestSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  value = Math.max(0, Math.min(1, value));

  const gradientColors = useMemo(
    () => getGradientColors(gradientMode),
    [gradientMode]
  );

  const currentHandleColor = useMemo(
    () =>
      getHandleColorFromPosition(
        value,
        riskZones?.highRiskThreshold,
        riskZones?.mediumRiskThreshold
      ),
    [value, riskZones]
  );

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

  return (
    <div
      ref={sliderRef}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative select-none rounded",
        disabled && "opacity-50",
        className
      )}
      style={{
        minWidth: CHART_CONSTANTS.MIN_WIDTH,
        width: "100%",
        height: chart && chart.length > 0 ? CHART_CONSTANTS.HEIGHT : 32,
        cursor: disabled ? "default" : "pointer",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Chart visualization */}
      {chart && chart.length > 0 ? (
        <div
          className="absolute inset-x-0 top-0 flex items-end"
          style={{ height: CHART_CONSTANTS.CHART_MAX_HEIGHT + 2 }}
        >
          {/* Histogram bars using CSS - each bar represents debt at that interest rate */}
          <div className="absolute inset-0 flex items-end mb-[5px]">
            {(chart || []).map((barValue: number, index: number) => {
              const barPosition = index / (chart?.length || 1);
              const isActive = barPosition <= value;
              const barHeight = barValue * 100; // As percentage

              // Determine bar color - ALL bars colored by their risk zone, active ones are brighter
              const barColor = getHandleColorFromPosition(
                barPosition,
                riskZones?.highRiskThreshold,
                riskZones?.mediumRiskThreshold
              );

              return (
                <div
                  key={`bar-${index}`}
                  className="flex-1 flex justify-center items-end"
                  style={{
                    height: "100%",
                    paddingLeft: "1px",
                    paddingRight: "1px",
                  }}
                >
                  <div
                    className="rounded-full transition-all"
                    style={{
                      width: "45%",
                      height: `${barHeight}%`,
                      backgroundColor: barColor,
                      opacity: isActive ? 1 : 0.3,
                      transition: isDragging
                        ? "none"
                        : "background-color 150ms ease-out, opacity 150ms ease-out",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Base line - light grey */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: "2px",
              backgroundColor: "#E9E9E9",
            }}
          />

          {/* Active line - matches handle color */}
          <div
            className="absolute bottom-0 left-0"
            style={{
              height: "2px",
              width: `${value * 100}%`,
              backgroundColor: currentHandleColor,
              transition: isDragging ? "none" : "width 150ms ease-out",
            }}
          />
        </div>
      ) : (
        /* Simplified slider track when no chart */
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
          style={{ height: 4 }}
        >
          <div
            className="absolute inset-0 rounded-full bg-neutral-200"
          />
          {/* Active portion of the track */}
          <div
            className="absolute left-0 h-full rounded-full"
            style={{
              width: `${value * 100}%`,
              backgroundColor: currentHandleColor,
              transition: isDragging ? "none" : "width 150ms ease-out",
            }}
          />
        </div>
      )}

      {/* Handle container */}
      <div
        className="pointer-events-none absolute inset-y-0"
        style={{
          width: `calc(100% + ${CHART_CONSTANTS.HANDLE_SIZE}px)`,
          transform: `translateX(-${CHART_CONSTANTS.HANDLE_SIZE / 2}px)`,
        }}
      >
        <div
          className="h-full"
          style={{
            width: `calc(100% - ${CHART_CONSTANTS.HANDLE_SIZE}px)`,
            transform: `translateX(${value * 100}%)`,
            transition: isDragging ? "none" : "transform 150ms ease-out",
          }}
        >
          {/* Handle */}
          <div
            className="pointer-events-auto absolute left-0 top-1/2"
            style={{
              width: CHART_CONSTANTS.HANDLE_SIZE,
              height: CHART_CONSTANTS.HANDLE_SIZE,
              transform: `translateY(-50%) translateY(${
                isDragging ? "1px" : "0"
              })`,
              transition: "all 150ms ease-out",
            }}
          >
            <div
              className={cn(
                "h-full w-full rounded-full",
                "shadow-md",
                isDragging && "scale-105 shadow-lg"
              )}
              style={{
                backgroundColor: disabled ? "#f1f5f9" : currentHandleColor,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
