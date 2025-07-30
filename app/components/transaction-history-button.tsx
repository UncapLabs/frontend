import React, { useState } from "react";
import { History, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { useTransactionHistory } from "~/hooks/use-transaction-history";
import { TransactionHistoryTable } from "./transaction-history-table";

export function TransactionHistoryButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { pendingCount } = useTransactionHistory();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        {pendingCount > 0 ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span className="hidden sm:inline">History</span>
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 min-w-[20px] px-1 text-xs"
            >
              {pendingCount}
            </Badge>
          </>
        ) : (
          <>
            <History className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">History</span>
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Transaction History
              {pendingCount > 0 && (
                <Badge variant="secondary">
                  {pendingCount} pending
                </Badge>
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