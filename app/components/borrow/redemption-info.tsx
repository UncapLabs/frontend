import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface RedemptionInfoProps {
  variant?: "inline" | "modal";
  className?: string;
}

export function RedemptionInfo({ variant = "inline", className }: RedemptionInfoProps) {
  const content = (
    <>
      <p className="mb-3">
        Redemptions help maintain USDU's peg in a decentralized way. If a user is redeemed, 
        their collateral and debt are reduced equally, resulting in no net loss.
      </p>
      <ul className="space-y-2 text-sm">
        <li className="flex items-start">
          <span className="text-blue-500 mr-2">•</span>
          <span>Redemptions occur when USDU drops below $1</span>
        </li>
        <li className="flex items-start">
          <span className="text-blue-500 mr-2">•</span>
          <span>Redemptions first affect loans with the lowest interest rate</span>
        </li>
        <li className="flex items-start">
          <span className="text-blue-500 mr-2">•</span>
          <span>Raising the interest rate reduces your redemption risk</span>
        </li>
      </ul>
    </>
  );

  if (variant === "modal") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-full hover:bg-slate-100"
          >
            <Info className="h-3.5 w-3.5 text-slate-500" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Understanding Redemptions</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="text-slate-600">{content}</div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Alert className={`bg-blue-50 border-blue-200 ${className}`}>
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">Redemptions</AlertTitle>
      <AlertDescription className="text-blue-800">
        {content}
      </AlertDescription>
    </Alert>
  );
}