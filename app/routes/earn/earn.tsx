import { Label } from "~/components/ui/label";
import { useAccount, useBalance } from "@starknet-react/core";
import { TOKENS, COLLATERALS, type CollateralId } from "~/lib/collateral";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { useFetchPrices } from "~/hooks/use-fetch-prices";
import { StabilityPoolsTable } from "~/components/earn/stability-pools-table";
import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";
import { DepositFlow } from "~/components/earn/deposit-flow";
import { WithdrawFlow } from "~/components/earn/withdraw-flow";
import { ClaimFlow } from "~/components/earn/claim-flow";
import { createMeta } from "~/lib/utils/meta";
import type { Route } from "./+types/earn";

type ActionType = "deposit" | "withdraw" | "claim";

function Earn() {
  const { address } = useAccount();
  const { connectWallet } = useWalletConnect();

  const [action, setAction] = useQueryState(
    "action",
    parseAsString.withDefault("deposit")
  ) as [ActionType, (value: ActionType | null) => void];
  const [selectedCollateral] = useQueryState(
    "collateral",
    parseAsString.withDefault("WWBTC")
  ) as [CollateralId, (value: CollateralId | null) => void];
  const [claimRewards, setClaimRewards] = useQueryState(
    "claim",
    parseAsBoolean.withDefault(true)
  );

  const { data: usduBalance } = useBalance({
    token: TOKENS.USDU.address,
    address: address,
    refetchInterval: 30000,
  });

  const allPositions = useAllStabilityPoolPositions();
  const selectedPosition = allPositions[selectedCollateral];
  const selectedCollateralSymbol = COLLATERALS[selectedCollateral].symbol;

  const { usdu: usduPrice, bitcoin: bitcoinPrice } = useFetchPrices({
    collateralType: selectedCollateral,
    fetchBitcoin: true,
    fetchUsdu: true,
  });

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between pb-6 items-baseline">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
          Stability Pool
        </h1>
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-5">
        {/* Left Section: Form */}
        <div className="flex-1 lg:flex-[2]">
          <div className="space-y-2">
            {/* Combined Action Tabs */}
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <Label className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight block">
                Choose Action
              </Label>

              {/* Action Tabs Row */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setAction("deposit")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium font-sora transition-all ${
                    action === "deposit"
                      ? "bg-token-bg-blue text-white"
                      : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setAction("withdraw")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium font-sora transition-all ${
                    action === "withdraw"
                      ? "bg-token-bg-blue text-white"
                      : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  Withdraw
                </button>
                <button
                  type="button"
                  onClick={() => setAction("claim")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium font-sora transition-all ${
                    action === "claim"
                      ? "bg-token-bg-blue text-white"
                      : "text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  Claim Rewards
                </button>
              </div>
            </div>

            {/* Render appropriate flow component based on action */}
            {action === "deposit" && (
              <DepositFlow
                address={address}
                usduBalance={usduBalance}
                usduPrice={usduPrice}
                selectedPosition={selectedPosition}
                selectedCollateral={selectedCollateral}
                selectedCollateralSymbol={selectedCollateralSymbol}
                claimRewards={claimRewards}
                setClaimRewards={setClaimRewards}
                connectWallet={connectWallet}
              />
            )}
            {action === "withdraw" && (
              <WithdrawFlow
                address={address}
                usduPrice={usduPrice}
                selectedPosition={selectedPosition}
                selectedCollateral={selectedCollateral}
                selectedCollateralSymbol={selectedCollateralSymbol}
                claimRewards={claimRewards}
                setClaimRewards={setClaimRewards}
                connectWallet={connectWallet}
              />
            )}
            {action === "claim" && (
              <ClaimFlow
                address={address}
                usduPrice={usduPrice}
                bitcoinPrice={bitcoinPrice}
                selectedPosition={selectedPosition}
                selectedCollateral={selectedCollateral}
                selectedCollateralSymbol={selectedCollateralSymbol}
                claimRewards={claimRewards}
                setClaimRewards={setClaimRewards}
                connectWallet={connectWallet}
              />
            )}
          </div>
        </div>

        {/* Right Section: Table */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px]">
          <StabilityPoolsTable />
        </div>
      </div>
    </div>
  );
}

export default Earn;

export function meta(args: Route.MetaArgs) {
  return createMeta(args, {
    title: "Uncap - Earn yield on your stablecoins",
    description:
      "Earn sustainable yield on your stablecoins with Uncap Finance",
  });
}
