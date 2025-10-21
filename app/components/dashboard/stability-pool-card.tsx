import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "~/components/ui/card";
import { NumericFormat } from "react-number-format";
import { Edit3 } from "lucide-react";
import Big from "big.js";

import { type CollateralId, getCollateral } from "~/lib/collateral";

interface StabilityPoolCardProps {
  poolType: CollateralId;
  userDeposit: Big;
  poolShare: Big;
  usduRewards: Big;
  collateralRewards: Big;
  usduPrice?: Big;
  onManagePosition: () => void;
  onDepositClick?: () => void;
  onRewardsClick?: () => void;
}

export default function StabilityPoolCard({
  poolType,
  userDeposit,
  poolShare,
  usduRewards,
  collateralRewards,
  usduPrice,
  onManagePosition,
  onDepositClick,
  onRewardsClick,
}: StabilityPoolCardProps) {
  // Get user-facing symbol (e.g., "wBTC" instead of "WWBTC")
  const collateral = getCollateral(poolType);
  const poolSymbol = collateral.symbol;
  return (
    <Card className="rounded-2xl border-0 shadow-none transition-all duration-300 gap-4 bg-white">
      <CardHeader
        className="border-b border-[#F5F3EE]"
        style={{ paddingBottom: "0.75rem" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#F5F3EE] rounded-lg text-xs font-medium font-sora text-neutral-800 leading-tight">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.0376 0.224609C11.049 0.224691 11.8704 1.04621 11.8706 2.05762V2.28906C11.8706 2.54332 11.6639 2.75082 11.4097 2.75098C11.1553 2.75098 10.9487 2.54342 10.9487 2.28906V2.05762C10.9486 1.55492 10.5403 1.14657 10.0376 1.14648H2.55908C1.8784 1.1575 1.32681 1.69924 1.30518 2.38086L1.3042 2.3877L1.30518 2.39551C1.32733 3.04318 1.85959 3.55273 2.50537 3.55273H10.0376C11.0491 3.55282 11.8706 4.3742 11.8706 5.38574V10.2852C11.8706 11.1096 11.2049 11.7754 10.3804 11.7754H2.90186C1.51164 11.7754 0.382324 10.6461 0.382324 9.25586V2.34766C0.382324 1.17571 1.33342 0.224609 2.50537 0.224609H10.0376ZM1.3042 9.25586C1.3042 10.1374 2.02035 10.8535 2.90186 10.8535H10.3853C10.7009 10.8533 10.9526 10.6008 10.9526 10.2852V9.25781H8.35498C7.53723 9.25394 6.8715 8.59525 6.86377 7.7793V7.36719C6.86393 6.54205 7.53035 5.87305 8.354 5.87305H10.9487V5.38574C10.9487 4.88291 10.5404 4.47469 10.0376 4.47461H2.50537C2.19894 4.47461 1.9016 4.40973 1.62451 4.28125L1.3042 4.13281V9.25586ZM8.354 6.7998C8.0383 6.7998 7.7858 7.05153 7.78564 7.36719V7.77344C7.79284 8.07574 8.03793 8.33594 8.354 8.33594H10.9526V6.7998H8.354Z"
                  fill="#242424"
                />
              </svg>
              Stability Pool
            </div>
            {/* Pool Type */}
            <span className="text-sm font-medium font-sora leading-none text-neutral-800">
              {poolSymbol} Pool
            </span>
          </div>
          {/* Edit Icon */}
          <div className="flex items-center gap-1">
            <button
              onClick={onManagePosition}
              className="w-8 h-8 rounded-lg border transition-all flex items-center justify-center border-neutral-800/10 hover:bg-[#F5F3EE] cursor-pointer"
            >
              <Edit3 className="h-4 w-4 text-neutral-800" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div
          className="flex flex-col flex-1 cursor-pointer"
          onClick={onDepositClick}
        >
          <div className="flex justify-between items-center mb-4 lg:mb-8">
            <div className="text-xs font-medium font-sora uppercase tracking-tight text-neutral-800">
              Your deposit
            </div>
            <div className="flex items-center gap-2 px-2 py-2 rounded-md border border-[#F5F3EE]">
              <span className="text-xs font-medium font-sora text-neutral-800">
                Pool share
              </span>
              <div className="h-3 w-px bg-[#F5F3EE]" />
              <span className="text-xs font-medium font-sora leading-3 text-neutral-800">
                <NumericFormat
                  displayType="text"
                  value={poolShare.toString()}
                  decimalScale={3}
                  suffix="%"
                />
              </span>
            </div>
          </div>

          {/* Deposit Amount Values */}
          <div className="flex-1 flex flex-col justify-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-medium font-sora text-neutral-800">
                  <NumericFormat
                    displayType="text"
                    value={userDeposit.toString()}
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </div>
                {/* Token display inline like in token-input */}
                <div className="p-2.5 rounded-lg inline-flex justify-start items-center gap-2 bg-token-bg">
                  <img
                    src="/usdu.png"
                    alt="USDU"
                    className="w-5 h-5 object-contain"
                  />
                  <span className="text-sm font-medium font-sora leading-tight text-token-orange">
                    USDU
                  </span>
                </div>
              </div>
              <div className="text-base font-normal font-sora mt-1 text-[#AAA28E]">
                {usduPrice ? (
                  <>
                    $
                    <NumericFormat
                      displayType="text"
                      value={userDeposit.times(usduPrice).toString()}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </>
                ) : (
                  "Loading..."
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      {/* Card Footer with Rewards */}
      <CardFooter className="border-t border-[#F5F3EE]">
        <div
          className="w-full grid grid-cols-2 relative -my-6 cursor-pointer"
          onClick={onRewardsClick}
        >
          {/* Full-height divider */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-[#F5F3EE]" />

          {/* USDU Rewards section */}
          <div className="pr-4 py-6">
            <div className="text-xs font-medium font-sora uppercase tracking-tight mb-2 text-neutral-800">
              USDU Rewards
            </div>
            <div className="text-xl font-medium font-sora text-neutral-800">
              <NumericFormat
                displayType="text"
                value={usduRewards.toString()}
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale
              />
            </div>
          </div>

          {/* Collateral Rewards section */}
          <div className="pl-6 py-6">
            <div className="text-xs font-medium font-sora uppercase tracking-tight mb-2 text-neutral-800">
              {poolSymbol} Rewards
            </div>
            <div className="text-xl font-medium font-sora text-neutral-800">
              <NumericFormat
                displayType="text"
                value={collateralRewards.toString()}
                thousandSeparator=","
                decimalScale={6}
                fixedDecimalScale={true}
              />
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
