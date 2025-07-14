import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { BorrowForm } from "~/components/borrow/borrow-form";
import { useCallback, useState } from "react";
import { type BorrowFormData } from "~/types/borrow";
import { getAnnualInterestRate } from "~/lib/utils/calc";
import type { Route } from "./+types/borrow.$troveId";
import { useParams, useNavigate } from "react-router";
import { useAccount } from "@starknet-react/core";
import {
  INTEREST_RATE_SCALE_DOWN_FACTOR,
  TBTC_TOKEN,
} from "~/lib/contracts/constants";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { useAdjustTrove } from "~/hooks/use-adjust-trove";
import { useTroveData } from "~/hooks/use-trove-data";
import { useQueryState } from "nuqs";

function AdjustTrove() {
  const { address } = useAccount();
  const { troveId } = useParams();
  const navigate = useNavigate();

  // Fetch existing trove data
  const { troveData, isLoading: isTroveLoading } = useTroveData(troveId);

  // Check if we have a transaction hash in URL
  const [urlTransactionHash, setUrlTransactionHash] = useQueryState("tx", {
    defaultValue: "",
  });

  // State for form submission
  const [adjustFormData, setAdjustFormData] = useState<BorrowFormData | null>(null);

  // Use the adjust trove hook
  const {
    send,
    isPending,
    isSending,
    isError: isTransactionError,
    error: transactionError,
    transactionHash,
    isReady,
    isSuccess: isTransactionSuccess,
    changes,
  } = useAdjustTrove({
    troveId: troveData?.troveId,
    currentCollateral: troveData?.collateral,
    currentDebt: troveData?.debt,
    currentInterestRate: troveData?.annualInterestRate,
    newCollateral: adjustFormData?.collateralAmount,
    newDebt: adjustFormData?.borrowAmount,
    newInterestRate: adjustFormData ? getAnnualInterestRate(adjustFormData.interestRate) : undefined,
  });

  // Handle form submission
  const handleSubmit = useCallback(async (values: BorrowFormData) => {
    if (!isReady) {
      if (!address) {
        toast.error("Please connect your wallet");
      }
      return;
    }

    setAdjustFormData(values);

    try {
      await send();
    } catch (error) {
      console.error("Transaction error:", error);
    }
  }, [isReady, address, send]);

  const handleComplete = () => {
    navigate("/positions");
  };

  // Update URL when we get a transaction hash
  if (transactionHash && transactionHash !== urlTransactionHash) {
    setUrlTransactionHash(transactionHash);
  }

  // Show transaction UI if we have a hash in URL (single source of truth)
  const shouldShowTransactionUI = !!urlTransactionHash;

  if (isTroveLoading || !troveData) {
    return (
      <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="flex justify-between items-baseline">
          <h1 className="text-3xl font-bold mb-2 text-slate-800">Adjust Position</h1>
        </div>
        <Separator className="mb-8 bg-slate-200" />
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-600">Loading trove data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/positions")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            Adjust Position #{troveId}
          </h1>
        </div>
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
              successTitle="Position Adjusted!"
              successSubtitle="Your position has been updated successfully."
              details={
                changes && adjustFormData && urlTransactionHash
                  ? [
                      changes.hasCollateralChange && {
                        label: changes.isCollIncrease ? "Collateral Added" : "Collateral Withdrawn",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={Number(changes.collateralChange) / 1e18}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {TBTC_TOKEN.symbol}
                          </>
                        ),
                      },
                      changes.hasDebtChange && {
                        label: changes.isDebtIncrease ? "Borrowed More" : "Debt Repaid",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={Number(changes.debtChange) / 1e18}
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
                          Number(getAnnualInterestRate(adjustFormData.interestRate)) /
                          Number(INTEREST_RATE_SCALE_DOWN_FACTOR)
                        }%`,
                      },
                    ].filter(Boolean) as any
                  : undefined
              }
              onComplete={handleComplete}
              completeButtonText="View Positions"
            />
          ) : (
            <BorrowForm
              mode="adjust"
              troveData={troveData}
              onSubmit={handleSubmit}
              isSubmitting={isSending || isPending}
              submitButtonText={isSending ? "Confirm in wallet..." : isPending ? "Adjusting..." : undefined}
              changes={changes || undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdjustTrove;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Adjust Position - BitUSD" },
    { name: "description", content: "Adjust your BitUSD borrowing position" },
  ];
}