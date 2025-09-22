import { Button } from "~/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";
import { TransactionStatus } from "~/components/borrow/transaction-status";
import { InfoBox } from "~/components/ui/info-box";
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
import { useCallback } from "react";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { toast } from "sonner";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { BorrowingRestrictionsAlert } from "~/components/borrow/borrowing-restrictions-alert";
import { useFetchPrices } from "~/hooks/use-fetch-prices";

function ClosePosition() {
  const { address } = useAccount();
  const { troveId } = useParams();
  const navigate = useNavigate();
  const { connectWallet } = useWalletConnect();

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

  // Fetch prices for display
  const { bitcoin, usdu } = useFetchPrices({
    collateralType,
    enabled: !!position,
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
    } else {
      // Navigate on success
      navigate("/");
    }
  }, [navigate, currentState, reset]);

  if (isTroveLoading || !position) {
    return (
      <div>
        <div className="flex justify-between items-baseline">
          <h1 className="text-3xl font-medium leading-none mb-4 font-sora text-neutral-800">
            Close Position
          </h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-neutral-600">Loading position data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-medium leading-none mb-4 font-sora text-neutral-800">
          {isLiquidated ? "Liquidated Position" : "Close Position"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* Left Panel */}
        <div className="md:col-span-4">
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
              <Alert className="border-orange-200 bg-orange-50 rounded-xl">
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

              <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                <div className="text-center space-y-4">
                  <div className="inline-flex p-3 rounded-full bg-neutral-100">
                    <Info className="h-8 w-8 text-neutral-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-neutral-800 font-sora">
                    Check for Collateral Surplus
                  </h3>
                  <p className="text-sm text-neutral-600 max-w-md mx-auto">
                    If there was excess collateral after liquidation, you can
                    claim it along with surplus from any other liquidated
                    positions.
                  </p>
                  <div className="flex gap-3 justify-center pt-2">
                    <Button
                      onClick={() => navigate("/claim")}
                      className="bg-token-bg-blue hover:bg-blue-600 text-white font-sora"
                    >
                      Go to Claim Page
                    </Button>
                    <Button
                      onClick={() => navigate("/")}
                      variant="outline"
                      className="font-sora"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Normal close position UI
            <div className="space-y-1">
              {/* Borrowing Restrictions Alert */}
              <BorrowingRestrictionsAlert collateralType={collateralType} />

              {/* Special Status Alert */}
              {(isZombie || isRedeemed) && (
                <Alert className="border-amber-200 bg-amber-50 rounded-xl">
                  <Info className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    <p className="font-medium">
                      {isZombie ? "Zombie Position" : "Redeemed Position"}
                    </p>
                    <p className="text-sm mt-1">
                      {isZombie
                        ? "This position has fallen below the minimum debt threshold. Closing it will return any remaining collateral."
                        : "This position has been partially redeemed."}
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Debt Repayment Section */}
              <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                <h3 className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight mb-4">
                  DEBT TO REPAY
                </h3>

                {/* USDU Token Display */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-token-bg-red/10 rounded-lg">
                    <img
                      src={USDU_TOKEN.icon}
                      alt="USDU"
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-sm font-medium text-token-bg-red font-sora">
                      USDU
                    </span>
                  </div>
                  <div className="text-right flex-1">
                    <div className="text-xl font-semibold text-neutral-800 font-sora">
                      <NumericFormat
                        displayType="text"
                        value={position.borrowedAmount}
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                      />
                    </div>
                    {usdu?.price && (
                      <div className="text-xs text-neutral-500">
                        ≈ $
                        <NumericFormat
                          displayType="text"
                          value={position.borrowedAmount * usdu.price}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Balance Check */}
                <div className="bg-neutral-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">
                      Your Balance
                    </span>
                    <div className="text-right">
                      <span
                        className={`text-sm font-medium ${
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
                      {!hasEnoughBalance && (
                        <div className="text-xs text-red-600 mt-1">
                          Need{" "}
                          <NumericFormat
                            displayType="text"
                            value={position.borrowedAmount - usduBal}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collateral Return Section */}
              <div className="bg-white rounded-2xl p-6 border border-neutral-200 mt-6">
                <h3 className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight mb-4">
                  COLLATERAL TO RECEIVE
                </h3>

                {/* Collateral Token Display */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-token-bg rounded-lg">
                    <img
                      src={selectedCollateralToken.icon}
                      alt={selectedCollateralToken.symbol}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-sm font-medium text-token-orange font-sora">
                      {selectedCollateralToken.symbol}
                    </span>
                  </div>
                  <div className="text-right flex-1">
                    <div className="text-xl font-semibold text-neutral-800 font-sora">
                      <NumericFormat
                        displayType="text"
                        value={position.collateralAmount}
                        thousandSeparator=","
                        decimalScale={7}
                        fixedDecimalScale={false}
                      />
                    </div>
                    {bitcoin?.price && (
                      <div className="text-xs text-neutral-500">
                        ≈ $
                        <NumericFormat
                          displayType="text"
                          value={position.collateralAmount * bitcoin.price}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleClosePosition}
                disabled={
                  (address && !hasEnoughBalance) || isSending || isPending
                }
                className="w-full h-12 bg-red-500 hover:bg-red-600 text-white text-sm font-medium font-sora py-4 px-6 rounded-xl transition-all whitespace-nowrap mt-6"
              >
                {!address
                  ? "Connect Wallet"
                  : isSending
                  ? "Confirm in wallet..."
                  : isPending
                  ? "Transaction pending..."
                  : !hasEnoughBalance
                  ? "Insufficient USDU Balance"
                  : "Close Position"}
              </Button>
            </div>
          )}
        </div>

        {/* Right Panel - Info Box */}
        <div className="md:col-span-3 space-y-4">
          <InfoBox
            title={isLiquidated ? "About Liquidation" : "About Closing"}
            variant="blue"
          >
            {isLiquidated ? (
              <>
                <div className="space-y-3">
                  <p className="text-sm font-normal leading-relaxed">
                    Your position has been liquidated because the collateral
                    value fell below the required threshold.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li className="text-sm font-normal leading-relaxed">
                      Your collateral was sold to cover the debt
                    </li>
                    <li className="text-sm font-normal leading-relaxed">
                      The position is now permanently closed
                    </li>
                    <li className="text-sm font-normal leading-relaxed">
                      Any excess collateral can be claimed from the surplus page
                    </li>
                  </ul>
                  <p className="text-sm font-medium">
                    Next Steps: Visit the claim page to check for and claim any
                    collateral surplus.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <p className="text-sm font-normal leading-relaxed">
                    Closing your position will repay your entire debt and return
                    all your collateral.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li className="text-sm font-normal leading-relaxed">
                      You need{" "}
                      <strong>
                        {position?.borrowedAmount.toFixed(2)} USDU
                      </strong>{" "}
                      to repay your debt
                    </li>
                    <li className="text-sm font-normal leading-relaxed">
                      You will receive back{" "}
                      <strong>
                        {position?.collateralAmount.toFixed(7)}{" "}
                        {selectedCollateralToken.symbol}
                      </strong>
                    </li>
                    <li className="text-sm font-normal leading-relaxed">
                      The position will be permanently closed
                    </li>
                    <li className="text-sm font-normal leading-relaxed">
                      No further interest or fees will accrue
                    </li>
                  </ul>
                  {(isZombie || isRedeemed) && (
                    <p className="text-sm font-medium">
                      ⚠️{" "}
                      {isZombie
                        ? "This is a zombie position - closing it will recover your remaining collateral"
                        : "This position has been partially redeemed - check for surplus after closing"}
                    </p>
                  )}
                </div>
              </>
            )}
          </InfoBox>
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
