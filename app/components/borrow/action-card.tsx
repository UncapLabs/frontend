import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: "blue" | "green" | "red";
  onClick: () => void;
  disabled?: boolean;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  disabled = false,
}: ActionCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
    },
  };

  return (
    <Card
      className={`border border-slate-200 shadow-sm transition-all cursor-pointer hover:shadow-md ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={() => !disabled && onClick()}
    >
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colorClasses[color].bg}`}>
            <Icon className={`h-6 w-6 ${colorClasses[color].text}`} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" disabled={disabled}>
          <ArrowLeft className="h-5 w-5 rotate-180" />
        </Button>
      </CardContent>
    </Card>
  );
}