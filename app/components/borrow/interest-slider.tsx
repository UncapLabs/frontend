import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";
import { cn } from "~/lib/utils";
import {
  type GradientMode,
  getGradientColors,
  getGradientColorsDimmed,
  getHandleColorFromPosition,
  calculateGradientGeometry as calculateGradientGeometryUI,
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
  const [isFocused, setIsFocused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const svgId = useId();

  value = Math.max(0, Math.min(1, value));

  const gradientColors = useMemo(
    () => getGradientColors(gradientMode),
    [gradientMode]
  );
  const gradientColorsDimmed = useMemo(
    () => getGradientColorsDimmed(gradientMode),
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

  // Calculate gradient geometry for zones
  const gradientGeometry = useMemo(
    () => calculateGradientGeometryUI(riskZones),
    [riskZones]
  );

  return (
    <div
      ref={sliderRef}
      tabIndex={disabled ? -1 : 0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative select-none rounded",
        disabled && "opacity-50",
        className
      )}
      style={{
        minWidth: CHART_CONSTANTS.MIN_WIDTH,
        width: "100%",
        height: CHART_CONSTANTS.HEIGHT,
        cursor: disabled ? "default" : "pointer",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Chart visualization */}
      {chart && chart.length > 0 ? (
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: CHART_CONSTANTS.CHART_MAX_HEIGHT }}
        >
          <svg
            width="100%"
            height={CHART_CONSTANTS.CHART_MAX_HEIGHT}
            viewBox={`0 0 100 ${CHART_CONSTANTS.CHART_MAX_HEIGHT}`}
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
                height={CHART_CONSTANTS.CHART_MAX_HEIGHT}
                fill={`url(#${svgId}-gradient-${index + 1})`}
              />
            ))}

            {/* Histogram bars - each bar represents debt at that interest rate */}
            {(chart || []).map((barValue: number, index: number) => {
              const barWidth = 100 / (chart?.length || 1);
              const x = index * barWidth;
              const barHeight = barValue * CHART_CONSTANTS.CHART_MAX_HEIGHT;
              const y = CHART_CONSTANTS.CHART_MAX_HEIGHT - barHeight;
              const barPosition = index / (chart?.length || 1);
              const isActive = barPosition <= value;

              // Determine bar color - ALL bars colored by their risk zone, active ones are brighter
              const barColor = getHandleColorFromPosition(
                barPosition,
                riskZones?.highRiskThreshold,
                riskZones?.mediumRiskThreshold
              );

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

            {/* Base line - always dark grey */}
            <rect
              x="0"
              y={CHART_CONSTANTS.CHART_MAX_HEIGHT - 2}
              width="100"
              height="2"
              fill="#475569"
            />

            {/* Active line - matches handle color */}
            <rect
              x="0"
              y={CHART_CONSTANTS.CHART_MAX_HEIGHT - 2}
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
          style={{ height: CHART_CONSTANTS.BAR_HEIGHT }}
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: CHART_CONSTANTS.BAR_HEIGHT / 2 }}
          >
            {/* Background with risk zone gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right,
                  ${gradientColors[0]} 0%,
                  ${gradientColors[1]} calc(${
                  riskZones.highRiskThreshold * 100
                }% - ${CHART_CONSTANTS.GRADIENT_TRANSITION_BLUR}%),
                  ${gradientColors[2]} calc(${
                  riskZones.highRiskThreshold * 100
                }% + ${CHART_CONSTANTS.GRADIENT_TRANSITION_BLUR}%),
                  ${gradientColors[3]} calc(${
                  riskZones.mediumRiskThreshold * 100
                }% - ${CHART_CONSTANTS.GRADIENT_TRANSITION_BLUR}%),
                  ${gradientColors[4]} calc(${
                  riskZones.mediumRiskThreshold * 100
                }% + ${CHART_CONSTANTS.GRADIENT_TRANSITION_BLUR}%),
                  ${gradientColors[4]} 100%)`,
              }}
            />
          </div>
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
                "border-2 shadow-md",
                isDragging && "scale-105 shadow-lg"
              )}
              style={{
                borderColor: disabled ? "#cbd5e1" : "#64748b",
                backgroundColor: disabled ? "#f1f5f9" : currentHandleColor,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
