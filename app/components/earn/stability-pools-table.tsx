import { Card, CardContent } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
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

interface StabilityPoolsTableProps {
  selectedCollateral: CollateralType;
}

export function StabilityPoolsTable({
  selectedCollateral,
}: StabilityPoolsTableProps) {
  const { address } = useAccount();
  const allPositions = useAllStabilityPoolPositions();
  const stabilityPoolData = useStabilityPoolData();
  const { usdu } = useFetchPrices({ fetchBitcoin: false, fetchUsdu: true });

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
    <div className="w-full">
      <Card className="border border-slate-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">
                Stability Pools Overview
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Earn rewards from loan fees and liquidations while helping
                maintain system stability.{" "}
                <a
                  href="https://docs.bitusd.org/stability-pool"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Learn more
                </a>
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2} className="md:hidden">
                    Pool
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Pool</TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    Total Value Locked
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    Supply APR
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    Your Deposit
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    USDU Rewards
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    Collateral Rewards
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poolsData.map((pool) => (
                  <TableRow
                    key={pool.collateralType}
                    className={
                      pool.collateralType === selectedCollateral
                        ? "bg-slate-50"
                        : ""
                    }
                  >
                    <TableCell colSpan={2} className="py-4 md:py-2 md:hidden">
                      <Collapsible defaultOpen={true}>
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between">
                            {/* Pool info - always visible */}
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={pool.token.icon}
                                alt={pool.token.symbol}
                                className="w-5 h-5 flex-shrink-0"
                              />
                              <div className="flex flex-col min-w-0 text-left">
                                <span className="font-medium">
                                  {pool.token.symbol}
                                </span>
                                {/* Mobile: Show total deposits and APR */}
                                <div className="text-xs text-slate-600">
                                  <span className="text-slate-500">TVL: </span>
                                  <NumericFormat
                                    displayType="text"
                                    value={pool.totalDeposits}
                                    thousandSeparator=","
                                    decimalScale={0}
                                    suffix=" USDU"
                                  />
                                </div>
                                <div className="text-xs font-semibold text-green-600">
                                  <NumericFormat
                                    displayType="text"
                                    value={pool.apr}
                                    decimalScale={2}
                                  />
                                  % APR
                                </div>
                              </div>
                            </div>

                            {/* Mobile: Chevron indicator */}
                            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 data-[state=open]:rotate-180 flex-shrink-0" />
                          </div>
                        </CollapsibleTrigger>

                        {/* Collapsible content for mobile only */}
                        <CollapsibleContent>
                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-slate-500 flex-shrink-0">
                                Total Value Locked
                              </span>
                              <div className="text-right min-w-0">
                                <div className="truncate">
                                  <NumericFormat
                                    displayType="text"
                                    value={pool.totalDeposits}
                                    thousandSeparator=","
                                    decimalScale={0}
                                    suffix=" USDU"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center gap-2">
                              <span className="text-slate-500 flex-shrink-0">
                                Supply APR
                              </span>
                              <span className="font-semibold text-green-600">
                                <NumericFormat
                                  displayType="text"
                                  value={pool.apr}
                                  decimalScale={2}
                                />
                                %
                              </span>
                            </div>

                            <div className="flex justify-between items-center gap-2">
                              <span className="text-slate-500 flex-shrink-0">
                                Your Deposit
                              </span>
                              <div className="text-right min-w-0">
                                {address &&
                                pool.position &&
                                pool.position.userDeposit > 0 ? (
                                  <div>
                                    <div className="truncate">
                                      <NumericFormat
                                        displayType="text"
                                        value={pool.position.userDeposit}
                                        thousandSeparator=","
                                        suffix=" USDU"
                                        decimalScale={0}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center gap-2">
                              <span className="text-slate-500 flex-shrink-0">
                                USDU Rewards
                              </span>
                              <div className="text-right min-w-0">
                                {address &&
                                pool.position?.rewards &&
                                pool.position.rewards.usdu > 0 ? (
                                  <div className="truncate">
                                    <NumericFormat
                                      displayType="text"
                                      value={pool.position.rewards.usdu}
                                      thousandSeparator=","
                                      decimalScale={2}
                                      fixedDecimalScale
                                      suffix=" USDU"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center gap-2">
                              <span className="text-slate-500 flex-shrink-0">
                                Collateral Rewards
                              </span>
                              <div className="text-right min-w-0">
                                {address &&
                                pool.position?.rewards &&
                                pool.position.rewards.collateral > 0 ? (
                                  <div className="truncate">
                                    <NumericFormat
                                      displayType="text"
                                      value={pool.position.rewards.collateral}
                                      thousandSeparator=","
                                      decimalScale={6}
                                      fixedDecimalScale
                                      suffix={` ${pool.token.symbol}`}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>

                    {/* Desktop: First column */}
                    <TableCell className="hidden md:table-cell py-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={pool.token.icon}
                          alt={pool.token.symbol}
                          className="w-5 h-5"
                        />
                        <span className="font-medium">{pool.token.symbol}</span>
                      </div>
                    </TableCell>

                    {/* Desktop columns - hidden on mobile */}
                    <TableCell className="hidden md:table-cell text-right">
                      <NumericFormat
                        displayType="text"
                        value={pool.totalDeposits}
                        thousandSeparator=","
                        decimalScale={0}
                        suffix=" USDU"
                      />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">
                      <span className="font-semibold text-green-600">
                        <NumericFormat
                          displayType="text"
                          value={pool.apr}
                          decimalScale={2}
                        />
                        %
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">
                      {address &&
                      pool.position &&
                      pool.position.userDeposit > 0 ? (
                        <NumericFormat
                          displayType="text"
                          value={pool.position.userDeposit}
                          thousandSeparator=","
                          suffix=" USDU"
                          decimalScale={0}
                        />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    {/* USDU Rewards column */}
                    <TableCell className="hidden md:table-cell text-right">
                      {address &&
                      pool.position?.rewards &&
                      pool.position.rewards.usdu > 0 ? (
                        <div className="text-sm">
                          <NumericFormat
                            displayType="text"
                            value={pool.position.rewards.usdu}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                            suffix=" USDU"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    {/* Collateral Rewards column */}
                    <TableCell className="hidden md:table-cell text-right">
                      {address &&
                      pool.position?.rewards &&
                      pool.position.rewards.collateral > 0 ? (
                        <div className="text-sm">
                          <NumericFormat
                            displayType="text"
                            value={pool.position.rewards.collateral}
                            thousandSeparator=","
                            decimalScale={6}
                            fixedDecimalScale
                            suffix={` ${pool.token.symbol}`}
                          />
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
