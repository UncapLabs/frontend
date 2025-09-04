import { AlertTriangle, CheckCircle, type LucideIcon } from "lucide-react";

export type RiskLevel = "high" | "medium" | "low";

interface RiskIndicatorProps {
  riskLevel: RiskLevel | null;
}

interface RiskConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
  label: string;
  description: string;
}

const getRiskConfig = (riskLevel: RiskLevel): RiskConfig => {
  switch (riskLevel) {
    case "high": // Note: "high" means high debt in front = LOW risk
      return {
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: CheckCircle,
        label: "Low Redemption Risk",
        description: "Your position is well-protected from redemptions",
      };
    case "medium":
      return {
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: AlertTriangle,
        label: "Medium Redemption Risk",
        description: "Your position has moderate redemption exposure",
      };
    case "low": // Note: "low" means low debt in front = HIGH risk
      return {
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: AlertTriangle,
        label: "High Redemption Risk",
        description: "Your position is at risk of being redeemed",
      };
  }
};

export function RiskIndicator({ riskLevel }: RiskIndicatorProps) {
  if (!riskLevel) return null;

  const config = getRiskConfig(riskLevel);

  return (
    <div
      className={`mt-3 p-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start gap-2">
        <config.icon
          className={`h-4 w-4 mt-0.5 ${config.color}`}
        />
        <div className="flex-1">
          <p
            className={`text-xs font-medium ${config.color}`}
          >
            {config.label}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}
