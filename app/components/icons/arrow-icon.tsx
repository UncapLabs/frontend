import { memo } from "react";

interface ArrowIconProps {
  size?: number; // Size of the icon (default: 70)
  className?: string;
  outerCircleColor?: string; // Color of outer circle (default: white)
  innerCircleColor?: string; // Color of inner circle (default: #242424)
  arrowColor?: string; // Color of arrow (default: white)
  direction?: "up" | "down" | "left" | "right"; // Arrow direction
  onClick?: () => void;
}

export const ArrowIcon = memo(function ArrowIcon({
  size = 70,
  className = "",
  outerCircleColor = "#FFFFFF",
  innerCircleColor = "#242424",
  arrowColor = "#FFFFFF",
  direction = "down",
  onClick,
}: ArrowIconProps) {
  // Calculate proportional sizes based on original 70px design
  const scale = size / 70;
  const innerCircleSize = 56 * scale;
  const innerCircleOffset = 7 * scale;

  // Rotation for different arrow directions
  const rotation = {
    down: 0,
    up: 180,
    right: -90,
    left: 90,
  }[direction];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 70 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Outer circle */}
      <circle cx="35" cy="35" r="35" fill={outerCircleColor} />
      
      {/* Inner circle */}
      <circle cx="35" cy="35" r="28" fill={innerCircleColor} />
      
      {/* Arrow path */}
      <path
        d="M33.9136 39.2907L33.9624 28.4776C33.9627 28.3742 34.0026 28.2865 34.0819 28.2145C34.1608 28.1422 34.2524 28.1059 34.3566 28.1055C34.4608 28.1051 34.5482 28.1407 34.6189 28.2121C34.6896 28.2835 34.7251 28.371 34.7255 28.4744L34.6978 39.2885L39.5876 34.3987C39.6666 34.3197 39.7592 34.28 39.8657 34.2797C39.9721 34.2793 40.0643 34.3185 40.1423 34.3973C40.2204 34.4761 40.2594 34.5681 40.2594 34.6734C40.2594 34.7787 40.2195 34.8712 40.1398 34.9509L34.7501 40.3407C34.6229 40.4678 34.4736 40.5317 34.3022 40.5323C34.1308 40.5329 33.9816 40.4701 33.8545 40.3438L28.5022 34.9915C28.4238 34.913 28.3851 34.8206 28.3862 34.7142C28.3874 34.6078 28.4268 34.5153 28.5047 34.4367C28.5826 34.3581 28.675 34.3187 28.7822 34.3183C28.8893 34.3179 28.9816 34.3568 29.0589 34.4348L33.9136 39.2907Z"
        fill={arrowColor}
        stroke={arrowColor}
      />
    </svg>
  );
});

// Responsive Arrow Icon with Tailwind classes
export const ResponsiveArrowIcon = memo(function ResponsiveArrowIcon({
  className = "",
  ...props
}: Omit<ArrowIconProps, "size"> & { className?: string }) {
  return (
    <div className={className}>
      {/* Mobile: 40px, Tablet: 50px, Desktop: 70px */}
      <ArrowIcon
        {...props}
        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-[70px] lg:h-[70px]"
        size={70}
      />
    </div>
  );
});
