import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ArrowLeft, AlertTriangle, Info } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import type { Route } from "./+types/borrow.$troveId.close";
import { useParams, useNavigate } from "react-router";
import {
  useAccount,
  useBalance,
  useConnect,
  type Connector,
} from "@starknet-react/core";
import {
  type StarknetkitConnector,
  useStarknetkitConnectModal,
} from "starknetkit";
import {
  UBTC_TOKEN,
  GBTC_TOKEN,
  USDU_TOKEN,
  type CollateralType,
} from "~/lib/contracts/constants";
import { NumericFormat } from "react-number-format";
import { useTroveData } from "~/hooks/use-trove-data";
import { extractTroveId } from "~/lib/utils/position-helpers";
import { useCloseTrove } from "~/hooks/use-close-trove";
import { useQueryState } from "nuqs";
import { useState } from "react";

function ClosePosition() {
  const { address } = useAccount();
  const { troveId } = useParams();
  const navigate = useNavigate();
  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });

  // State for confirmation
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Get collateral type from URL or default to UBTC
  const [troveCollateralType] = useQueryState("type", {
    defaultValue: "UBTC",
  });

  // Fetch existing trove data
  const { position, isLoading: isTroveLoading } = useTroveData(troveId);

  // Check if we have a transaction hash in URL
  const [urlTransactionHash, setUrlTransactionHash] = useQueryState("tx", {
    defaultValue: "",
  });

  // Get the collateral token based on collateral type
  const selectedCollateralToken = troveCollateralType === "GBTC" ? GBTC_TOKEN : UBTC_TOKEN;

  const { data: usduBalance } = useBalance({
    token: USDU_TOKEN.address,
    address: address,
    refetchInterval: 30000,
  });

  // Use the close trove hook
  const {
    send,
    isPending,
    isSending,
    isError: isTransactionError,
    error: transactionError,
    transactionHash,
    isReady,
    isSuccess: isTransactionSuccess,
  } = useCloseTrove({
    troveId: position ? extractTroveId(position.id) : undefined,
    debt: position?.borrowedAmount,
    collateralType: troveCollateralType as CollateralType,
  });

  const handleComplete = () => {
    navigate("/positions");
  };

  // Handle wallet connection
  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    connect({ connector: connector as Connector });
  };

  // Update URL when we get a transaction hash
  if (transactionHash && transactionHash !== urlTransactionHash) {
    setUrlTransactionHash(transactionHash);
  }

  // Show transaction UI if we have a hash in URL (single source of truth)
  const shouldShowTransactionUI = !!urlTransactionHash;

  if (isTroveLoading || !position) {
    return (
      <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="flex justify-between items-baseline">
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            Close Position
          </h1>
        </div>
        <Separator className="mb-8 bg-slate-200" />
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-600">Loading trove data...</p>
        </div>
      </div>
    );
  }

  // Check if user has enough USDU to repay
  const usduBal = usduBalance
    ? Number(usduBalance.value) / 10 ** USDU_TOKEN.decimals
    : 0;
  const hasEnoughBalance = position ? usduBal >= position.borrowedAmount : false;

  // Check if trove is zombie or redeemed
  // TODO: Implement status check from trove data
  const isZombie = false;
  const isRedeemed = false;

  const handleClosePosition = async () => {
    if (!address) {
      await connectWallet();
      return;
    }

    if (!isConfirmed) {
      return;
    }

    try {
      await send();
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/borrow/${troveId}`)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            Close Position #{troveId}
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
              successTitle="Position Closed!"
              successSubtitle="Your position has been closed and collateral returned."
              details={[
                {
                  label: "Debt Repaid",
                  value: (
                    <>
                      <NumericFormat
                        displayType="text"
                        value={position.borrowedAmount}
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
                        value={position.collateralAmount}
                        thousandSeparator=","
                        decimalScale={7}
                        fixedDecimalScale={false}
                      />{" "}
                      {selectedCollateralToken.symbol}
                    </>
                  ),
                },
              ]}
              onComplete={handleComplete}
              completeButtonText="View Positions"
            />
          ) : (
            <div className="space-y-6">
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
                        This action will repay your entire debt and return your collateral.
                        This cannot be undone.
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
                            : "This position has been partially redeemed. You may have surplus collateral to claim."}
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
                        <span className={`font-medium ${hasEnoughBalance ? "text-green-600" : "text-red-600"}`}>
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
                        ? "Closing..."
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
                Closing Summary
              </h3>

              <div className="space-y-3 text-sm">
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
    </div>
  );
}

export default ClosePosition;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Close Position - USDU" },
    { name: "description", content: "Close your USDU borrowing position" },
  ];
}