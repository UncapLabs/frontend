import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { Button } from "~/components/ui/button";
import {
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useTRPC } from "~/lib/trpc";

interface Position {
  id: string;
  collateralAsset: string;
  collateralAmount: number;
  collateralValue: number;
  borrowedAsset: string;
  borrowedAmount: number;
  healthFactor: number;
  liquidationPrice: number;
  debtLimit: number;
  interestRate: number;
}

type SortableKey =
  | keyof Omit<
      Position,
      "id" | "collateralAsset" | "borrowedAsset" | "debtLimit"
    >
  | "amountBorrowable";

interface SortConfig {
  key: SortableKey;
  direction: "ascending" | "descending";
}

const getHealthFactorDisplay = (hf: number) => {
  if (hf >= 2.5) return { text: "Excellent", color: "text-green-600" };
  if (hf >= 1.75) return { text: "Good", color: "text-blue-600" };
  if (hf >= 1.25) return { text: "Fair", color: "text-yellow-600" };
  return { text: "Poor", color: "text-red-600" };
};

function PositionsPage() {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [repayAmount, setRepayAmount] = useState<number | undefined>(undefined);

  const { address } = useAccount();
  const trpc = useTRPC();

  const {
    data: positionsData,
    isLoading: isLoadingPositions,
    isError: isErrorPositions,
  } = useQuery(
    trpc.positionsRouter.getUserOnChainPositions.queryOptions(
      {
        userAddress: address as `0x${string}`,
      },
      { enabled: !!address }
    )
  );

  const sortedPositions = useMemo(() => {
    let sortableItems = [...(positionsData?.positions || [])];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: number;
        let bValue: number;
        if (sortConfig.key === "amountBorrowable") {
          aValue = a.debtLimit - a.borrowedAmount;
          bValue = b.debtLimit - b.borrowedAmount;
        } else {
          const key = sortConfig.key as keyof Position;
          if (typeof a[key] === "number" && typeof b[key] === "number") {
            aValue = a[key] as number;
            bValue = b[key] as number;
          } else {
            return 0;
          }
        }
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [positionsData?.positions, sortConfig]);

  const totals = useMemo(() => {
    let totalBorrowed = 0;
    let totalWeightedInterestProduct = 0;
    const result = positionsData?.positions?.reduce(
      (acc, p) => {
        acc.borrowedAmount += p.borrowedAmount;
        acc.collateralValue += p.collateralValue;
        acc.amountBorrowable += p.debtLimit - p.borrowedAmount;
        totalBorrowed += p.borrowedAmount;
        totalWeightedInterestProduct += p.borrowedAmount * p.interestRate;
        return acc;
      },
      { borrowedAmount: 0, collateralValue: 0, amountBorrowable: 0 }
    );
    const weightedAverageInterest =
      totalBorrowed > 0 ? totalWeightedInterestProduct / totalBorrowed : 0;
    return { ...result, weightedAverageInterest };
  }, [positionsData?.positions]);

  const requestSort = (key: SortableKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortableKey) => {
    if (!sortConfig || sortConfig.key !== key)
      return <ChevronsUpDown className="ml-1 h-3 w-3 opacity-40" />;
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  const renderHeader = (label: string, key?: SortableKey) => (
    <th
      scope="col"
      className="px-2 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"
    >
      {key ? (
        <Button
          variant="ghost"
          onClick={() => requestSort(key)}
          className="px-1 py-1 h-auto hover:bg-slate-200 text-xs"
        >
          {label}
          {getSortIcon(key)}
        </Button>
      ) : (
        <span>{label}</span>
      )}
    </th>
  );

  const handleManageClick = (position: Position) => {
    setSelectedPosition(position);
    setRepayAmount(undefined); // Reset repay amount each time modal opens
    setIsManageModalOpen(true);
  };

  const handleRepayAmountChange = (values: NumberFormatValues) => {
    setRepayAmount(values.floatValue); // Use floatValue for better precision
  };

  const handleRepayMax = () => {
    if (selectedPosition) {
      setRepayAmount(selectedPosition.borrowedAmount);
    }
  };

  const handleRepaySubmit = () => {
    // TODO: Implement actual repay/close transaction logic
    if (!selectedPosition || repayAmount === undefined) return;
    alert(
      `Repaying ${repayAmount} ${selectedPosition.borrowedAsset} for position ${selectedPosition.id}. (Not implemented)`
    );
    if (repayAmount === selectedPosition.borrowedAmount) {
      alert(`Closing position ${selectedPosition.id}. (Not implemented)`);
    }
    setIsManageModalOpen(false); // Close modal on submit for now
  };

  const isFullRepayment =
    selectedPosition &&
    repayAmount === selectedPosition.borrowedAmount &&
    selectedPosition.borrowedAmount > 0;

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">
          Your positions
        </h1>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      {/* Content container with minimum height to prevent layout shift */}
      <div className="min-h-[400px]">
        {isLoadingPositions && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        )}

        {isErrorPositions && (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-center text-red-600">
                Error loading positions. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {!address && !isLoadingPositions && (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-center text-slate-600">
                Please connect your wallet to view positions.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoadingPositions &&
          !isErrorPositions &&
          address &&
          (!sortedPositions || sortedPositions.length === 0) && (
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-center text-slate-600">
                  You have no open positions.
                </p>
              </CardContent>
            </Card>
          )}

        {!isLoadingPositions &&
          !isErrorPositions &&
          sortedPositions &&
          sortedPositions.length > 0 && (
            <>
              <div className="overflow-x-auto shadow border-b border-slate-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      {renderHeader("Collateral", "collateralAmount")}
                      {renderHeader("Collateral Value ($)", "collateralValue")}
                      {renderHeader("Borrowed (bitUSD)", "borrowedAmount")}
                      {renderHeader("Borrowable ($)", "amountBorrowable")}
                      {renderHeader("Health Factor", "healthFactor")}
                      {renderHeader("Liq. Price ($)", "liquidationPrice")}
                      {renderHeader("Interest Rate (%)", "interestRate")}
                      {renderHeader("Actions")} {/* Actions column */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {sortedPositions.map((position) => {
                      const amountBorrowable =
                        position.debtLimit - position.borrowedAmount;
                      const healthDisplay = getHealthFactorDisplay(
                        position.healthFactor
                      );
                      return (
                        <tr
                          key={position.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-2 py-3 whitespace-nowrap text-sm font-medium text-slate-800">
                            <NumericFormat
                              value={position.collateralAmount}
                              displayType="text"
                              thousandSeparator=","
                              decimalScale={4}
                            />{" "}
                            {position.collateralAsset}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-600">
                            <NumericFormat
                              value={position.collateralValue}
                              displayType="text"
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-600">
                            <NumericFormat
                              value={position.borrowedAmount}
                              displayType="text"
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-600">
                            <NumericFormat
                              value={
                                amountBorrowable > 0 ? amountBorrowable : 0
                              }
                              displayType="text"
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />
                          </td>
                          <td
                            className={`px-2 py-3 whitespace-nowrap text-sm font-semibold ${healthDisplay.color}`}
                          >
                            {position.healthFactor.toFixed(2)}{" "}
                            <span className="font-normal text-xs">
                              ({healthDisplay.text})
                            </span>
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-600">
                            <NumericFormat
                              value={position.liquidationPrice}
                              displayType="text"
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />{" "}
                            / {position.collateralAsset}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-600">
                            <NumericFormat
                              value={position.interestRate}
                              displayType="text"
                              suffix="%"
                              decimalScale={2}
                              fixedDecimalScale
                            />
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-600">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageClick(position)}
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                    <tr>
                      <td className="px-2 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                        Totals
                      </td>
                      <td className="px-2 py-3 text-left text-sm font-semibold text-slate-700">
                        <NumericFormat
                          value={totals.collateralValue}
                          displayType="text"
                          prefix="$"
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />
                      </td>
                      <td className="px-2 py-3 text-left text-sm font-semibold text-slate-700">
                        <NumericFormat
                          value={totals.borrowedAmount}
                          displayType="text"
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />{" "}
                        bitUSD
                      </td>
                      <td className="px-2 py-3 text-left text-sm font-semibold text-slate-700">
                        <NumericFormat
                          value={totals.amountBorrowable}
                          displayType="text"
                          prefix="$"
                          thousandSeparator=","
                          decimalScale={2}
                          fixedDecimalScale
                        />
                      </td>
                      <td className="px-2 py-3"></td>
                      <td className="px-2 py-3"></td>
                      <td className="px-2 py-3 text-left text-sm font-semibold text-slate-700">
                        <div className="relative group flex items-center">
                          <NumericFormat
                            value={totals.weightedAverageInterest}
                            displayType="text"
                            suffix="%"
                            decimalScale={2}
                            fixedDecimalScale
                          />
                          <HelpCircle className="h-3 w-3 ml-1 text-slate-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-60 p-2 bg-slate-800 text-white rounded shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            Weighted average interest rate based on borrowed
                            amount.
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3"></td>{" "}
                      {/* Cell for Actions column in footer */}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
      </div>

      {selectedPosition && (
        <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
          <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            {" "}
            {/* Wider modal */}
            <DialogHeader>
              <DialogTitle>
                Manage Position: {selectedPosition.collateralAsset} /{" "}
                {selectedPosition.borrowedAsset} (ID: {selectedPosition.id})
              </DialogTitle>
              <DialogDescription>
                Current Borrowed:{" "}
                <NumericFormat
                  value={selectedPosition.borrowedAmount}
                  displayType="text"
                  thousandSeparator
                  decimalScale={2}
                />{" "}
                {selectedPosition.borrowedAsset} | Collateral:{" "}
                <NumericFormat
                  value={selectedPosition.collateralAmount}
                  displayType="text"
                  thousandSeparator
                  decimalScale={4}
                />{" "}
                {selectedPosition.collateralAsset}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="repay" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="repay">Repay</TabsTrigger>
                <TabsTrigger value="borrow">Borrow More</TabsTrigger>
              </TabsList>
              <TabsContent value="repay" className="py-4">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="repayAmount"
                      className="text-base font-medium"
                    >
                      Repay Amount ({selectedPosition.borrowedAsset})
                    </Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <NumericFormat
                        id="repayAmount"
                        customInput={Input}
                        placeholder="0"
                        value={repayAmount}
                        onValueChange={handleRepayAmountChange}
                        thousandSeparator
                        decimalScale={2}
                        allowNegative={false}
                        className="flex-grow"
                      />
                      <Button variant="outline" onClick={handleRepayMax}>
                        Max
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleRepaySubmit}
                    className="w-full"
                    disabled={
                      !selectedPosition ||
                      repayAmount === undefined ||
                      repayAmount <= 0 ||
                      repayAmount > selectedPosition.borrowedAmount
                    }
                  >
                    {isFullRepayment ? "Close Position" : "Repay"}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="borrow" className="py-4">
                <p className="text-sm text-slate-600 mb-2">
                  Adjust your position by borrowing more{" "}
                  {selectedPosition.borrowedAsset}.
                </p>
                {/* Placeholder for Borrow More UI - to be styled like borrow.tsx */}
                <div className="space-y-4 p-4 border rounded-md bg-slate-50">
                  <div>
                    <Label className="text-base font-medium">
                      Collateral Deposited ({selectedPosition.collateralAsset})
                    </Label>
                    <Input
                      disabled
                      value={selectedPosition.collateralAmount.toLocaleString()}
                      className="mt-1 bg-slate-100"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Current collateral is fixed for this operation.
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="additionalBorrowAmount"
                      className="text-base font-medium"
                    >
                      Additional Borrow Amount ({selectedPosition.borrowedAsset}
                      )
                    </Label>
                    <Input
                      id="additionalBorrowAmount"
                      type="number"
                      placeholder="0"
                      className="mt-1"
                    />
                    {/* TODO: Add LTV slider, pre-set to current, updating with additional borrow */}
                    <p className="text-xs text-slate-500 mt-1">
                      LTV sliders and calculations will be updated based on the
                      new total borrowed amount. (UI/Logic TODO)
                    </p>
                  </div>
                  <Button className="w-full" disabled>
                    Borrow More (UI TODO)
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            {/* Placeholder for Position Summary - to be styled like borrow.tsx */}
            <div className="mt-6 p-4 border rounded-md bg-slate-50">
              <h3 className="text-lg font-semibold mb-2 text-slate-700">
                Position Summary (Dynamic TODO)
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  Current Health Factor:{" "}
                  <NumericFormat
                    value={selectedPosition.healthFactor}
                    displayType="text"
                    decimalScale={2}
                  />
                </p>
                <p>
                  Liquidation Price:{" "}
                  <NumericFormat
                    value={selectedPosition.liquidationPrice}
                    displayType="text"
                    prefix="$"
                    decimalScale={2}
                  />
                </p>
                <p>
                  Debt Limit:{" "}
                  <NumericFormat
                    value={selectedPosition.debtLimit}
                    displayType="text"
                    prefix="$"
                    decimalScale={2}
                  />
                </p>
                {/* TODO: These values should update based on repay/borrow more inputs */}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsManageModalOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default PositionsPage;

export function meta() {
  return [
    { title: "Your Positions - BitUSD Protocol" },
    {
      name: "description",
      content: "View, sort, and manage your open positions on BitUSD Protocol.",
    },
  ];
}
