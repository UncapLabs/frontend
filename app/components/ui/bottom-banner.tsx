import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const bottomBannerVariants = cva(
  "sticky bottom-0 left-0 right-0 shadow-[20px_-13px_34px_0px_rgba(0,0,0,0.03)] border-t z-50",
  {
    variants: {
      variant: {
        warning: "bg-white border-neutral-100",
        info: "bg-white border-neutral-100",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);

const iconVariants = cva(
  "w-8 h-8 sm:w-10 sm:h-10 px-2 py-2 sm:px-3 sm:py-3 rounded-lg sm:rounded-xl inline-flex justify-center items-center gap-2.5 shrink-0",
  {
    variants: {
      variant: {
        warning: "bg-[#FFF4E5]",
        info: "bg-[#F0F8FF]",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);

const buttonVariants = cva(
  "w-full sm:w-auto px-4 py-3 sm:py-4 rounded-md inline-flex items-center justify-center gap-2 sm:gap-3 transition-colors border-0 h-auto shrink-0 text-white text-xs font-medium font-sora leading-tight whitespace-nowrap",
  {
    variants: {
      variant: {
        warning: "bg-[#FF9300] hover:bg-[#e88500]",
        info: "bg-[#006cff] hover:bg-[#0056CC]",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);

interface BottomBannerProps extends VariantProps<typeof bottomBannerVariants> {
  show: boolean;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export default function BottomBanner({
  show,
  title,
  description,
  buttonText,
  onButtonClick,
  icon,
  variant = "warning",
  className,
}: BottomBannerProps) {
  if (!show) return null;

  const defaultIcon = (
    <svg
      className="w-3 h-2 sm:w-4 sm:h-3"
      viewBox="0 0 16 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.20549 10.8855L0.820557 5.49933L2.61511 3.70478L6.20549 7.29389L13.3837 0.114401L15.1795 1.91022L6.20549 10.8855Z"
        fill="#FF9300"
      />
    </svg>
  );

  return (
    <div className={cn(bottomBannerVariants({ variant }), className)}>
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className={cn(iconVariants({ variant }))}>
              {icon || defaultIcon}
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-medium font-sora text-[#242424] leading-none">
                {title}
              </h3>
              <p className="text-[11px] sm:text-xs font-normal font-sora text-[#94938D] line-clamp-2 sm:line-clamp-none">
                {description}
              </p>
            </div>
          </div>
          <button
            onClick={onButtonClick}
            className={cn(buttonVariants({ variant }))}
          >
            {buttonText}
            <svg
              className="w-3 h-2 sm:w-3 sm:h-2"
              viewBox="0 0 12 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.22267 5.20709L0.22267 3.79291L9.2932 3.79291L7.00012 1.49982L8.00065 0.499998L11.9999 4.5L8.00064 8.5L7.00011 7.50018L9.2932 5.20709L0.22267 5.20709Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
