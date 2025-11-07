import { Label } from "~/components/ui/label";
import { useAccount, useBalance } from "@starknet-react/core";
import {
  TOKENS,
  DEFAULT_COLLATERAL,
  COLLATERAL_LIST,
  getCollateralByAddress,
} from "~/lib/collateral";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useWalletConnect } from "~/hooks/use-wallet-connect";
import { useCollateralPrice, useUsduPrice } from "~/hooks/use-fetch-prices";
import { StabilityPoolsTable } from "~/components/earn/stability-pools-table";
import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";
import { DepositFlow } from "~/components/earn/deposit-flow";
import { WithdrawFlow } from "~/components/earn/withdraw-flow";
import { ClaimFlow } from "~/components/earn/claim-flow";
import { InfoBox } from "~/components/ui/info-box";
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

  // Use address-based collateral selection
  const [selectedCollateralAddress, setSelectedCollateralAddress] =
    useQueryState(
      "collateral",
      parseAsString.withDefault(DEFAULT_COLLATERAL.addresses.token)
    );

  const [claimRewards, setClaimRewards] = useQueryState(
    "claim",
    parseAsBoolean.withDefault(true)
  );

  // Get collateral object from address (fallback to default if invalid)
  const collateral =
    getCollateralByAddress(selectedCollateralAddress || "") ||
    DEFAULT_COLLATERAL;

  const { data: usduBalance } = useBalance({
    token: TOKENS.USDU.address,
    address: address,
    refetchInterval: 30000,
  });

  const allPositions = useAllStabilityPoolPositions();
  const selectedPosition = allPositions[collateral.id];
  const selectedCollateralSymbol = collateral.symbol;

  const usduPrice = useUsduPrice();
  const bitcoinPrice = useCollateralPrice(collateral.id);

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="flex justify-between pb-6 lg:pb-8 items-baseline">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
          Stability Pool
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Section: Form - Shows first on mobile, left on desktop */}
        <div className="flex-1 lg:flex-[2] order-1">
          <div className="space-y-2">
            {/* Combined Action Tabs */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 space-y-4">
              <Label className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight block">
                Choose Action
              </Label>

              {/* Pool Selection Row - Dynamic */}
              {/* <div className="border-t border-neutral-100 p-4 pt-3">
                <div className="flex gap-3">
                  {COLLATERAL_LIST.map((pool) => (
                    <button
                      key={pool.id}
                      type="button"
                      onClick={() => setSelectedCollateralAddress(pool.addresses.token)}
                      className={`flex-1 p-3 rounded-lg transition-all flex items-center gap-3 ${
                        collateral.id === pool.id
                          ? "bg-token-bg border-2 border-token-orange"
                          : "bg-neutral-50 border-2 border-transparent hover:bg-neutral-100"
                      }`}
                    >
                      <img
                        src={pool.icon}
                        alt={pool.symbol}
                        className="w-8 h-8 object-contain"
                      />
                      <div className="text-left">
                        <span
                          className={`text-sm font-medium font-sora block ${
                            collateral.id === pool.id
                              ? "text-token-orange"
                              : "text-neutral-800"
                          }`}
                        >
                          {pool.symbol} Pool
                        </span>
                        <span className="text-xs text-neutral-500 font-sora">
                          {pool.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div> */}

              {/* Action Tabs Row */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAction("deposit")}
                  className={`flex-1 py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium font-sora transition-all ${
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
                  className={`flex-1 py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium font-sora transition-all ${
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
                  className={`flex-1 py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium font-sora transition-all whitespace-nowrap ${
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
                selectedCollateral={collateral.id}
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
                selectedCollateral={collateral.id}
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
                selectedCollateral={collateral.id}
                selectedCollateralSymbol={selectedCollateralSymbol}
                claimRewards={claimRewards}
                setClaimRewards={setClaimRewards}
                connectWallet={connectWallet}
              />
            )}
          </div>
        </div>

        {/* Right Section: Info and Stats - Shows after form on mobile, right on desktop */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px] space-y-4 order-2">
          <InfoBox
            title="How Stability Pool Yields Work"
            variant="blue"
            learnMoreUrl="https://uncap.finance/resources/docs/how-to/usdu-and-earn"
            learnMoreText="Learn more about the Stability Pool"
          >
            <div className="text-[#004BB2] text-sm font-normal leading-relaxed font-sora space-y-4">
              <div>
                <p className="font-medium mb-2">
                  Yield comes from two sources:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>Interest payments:</strong> 75% of borrower interest
                    flows to depositors, paid in USDU
                  </li>
                  <li>
                    <strong>Liquidation gains:</strong> Your USDU purchases
                    collateral from liquidated loans at ~5% discount
                  </li>
                </ul>
              </div>
              <p>
                No lockup periods—withdraw anytime. Yield is sustainable and
                real, with no token emissions required.
              </p>
            </div>
          </InfoBox>
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
