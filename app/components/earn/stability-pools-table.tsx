import { Card, CardContent } from "~/components/ui/card";
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
    <Card className="border border-slate-200">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Stability Pools Overview</h2>
            <p className="text-sm text-slate-500 mt-1">
              Earn liquidation rewards by depositing USDU into stability pools
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pool</TableHead>
                <TableHead className="text-right">Total Deposits</TableHead>
                <TableHead className="text-right">Supply APR</TableHead>
                <TableHead className="text-right">Your Deposit</TableHead>
                <TableHead className="text-right">
                  Claimable Rewards
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={pool.token.icon}
                        alt={pool.token.symbol}
                        className="w-5 h-5"
                      />
                      <span className="font-medium">{pool.token.symbol}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <NumericFormat
                        displayType="text"
                        value={pool.totalDeposits}
                        thousandSeparator=","
                        decimalScale={0}
                        suffix=" USDU"
                      />
                      {usdu?.price && (
                        <div className="text-xs text-slate-500">
                          $
                          <NumericFormat
                            displayType="text"
                            value={pool.totalDeposits * usdu.price}
                            thousandSeparator=","
                            decimalScale={0}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-green-600">
                      <NumericFormat
                        displayType="text"
                        value={pool.apr}
                        decimalScale={2}
                      />
                      %
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {address &&
                    pool.position &&
                    pool.position.userDeposit > 0 ? (
                      <div>
                        <NumericFormat
                          displayType="text"
                          value={pool.position.userDeposit}
                          thousandSeparator=","
                          suffix=" USDU"
                          decimalScale={0}
                        />
                        {usdu?.price && (
                          <div className="text-xs text-slate-500">
                            $
                            <NumericFormat
                              displayType="text"
                              value={pool.position.userDeposit * usdu.price}
                              thousandSeparator=","
                              decimalScale={0}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {address && pool.position?.rewards ? (
                      <div className="text-sm">
                        <div>
                          <NumericFormat
                            displayType="text"
                            value={pool.position.rewards.usdu}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />{" "}
                          USDU
                        </div>
                        <div className="text-slate-500">
                          <NumericFormat
                            displayType="text"
                            value={pool.position.rewards.collateral}
                            thousandSeparator=","
                            decimalScale={6}
                            fixedDecimalScale
                          />{" "}
                          {pool.token.symbol}
                        </div>
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
  );
}