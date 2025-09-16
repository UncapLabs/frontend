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

export function RedemptionInfo({
  variant = "inline",
  className,
}: RedemptionInfoProps) {
  const content = (
    <>
      <p className="mb-3">
        Redemptions help maintain USDU's peg in a decentralized way. If a user
        is redeemed, their collateral and debt are reduced equally, resulting in
        no net loss.
      </p>
      <ul className="space-y-2 text-sm">
        <li className="flex items-start">
          <span className="text-blue-500 mr-2">•</span>
          <span>Redemptions occur when USDU drops below $1</span>
        </li>
        <li className="flex items-start">
          <span className="text-blue-500 mr-2">•</span>
          <span>
            Redemptions first affect loans with the lowest interest rate
          </span>
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
          <button
            className="inline-flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
            style={{ width: "10px", height: "10px", padding: "0" }}
          >
            <svg 
              width="10" 
              height="10" 
              viewBox="0 0 10 10" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "10px", height: "10px" }}
            >
              <path 
                d="M5.1897 7.125C5.3172 7.125 5.42415 7.0818 5.51055 6.9954C5.59695 6.909 5.64 6.8022 5.6397 6.675V4.875C5.6397 4.7475 5.5965 4.6407 5.5101 4.5546C5.4237 4.4685 5.3169 4.4253 5.1897 4.425C5.0625 4.4247 4.9557 4.4679 4.8693 4.5546C4.7829 4.6413 4.7397 4.7481 4.7397 4.875V6.675C4.7397 6.8025 4.7829 6.90945 4.8693 6.99585C4.9557 7.08225 5.0625 7.1253 5.1897 7.125ZM5.1897 3.525C5.3172 3.525 5.42415 3.4818 5.51055 3.3954C5.59695 3.309 5.64 3.2022 5.6397 3.075C5.6394 2.9478 5.5962 2.841 5.5101 2.7546C5.424 2.6682 5.3172 2.625 5.1897 2.625C5.0622 2.625 4.9554 2.6682 4.8693 2.7546C4.7832 2.841 4.74 2.9478 4.7397 3.075C4.7394 3.2022 4.7826 3.30915 4.8693 3.39585C4.956 3.48255 5.0628 3.5256 5.1897 3.525ZM5.1897 9.375C4.5672 9.375 3.9822 9.2568 3.4347 9.0204C2.8872 8.784 2.41095 8.46345 2.00595 8.05875C1.60095 7.65405 1.2804 7.1778 1.0443 6.63C0.808198 6.0822 0.689998 5.4972 0.689698 4.875C0.689398 4.2528 0.807598 3.6678 1.0443 3.12C1.281 2.5722 1.60155 2.09595 2.00595 1.69125C2.41035 1.28655 2.8866 0.966 3.4347 0.7296C3.9828 0.4932 4.5678 0.375 5.1897 0.375C5.8116 0.375 6.3966 0.4932 6.9447 0.7296C7.49279 0.966 7.96905 1.28655 8.37345 1.69125C8.77785 2.09595 9.09855 2.5722 9.33554 3.12C9.57255 3.6678 9.69059 4.2528 9.6897 4.875C9.6888 5.4972 9.57059 6.0822 9.3351 6.63C9.0996 7.1778 8.77905 7.65405 8.37345 8.05875C7.96785 8.46345 7.4916 8.78415 6.9447 9.02085C6.3978 9.25755 5.8128 9.3756 5.1897 9.375ZM5.1897 8.475C6.1947 8.475 7.04595 8.12625 7.74344 7.42875C8.44094 6.73125 8.78969 5.88 8.78969 4.875C8.78969 3.87 8.44094 3.01875 7.74344 2.32125C7.04595 1.62375 6.1947 1.275 5.1897 1.275C4.1847 1.275 3.33345 1.62375 2.63595 2.32125C1.93845 3.01875 1.5897 3.87 1.5897 4.875C1.5897 5.88 1.93845 6.73125 2.63595 7.42875C3.33345 8.12625 4.1847 8.475 5.1897 8.475Z" 
                fill="#242424"
              />
            </svg>
          </button>
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
      <svg 
        width="10" 
        height="10" 
        viewBox="0 0 10 10" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
      >
        <path 
          d="M5.1897 7.125C5.3172 7.125 5.42415 7.0818 5.51055 6.9954C5.59695 6.909 5.64 6.8022 5.6397 6.675V4.875C5.6397 4.7475 5.5965 4.6407 5.5101 4.5546C5.4237 4.4685 5.3169 4.4253 5.1897 4.425C5.0625 4.4247 4.9557 4.4679 4.8693 4.5546C4.7829 4.6413 4.7397 4.7481 4.7397 4.875V6.675C4.7397 6.8025 4.7829 6.90945 4.8693 6.99585C4.9557 7.08225 5.0625 7.1253 5.1897 7.125ZM5.1897 3.525C5.3172 3.525 5.42415 3.4818 5.51055 3.3954C5.59695 3.309 5.64 3.2022 5.6397 3.075C5.6394 2.9478 5.5962 2.841 5.5101 2.7546C5.424 2.6682 5.3172 2.625 5.1897 2.625C5.0622 2.625 4.9554 2.6682 4.8693 2.7546C4.7832 2.841 4.74 2.9478 4.7397 3.075C4.7394 3.2022 4.7826 3.30915 4.8693 3.39585C4.956 3.48255 5.0628 3.5256 5.1897 3.525ZM5.1897 9.375C4.5672 9.375 3.9822 9.2568 3.4347 9.0204C2.8872 8.784 2.41095 8.46345 2.00595 8.05875C1.60095 7.65405 1.2804 7.1778 1.0443 6.63C0.808198 6.0822 0.689998 5.4972 0.689698 4.875C0.689398 4.2528 0.807598 3.6678 1.0443 3.12C1.281 2.5722 1.60155 2.09595 2.00595 1.69125C2.41035 1.28655 2.8866 0.966 3.4347 0.7296C3.9828 0.4932 4.5678 0.375 5.1897 0.375C5.8116 0.375 6.3966 0.4932 6.9447 0.7296C7.49279 0.966 7.96905 1.28655 8.37345 1.69125C8.77785 2.09595 9.09855 2.5722 9.33554 3.12C9.57255 3.6678 9.69059 4.2528 9.6897 4.875C9.6888 5.4972 9.57059 6.0822 9.3351 6.63C9.0996 7.1778 8.77905 7.65405 8.37345 8.05875C7.96785 8.46345 7.4916 8.78415 6.9447 9.02085C6.3978 9.25755 5.8128 9.3756 5.1897 9.375ZM5.1897 8.475C6.1947 8.475 7.04595 8.12625 7.74344 7.42875C8.44094 6.73125 8.78969 5.88 8.78969 4.875C8.78969 3.87 8.44094 3.01875 7.74344 2.32125C7.04595 1.62375 6.1947 1.275 5.1897 1.275C4.1847 1.275 3.33345 1.62375 2.63595 2.32125C1.93845 3.01875 1.5897 3.87 1.5897 4.875C1.5897 5.88 1.93845 6.73125 2.63595 7.42875C3.33345 8.12625 4.1847 8.475 5.1897 8.475Z" 
          fill="#3B82F6"
        />
      </svg>
      <AlertTitle className="text-blue-900">Redemptions</AlertTitle>
      <AlertDescription className="text-blue-800">{content}</AlertDescription>
    </Alert>
  );
}
