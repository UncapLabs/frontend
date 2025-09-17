import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { TransactionHistoryTable } from "./transaction-history-table";
import { useAccount } from "@starknet-react/core";
import { useTransactionStoreData } from "~/hooks/use-transaction-store-data";

// Custom Transaction History Icon
function TransactionHistoryIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 15.75C7.425 15.75 6.03125 15.272 4.81875 14.316C3.60625 13.36 2.81875 12.138 2.45625 10.65C2.40625 10.4625 2.44375 10.2907 2.56875 10.1347C2.69375 9.97875 2.8625 9.888 3.075 9.8625C3.275 9.8375 3.45625 9.875 3.61875 9.975C3.78125 10.075 3.89375 10.225 3.95625 10.425C4.25625 11.55 4.875 12.4688 5.8125 13.1813C6.75 13.8938 7.8125 14.25 9 14.25C10.4625 14.25 11.7032 13.7407 12.7222 12.7222C13.7413 11.7037 14.2505 10.463 14.25 9C14.2495 7.537 13.7403 6.2965 12.7222 5.2785C11.7043 4.2605 10.4635 3.751 9 3.75C8.1375 3.75 7.33125 3.95 6.58125 4.35C5.83125 4.75 5.2 5.3 4.6875 6H6C6.2125 6 6.39075 6.072 6.53475 6.216C6.67875 6.36 6.7505 6.538 6.75 6.75C6.7495 6.962 6.6775 7.14025 6.534 7.28475C6.3905 7.42925 6.2125 7.501 6 7.5H3C2.7875 7.5 2.6095 7.428 2.466 7.284C2.3225 7.14 2.2505 6.962 2.25 6.75V3.75C2.25 3.5375 2.322 3.3595 2.466 3.216C2.61 3.0725 2.788 3.0005 3 3C3.212 2.9995 3.39025 3.0715 3.53475 3.216C3.67925 3.3605 3.751 3.5385 3.75 3.75V4.7625C4.3875 3.9625 5.16575 3.34375 6.08475 2.90625C7.00375 2.46875 7.9755 2.25 9 2.25C9.9375 2.25 10.8158 2.42825 11.6348 2.78475C12.4538 3.14125 13.1663 3.62225 13.7723 4.22775C14.3783 4.83325 14.8595 5.54575 15.216 6.36525C15.5725 7.18475 15.7505 8.063 15.75 9C15.7495 9.937 15.5715 10.8152 15.216 11.6347C14.8605 12.4542 14.3793 13.1668 13.7723 13.7723C13.1653 14.3778 12.4528 14.859 11.6348 15.216C10.8168 15.573 9.9385 15.751 9 15.75ZM9.75 8.7L11.625 10.575C11.7625 10.7125 11.8313 10.8875 11.8313 11.1C11.8313 11.3125 11.7625 11.4875 11.625 11.625C11.4875 11.7625 11.3125 11.8312 11.1 11.8312C10.8875 11.8312 10.7125 11.7625 10.575 11.625L8.475 9.525C8.4 9.45 8.34375 9.36575 8.30625 9.27225C8.26875 9.17875 8.25 9.08175 8.25 8.98125V6C8.25 5.7875 8.322 5.6095 8.466 5.466C8.61 5.3225 8.788 5.2505 9 5.25C9.212 5.2495 9.39025 5.3215 9.53475 5.466C9.67925 5.6105 9.751 5.7885 9.75 6V8.7Z"
        fill="#242424"
      />
    </svg>
  );
}

export function TransactionHistoryButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();
  const { pendingCount } = useTransactionStoreData(address);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {pendingCount > 0 ? (
          <>
            <Loader2 className="h-[18px] w-[18px] animate-spin text-[#242424] dark:text-white" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] leading-none"
            >
              {pendingCount}
            </Badge>
          </>
        ) : (
          <span className="text-[#242424] dark:text-white">
            <TransactionHistoryIcon />
          </span>
        )}
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Transaction History
              {pendingCount > 0 && (
                <Badge variant="secondary">{pendingCount} pending</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <TransactionHistoryTable />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
