import { NumericFormat } from "react-number-format";
import { COLLATERALS } from "~/lib/collateral";
import { useAccount } from "@starknet-react/core";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useStabilityPoolData } from "~/hooks/use-stability-pool-data";

export function StabilityPoolsTable() {
  const { address } = useAccount();
  const allPositions = useAllStabilityPoolPositions();
  const stabilityPoolData = useStabilityPoolData();

  const poolsData = Object.values(COLLATERALS).map((collateral) => ({
    collateralType: collateral.id,
    collateral,
    totalDeposits:
      stabilityPoolData[collateral.id]?.totalDeposits ??
      allPositions[collateral.id]?.totalDeposits ??
      0,
    apr: stabilityPoolData[collateral.id]?.apr ?? 0,
    position: allPositions[collateral.id],
  }));

  return (
    <div className="bg-[#242424] rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-white text-lg font-medium font-sora">
            Stability Pools Overview
          </h3>
          <p className="text-sm text-[#B2B2B2] mt-1">
            Earn rewards from loan fees and liquidations while helping maintain
            system stability.{" "}
            <a
              href="https://uncap.finance/docs/FAQ/usdu-and-earn#what-generates-the-yield-for-stability-pool-participants"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Learn more
            </a>
          </p>
        </div>

        <div className="space-y-3">
          {poolsData.map((pool) => (
            <div
              key={pool.collateralType}
              className="border border-zinc-800 rounded-lg p-4 hover:bg-zinc-900/50 transition-colors"
            >
              <div className="space-y-3">
                {/* Pool header with icon and name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                      <img
                        src={pool.collateral.icon}
                        alt={pool.collateral.symbol}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white text-base font-medium font-sora">
                      {pool.collateral.symbol} Pool
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-white text-lg font-semibold font-sora">
                        <NumericFormat
                          displayType="text"
                          value={pool.apr}
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />
                        %
                      </span>
                      <span className="text-[#B2B2B2] text-xs">APR</span>
                    </div>
                  </div>
                </div>

                {/* Pool statistics */}
                <div className="flex justify-between gap-6">
                  <div className="flex-1">
                    <div className="text-[#B2B2B2] text-xs mb-1">
                      Total Value Locked
                    </div>
                    <div className="text-white text-sm font-medium">
                      <NumericFormat
                        displayType="text"
                        value={pool.totalDeposits.toString()}
                        thousandSeparator=","
                        decimalScale={0}
                        suffix=" USDU"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-[#B2B2B2] text-xs mb-1">
                      Your Deposit
                    </div>
                    <div className="text-white text-sm font-medium">
                      {address &&
                      pool.position &&
                      pool.position.userDeposit.gt(0) ? (
                        <NumericFormat
                          displayType="text"
                          value={pool.position.userDeposit.toString()}
                          thousandSeparator=","
                          suffix=" USDU"
                          decimalScale={0}
                        />
                      ) : (
                        <span className="text-[#B2B2B2]">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rewards section */}
                <div className="pt-3 border-t border-zinc-700">
                  <div className="flex justify-between gap-6">
                    <div className="flex-1">
                      <div className="text-[#B2B2B2] text-xs mb-1">
                        USDU Rewards
                      </div>
                      <div className="text-white text-sm font-medium">
                        {address &&
                        pool.position &&
                        pool.position.rewards?.usdu &&
                        pool.position.rewards.usdu.gt(0) ? (
                          <NumericFormat
                            displayType="text"
                            value={pool.position.rewards.usdu.toString()}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                            suffix=" USDU"
                          />
                        ) : (
                          <span className="text-[#B2B2B2]">—</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-[#B2B2B2] text-xs mb-1">
                        Collateral Rewards
                      </div>
                      <div className="text-white text-sm font-medium">
                        {address &&
                        pool.position &&
                        pool.position.rewards?.collateral &&
                        pool.position.rewards.collateral.gt(0) ? (
                          <NumericFormat
                            displayType="text"
                            value={pool.position.rewards.collateral.toString()}
                            thousandSeparator=","
                            decimalScale={6}
                            fixedDecimalScale
                            suffix={` ${pool.collateral.symbol}`}
                          />
                        ) : (
                          <span className="text-[#B2B2B2]">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
