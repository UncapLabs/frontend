import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { AlertTriangle, Info } from "lucide-react";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import type { Route } from "./+types/borrow.$troveId.close";
import { useParams, useNavigate } from "react-router";
import { useAccount, useBalance } from "@starknet-react/core";
import {
  UBTC_TOKEN,
  GBTC_TOKEN,
  USDU_TOKEN,
  type CollateralType,
  MIN_DEBT,
} from "~/lib/contracts/constants";
import { NumericFormat } from "react-number-format";
import { useTroveData } from "~/hooks/use-trove-data";
import { useCloseTrove } from "~/hooks/use-close-trove";
import { useQueryState } from "nuqs";
import { useState, useCallback } from "react";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { toast } from "sonner";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { BorrowingRestrictionsAlert } from "~/components/borrow/borrowing-restrictions-alert";

function ClosePosition() {
  const { address } = useAccount();
  const { troveId } = useParams();
  const navigate = useNavigate();
  const { connectWallet } = useWalletConnect();

  // State for confirmation
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Get collateral type from URL or default to UBTC
  const [troveCollateralType] = useQueryState("type", {
    defaultValue: "UBTC",
  });

  // Fetch existing trove data
  const { position, isLoading: isTroveLoading } = useTroveData(troveId);

  // Get the collateral token based on collateral type
  const selectedCollateralToken =
    troveCollateralType === "GBTC" ? GBTC_TOKEN : UBTC_TOKEN;

  const collateralType = selectedCollateralToken.symbol as CollateralType;

  const { data: usduBalance } = useBalance({
    token: USDU_TOKEN.address,
    address: address,
    refetchInterval: 30000,
  });

  const {
    send,
    isPending,
    isSending,
    error: transactionError,
    transactionHash,
    currentState,
    formData,
    reset,
  } = useCloseTrove({
    troveId: position?.id,
    debt: position?.borrowedAmount,
    collateral: position?.collateralAmount,
    collateralType: troveCollateralType as CollateralType,
  });

  // Check if user has enough USDU to repay
  const usduBal = usduBalance
    ? Number(usduBalance.value) / 10 ** USDU_TOKEN.decimals
    : 0;
  const hasEnoughBalance = position
    ? usduBal >= position.borrowedAmount
    : false;

  // Check trove status
  const isLiquidated = position?.status === "liquidated";
  const isZombie =
    position?.status === "redeemed" && position?.borrowedAmount < MIN_DEBT;
  const isRedeemed = position?.status === "redeemed";

  const handleClosePosition = async () => {
    if (!address) {
      await connectWallet();
      return;
    }

    if (!isConfirmed) {
      toast.error("Please confirm that you want to close this position");
      return;
    }

    if (!hasEnoughBalance) {
      toast.error("Insufficient USDU balance to repay debt");
      return;
    }

    try {
      await send();
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  const handleComplete = useCallback(() => {
    if (currentState === "error") {
      // Reset for retry
      reset();
      setIsConfirmed(false);
    } else {
      // Navigate on success
      navigate("/");
    }
  }, [navigate, currentState, reset]);

  if (isTroveLoading || !position) {
    return (
      <>
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">
          Close Position
        </h2>
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-600">Loading position data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">
        {isLiquidated ? "Liquidated Position" : "Close Position"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="md:col-span-2">
          {["pending", "success", "error"].includes(currentState) ? (
            <TransactionStatus
              transactionHash={transactionHash}
              isError={currentState === "error"}
              isSuccess={currentState === "success"}
              error={
                transactionError ? new Error(transactionError.message) : null
              }
              successTitle="Position Closed!"
              successSubtitle="Your position has been closed and collateral returned."
              details={
                currentState === "success" &&
                formData.debt &&
                formData.collateral
                  ? [
                      {
                        label: "Debt Repaid",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={formData.debt}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />{" "}
                            USDU
                          </>
                        ),
                      },
                      {
                        label: "Collateral Returned",
                        value: (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={formData.collateral}
                              thousandSeparator=","
                              decimalScale={7}
                              fixedDecimalScale={false}
                            />{" "}
                            {selectedCollateralToken.symbol}
                          </>
                        ),
                      },
                    ]
                  : undefined
              }
              onComplete={handleComplete}
              completeButtonText={
                currentState === "error" ? "Try Again" : "Back to Dashboard"
              }
            />
          ) : isLiquidated ? (
            // Liquidated Position UI
            <div className="space-y-6">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <div className="space-y-2">
                    <p className="font-semibold">
                      This position has been liquidated
                    </p>
                    <p>
                      The collateral has been sold to cover the debt. Any excess
                      collateral from this and other liquidated positions can be
                      claimed from the surplus claim page.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Info className="h-12 w-12 text-slate-400 mx-auto" />
                    <h3 className="font-semibold text-lg text-slate-800">
                      Check for Collateral Surplus
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      If there was excess collateral after liquidation, you can
                      claim it along with surplus from any other liquidated
                      positions.
                    </p>
                    <div className="flex gap-3 justify-center pt-2">
                      <Button
                        onClick={() => navigate("/claim")}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      >
                        Go to Claim Page
                      </Button>
                      <Button onClick={() => navigate("/")} variant="outline">
                        Back to Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Normal close position UI
            <div className="space-y-6">
              {/* Borrowing Restrictions Alert */}
              <BorrowingRestrictionsAlert collateralType={collateralType} />

              {/* Warning Card */}
              <Card className="border border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-red-800">
                        Are you sure you want to close this position?
                      </h3>
                      <p className="text-sm text-red-700">
                        This action will repay your entire debt and return your
                        collateral. This cannot be undone.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Special Status Warnings */}
              {(isZombie || isRedeemed) && (
                <Card className="border border-amber-200 bg-amber-50">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <h3 className="font-semibold text-amber-800">
                          {isZombie ? "Zombie Position" : "Redeemed Position"}
                        </h3>
                        <p className="text-sm text-amber-700">
                          {isZombie
                            ? "This position has fallen below the minimum debt threshold. Closing it will return any remaining collateral."
                            : "This position has been partially redeemed."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Position Details */}
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg text-slate-800 mb-4">
                    Position Details
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-600">
                          Total Debt to Repay
                        </span>
                        <span className="font-semibold text-lg">
                          <NumericFormat
                            displayType="text"
                            value={position.borrowedAmount}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          USDU
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-600">
                          Your USDU Balance
                        </span>
                        <span
                          className={`font-medium ${
                            hasEnoughBalance ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          <NumericFormat
                            displayType="text"
                            value={usduBal}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          USDU
                        </span>
                      </div>

                      {!hasEnoughBalance && (
                        <div className="text-sm text-red-600 mt-2">
                          ⚠️ Insufficient USDU balance. You need{" "}
                          <NumericFormat
                            displayType="text"
                            value={position.borrowedAmount - usduBal}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          more USDU to close this position.
                        </div>
                      )}
                    </div>

                    <Separator className="bg-slate-200" />

                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-600">
                          Collateral to Return
                        </span>
                        <span className="font-semibold text-lg">
                          <NumericFormat
                            displayType="text"
                            value={position.collateralAmount}
                            thousandSeparator=","
                            decimalScale={7}
                            fixedDecimalScale={false}
                          />{" "}
                          {selectedCollateralToken.symbol}
                        </span>
                      </div>
                    </div>

                    {/* Confirmation Checkbox */}
                    <div className="flex items-start gap-3 mt-6">
                      <input
                        type="checkbox"
                        id="confirm-close"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        disabled={!hasEnoughBalance || isSending || isPending}
                      />
                      <label
                        htmlFor="confirm-close"
                        className="text-sm text-slate-700 cursor-pointer"
                      >
                        I understand that closing this position will repay{" "}
                        <span className="font-medium">
                          <NumericFormat
                            displayType="text"
                            value={position.borrowedAmount}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          USDU
                        </span>{" "}
                        and return my collateral.
                      </label>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={handleClosePosition}
                      disabled={
                        (address && (!hasEnoughBalance || !isConfirmed)) ||
                        isSending ||
                        isPending
                      }
                      variant="destructive"
                      className="w-full"
                    >
                      {!address
                        ? "Connect Wallet"
                        : isSending
                        ? "Confirm in wallet..."
                        : isPending
                        ? "Transaction pending..."
                        : !hasEnoughBalance
                        ? "Insufficient USDU Balance"
                        : !isConfirmed
                        ? "Please confirm to proceed"
                        : "Close Position"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Panel - Summary */}
        <div className="md:col-span-1">
          <Card className="border border-slate-200 shadow-sm sticky top-8">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg text-slate-800">
                {isLiquidated ? "Liquidation Summary" : "Closing Summary"}
              </h3>

              <div className="space-y-3 text-sm">
                {isLiquidated ? (
                  <>
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">
                        What is liquidation?
                      </h4>
                      <ul className="space-y-1 text-slate-600">
                        <li>• Your collateral was sold to cover debt</li>
                        <li>• The position is now closed</li>
                        <li>• Excess collateral can be claimed</li>
                        <li>• No debt remains to repay</li>
                      </ul>
                    </div>

                    <Separator className="bg-slate-100" />

                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">
                        Next Steps
                      </h4>
                      <ul className="space-y-1 text-slate-600">
                        <li>• Visit the claim page to check for surplus</li>
                        <li>• Claim surplus from all liquidated positions</li>
                        <li>• Open a new position if desired</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">
                        What happens when you close?
                      </h4>
                      <ul className="space-y-1 text-slate-600">
                        <li>• Your entire debt is repaid</li>
                        <li>• All collateral is returned to you</li>
                        <li>• The position is permanently closed</li>
                        <li>• No further fees or interest accrue</li>
                      </ul>
                    </div>

                    <Separator className="bg-slate-100" />

                    <div>
                      <h4 className="font-medium text-slate-700 mb-1">
                        Requirements
                      </h4>
                      <ul className="space-y-1 text-slate-600">
                        <li>• Sufficient USDU to repay debt</li>
                        <li>• Gas fees for transaction</li>
                      </ul>
                    </div>
                  </>
                )}

                {(isZombie || isRedeemed) && (
                  <>
                    <Separator className="bg-slate-100" />
                    <div>
                      <h4 className="font-medium text-amber-700 mb-1">
                        Special Status
                      </h4>
                      <p className="text-sm text-amber-600">
                        {isZombie
                          ? "Zombie positions should be closed to recover collateral."
                          : "Check for surplus collateral after closing."}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default ClosePosition;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Close Position - USDU" },
    { name: "description", content: "Close your USDU borrowing position" },
  ];
}
