import { NumericFormat } from "react-number-format";
import {
  UBTC_TOKEN,
  GBTC_TOKEN,
  type CollateralType,
} from "~/lib/contracts/constants";
import { useAccount } from "@starknet-react/core";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useStabilityPoolData } from "~/hooks/use-stability-pool-data";

export function StabilityPoolsTable() {
  const { address } = useAccount();
  const allPositions = useAllStabilityPoolPositions();
  const stabilityPoolData = useStabilityPoolData();

  const poolsData = [
    {
      collateralType: "UBTC" as CollateralType,
      token: UBTC_TOKEN,
      totalDeposits:
        stabilityPoolData.UBTC.totalDeposits ??
        allPositions.UBTC?.totalDeposits ??
        0,
      apr: stabilityPoolData.UBTC.apr ?? 0,
      position: allPositions.UBTC,
    },
    {
      collateralType: "GBTC" as CollateralType,
      token: GBTC_TOKEN,
      totalDeposits:
        stabilityPoolData.GBTC.totalDeposits ??
        allPositions.GBTC?.totalDeposits ??
        0,
      apr: stabilityPoolData.GBTC.apr ?? 0,
      position: allPositions.GBTC,
    },
  ];

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
              href="https://docs.bitusd.org/stability-pool"
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
                        src={pool.token.icon}
                        alt={pool.token.symbol}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white text-base font-medium font-sora">
                      {pool.token.symbol} Pool
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-white text-lg font-semibold font-sora">
                        <NumericFormat
                          displayType="text"
                          value={pool.apr}
                          decimalScale={2}
                        />%
                      </span>
                      <span className="text-[#B2B2B2] text-xs">APR</span>
                    </div>
                  </div>
                </div>

                {/* Pool statistics */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[#B2B2B2] text-xs mb-1">Total Value Locked</div>
                    <div className="text-white text-sm font-medium">
                      <NumericFormat
                        displayType="text"
                        value={pool.totalDeposits}
                        thousandSeparator=","
                        decimalScale={0}
                        suffix=" USDU"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-[#B2B2B2] text-xs mb-1">Your Deposit</div>
                    <div className="text-white text-sm font-medium">
                      {address && pool.position && pool.position.userDeposit > 0 ? (
                        <NumericFormat
                          displayType="text"
                          value={pool.position.userDeposit}
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

                {/* Rewards section - only show if user has deposits */}
                {address && pool.position && pool.position.userDeposit > 0 && (
                  <div className="pt-3 border-t border-zinc-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[#B2B2B2] text-xs mb-1">USDU Rewards</div>
                        <div className="text-white text-sm font-medium">
                          <NumericFormat
                            displayType="text"
                            value={pool.position.rewards?.usdu || 0}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                            suffix=" USDU"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-[#B2B2B2] text-xs mb-1">Collateral Rewards</div>
                        <div className="text-white text-sm font-medium">
                          <NumericFormat
                            displayType="text"
                            value={pool.position.rewards?.collateral || 0}
                            thousandSeparator=","
                            decimalScale={6}
                            fixedDecimalScale
                            suffix={` ${pool.token.symbol}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
