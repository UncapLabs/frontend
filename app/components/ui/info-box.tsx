import { cn } from "~/lib/utils";
import { Info, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

interface InfoBoxProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  learnMoreUrl?: string;
  learnMoreText?: string;
  variant?: "blue" | "amber" | "green" | "red" | "neutral";
}

const variantStyles = {
  blue: "bg-[#CEE3FF] text-[#004BB2]",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  neutral: "bg-neutral-50 text-neutral-700",
};

export function InfoBox({
  title,
  icon,
  children,
  className,
  learnMoreUrl,
  learnMoreText,
  variant = "blue",
}: InfoBoxProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn(`${styles} rounded-[22px] p-6 space-y-4`, className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-base font-medium font-sora">{title}</h3>
        {icon}
      </div>

      <div className="space-y-4 font-sora">{children}</div>

      {learnMoreUrl && (
        <div className="pt-2">
          <a
            href={learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            {learnMoreText || "Learn more"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
