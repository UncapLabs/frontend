import { Separator } from "~/components/ui/separator";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { BorrowForm } from "~/components/borrow/borrow-form";
import { useCallback, useState } from "react";
import { type BorrowFormData } from "~/types/borrow";
import { getAnnualInterestRate } from "~/lib/utils/calc";
import type { Route } from "./+types/dashboard";
import { useAccount } from "@starknet-react/core";
import {
  INTEREST_RATE_SCALE_DOWN_FACTOR,
  TBTC_TOKEN,
  LBTC_TOKEN,
} from "~/lib/contracts/constants";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { useBorrow } from "~/hooks/use-borrow";
import { useQueryState } from "nuqs";

function Borrow() {
  const { address } = useAccount();

  // Check if we have a transaction hash in URL
  const [urlTransactionHash, setUrlTransactionHash] = useQueryState("tx", {
    defaultValue: "",
  });

  // Store selected collateral token in URL
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useQueryState(
    "collateral",
    {
      defaultValue: TBTC_TOKEN.symbol,
    }
  );

  // Get the selected token object from the symbol
  const selectedCollateralToken = selectedTokenSymbol === LBTC_TOKEN.symbol ? LBTC_TOKEN : TBTC_TOKEN;

  // State for form submission
  const [borrowFormData, setBorrowFormData] = useState<BorrowFormData | null>(null);

  // Use the borrow hook
  const {
    send,
    isPending,
    isSending,
    isError: isTransactionError,
    error: transactionError,
    transactionHash,
    isReady,
    isSuccess: isTransactionSuccess,
  } = useBorrow({
    collateralAmount: borrowFormData?.collateralAmount,
    borrowAmount: borrowFormData?.borrowAmount,
    annualInterestRate: borrowFormData ? getAnnualInterestRate(borrowFormData.interestRate) : 0n,
    collateralToken: selectedCollateralToken,
  });

  // Handle form submission
  const handleSubmit = useCallback(async (values: BorrowFormData) => {
    if (!isReady) {
      if (!address) {
        toast.error("Please connect your wallet");
      }
      return;
    }

    setBorrowFormData(values);

    try {
      await send();
    } catch (error) {
      console.error("Transaction error:", error);
    }
  }, [isReady, address, send]);

  const handleNewBorrow = () => {
    setBorrowFormData(null);
    setUrlTransactionHash("");
  };

  // Update URL when we get a transaction hash
  if (transactionHash && transactionHash !== urlTransactionHash) {
    setUrlTransactionHash(transactionHash);
  }

  // Show transaction UI if we have a hash in URL (single source of truth)
  const shouldShowTransactionUI = !!urlTransactionHash;

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">Borrow</h1>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="md:col-span-2">
          {shouldShowTransactionUI ? (
            <TransactionStatus
              transactionHash={transactionHash}
              isError={isTransactionError}
              isSuccess={isTransactionSuccess}
              error={transactionError}
              successTitle="Borrow Successful!"
              successSubtitle="Your position has been created successfully."
              details={
                borrowFormData && urlTransactionHash
                  ? [
                      {
                        label: "Collateral Deposited",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={borrowFormData.collateralAmount}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {selectedTokenSymbol}
                          </>
                        ),
                      },
                      {
                        label: "Amount Borrowed",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={borrowFormData.borrowAmount}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />{" "}
                            bitUSD
                          </>
                        ),
                      },
                      {
                        label: "Interest Rate (APR)",
                        value: `${
                          Number(getAnnualInterestRate(borrowFormData.interestRate)) /
                          Number(INTEREST_RATE_SCALE_DOWN_FACTOR)
                        }%`,
                      },
                    ]
                  : undefined
              }
              onComplete={handleNewBorrow}
              completeButtonText="Create New Position"
            />
          ) : (
            <BorrowForm
              mode="new"
              onSubmit={handleSubmit}
              isSubmitting={isSending || isPending}
              submitButtonText={isSending ? "Confirm in wallet..." : isPending ? "Confirming..." : undefined}
              selectedCollateralToken={selectedCollateralToken}
              onCollateralTokenChange={(token) => setSelectedTokenSymbol(token.symbol)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Borrow;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BitUSD" },
    { name: "This is bitUSD", content: "Welcome to bitUSD!" },
  ];
}