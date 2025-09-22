import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { NumericFormat } from "react-number-format";
import {
  UBTC_TOKEN,
  GBTC_TOKEN,
  type CollateralType,
} from "~/lib/contracts/constants";
import { useAccount } from "@starknet-react/core";
import { useAllStabilityPoolPositions } from "~/hooks/use-stability-pool";
import { useStabilityPoolData } from "~/hooks/use-stability-pool-data";
import { useFetchPrices } from "~/hooks/use-fetch-prices";

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

        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead
                colSpan={2}
                className="md:hidden text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6"
              >
                Pool
              </TableHead>
              <TableHead className="hidden md:table-cell text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 px-0">
                Pool
              </TableHead>
              <TableHead className="hidden md:table-cell text-right text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6">
                Total Value Locked
              </TableHead>
              <TableHead className="hidden md:table-cell text-right text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6">
                Supply APR
              </TableHead>
              <TableHead className="hidden md:table-cell text-right text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6">
                Your Deposit
              </TableHead>
              <TableHead className="hidden md:table-cell text-right text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6">
                USDU Rewards
              </TableHead>
              <TableHead className="hidden md:table-cell text-right text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 pr-0">
                Collateral Rewards
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {poolsData.map((pool) => (
              <TableRow
                key={pool.collateralType}
                className="border-zinc-800 hover:bg-zinc-900/50"
              >
                {/* Mobile view - simpler without collapsible */}
                <TableCell colSpan={2} className="py-3 md:hidden">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800">
                        <img
                          src={pool.token.icon}
                          alt={pool.token.symbol}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-white text-sm font-normal font-sora">
                        {pool.token.symbol}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[#B2B2B2]">TVL</div>
                        <div className="text-white">
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
                        <div className="text-[#B2B2B2]">APR</div>
                        <div className="text-white font-medium">
                          <NumericFormat
                            displayType="text"
                            value={pool.apr}
                            decimalScale={2}
                          />
                          %
                        </div>
                      </div>
                      {address &&
                        pool.position &&
                        pool.position.userDeposit > 0 && (
                          <>
                            <div>
                              <div className="text-[#B2B2B2]">Your Deposit</div>
                              <div className="text-white">
                                <NumericFormat
                                  displayType="text"
                                  value={pool.position.userDeposit}
                                  thousandSeparator=","
                                  suffix=" USDU"
                                  decimalScale={0}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="text-[#B2B2B2]">Rewards</div>
                              <div className="text-white">
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
                          </>
                        )}
                    </div>
                  </div>
                </TableCell>

                {/* Desktop: First column */}
                <TableCell className="hidden md:table-cell px-0 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800">
                      <img
                        src={pool.token.icon}
                        alt={pool.token.symbol}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white text-sm font-normal font-sora">
                      {pool.token.symbol}
                    </span>
                  </div>
                </TableCell>

                {/* Desktop columns - hidden on mobile */}
                <TableCell className="hidden md:table-cell text-right text-white text-sm font-normal font-sora py-3">
                  <NumericFormat
                    displayType="text"
                    value={pool.totalDeposits}
                    thousandSeparator=","
                    decimalScale={0}
                    suffix=" USDU"
                  />
                </TableCell>
                <TableCell className="hidden md:table-cell text-right text-white text-sm font-normal font-sora py-3">
                  <span className="font-medium">
                    <NumericFormat
                      displayType="text"
                      value={pool.apr}
                      decimalScale={2}
                    />
                    %
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell text-right text-white text-sm font-normal font-sora py-3">
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
                </TableCell>
                {/* USDU Rewards column */}
                <TableCell className="hidden md:table-cell text-right text-white text-sm font-normal font-sora py-3">
                  {address &&
                  pool.position?.rewards &&
                  pool.position.rewards.usdu > 0 ? (
                    <NumericFormat
                      displayType="text"
                      value={pool.position.rewards.usdu}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      suffix=" USDU"
                    />
                  ) : (
                    <span className="text-[#B2B2B2]">—</span>
                  )}
                </TableCell>
                {/* Collateral Rewards column */}
                <TableCell className="hidden md:table-cell text-right text-white text-sm font-normal font-sora py-3 pr-0">
                  {address &&
                  pool.position?.rewards &&
                  pool.position.rewards.collateral > 0 ? (
                    <NumericFormat
                      displayType="text"
                      value={pool.position.rewards.collateral}
                      thousandSeparator=","
                      decimalScale={6}
                      fixedDecimalScale
                      suffix={` ${pool.token.symbol}`}
                    />
                  ) : (
                    <span className="text-[#B2B2B2]">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
