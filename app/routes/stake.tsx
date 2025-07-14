import { Button } from "~/components/ui/button";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { z, ZodError } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import {
  useAccount,
  useContract,
  useSendTransaction,
} from "@starknet-react/core";
import { MAX_LIMIT } from "~/lib/utils/calc";
import {
  USDU_ADDRESS,
  STABILITY_POOL_ADDRESS,
} from "~/lib/contracts/constants";
import { STABILITY_POOL_ABI } from "~/lib/contracts";

// TODO: Define a schema for stake form validation if needed
const createStakeFormSchema = (maxBalance?: number) =>
  z.object({
    stakeAmount: z
      .number()
      .positive({ message: "Stake amount must be greater than 0." })
      .max(maxBalance || Number.POSITIVE_INFINITY, {
        message: "Stake amount cannot exceed your balance.",
      })
      .optional(),
  });

function StakePage() {
  const { address } = useAccount();
  const trpc = useTRPC();

  const [stakeAmount, setStakeAmount] = useState<number | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<ZodError | null>(null);

  // TODO: Replace with actual tRPC query or StarkNet call to fetch interest rate
  const { data: interestRateData } = useQuery({
    queryKey: ["stakeInterestRate"],
    queryFn: async () => ({ rate: 5.0 }), // Placeholder: 5.0% APY
  });
  const currentInterestRate = interestRateData?.rate;

  // Set up bitUSD contract with balance_of function
  const { contract: bitUSDContract } = useContract({
    abi: [
      {
        type: "function",
        name: "approve",
        inputs: [
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [{ type: "core::bool" }],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "balance_of",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
    ] as const,
    address: USDU_ADDRESS,
  });

  // Custom balance query using the contract directly
  const {
    data: bitUSDBalanceData,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useQuery({
    queryKey: ["bitUSDBalance", address],
    queryFn: async () => {
      if (!bitUSDContract || !address) return null;
      try {
        const balance = await bitUSDContract.balance_of(address);
        return {
          value: balance,
          formatted: (Number(balance) / 1e18).toString(),
        };
      } catch (error) {
        console.error("Error fetching bitUSD balance:", error);
        return null;
      }
    },
    enabled: !!bitUSDContract && !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // TODO: Fetch bitUSD price if needed to show value, similar to borrow.tsx
  const { data: bitUSDPriceData } = useQuery(
    trpc.priceRouter.getBitUSDPrice.queryOptions() // Assuming this exists
  );
  const bitUSDPrice = bitUSDPriceData?.price || 1; // Default to 1 if not fetched

  // Set up contracts with proper ABI types
  const { contract: stabilityPoolContract } = useContract({
    abi: STABILITY_POOL_ABI,
    address: STABILITY_POOL_ADDRESS,
  });

  // Fetch user's compounded deposit in the stability pool
  const { data: stakedAmountData, isLoading: isLoadingStakedAmount } = useQuery(
    {
      queryKey: ["stakedAmount", address, STABILITY_POOL_ADDRESS],
      queryFn: async () => {
        if (!stabilityPoolContract || !address) return null;
        try {
          const amount =
            await stabilityPoolContract.get_compounded_bitusd_deposit(address);
          return amount;
        } catch (error) {
          console.error("Error fetching staked amount:", error);
          return null;
        }
      },
      enabled: !!stabilityPoolContract && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  );

  // Fetch user's claimable yield gain from the stability pool
  const { data: claimableRewardsData, isLoading: isLoadingClaimableRewards } =
    useQuery({
      queryKey: ["claimableRewards", address, STABILITY_POOL_ADDRESS],
      queryFn: async () => {
        if (!stabilityPoolContract || !address) return null;
        try {
          const rewards = await stabilityPoolContract.get_depositor_yield_gain(
            address
          );
          return rewards;
        } catch (error) {
          console.error("Error fetching claimable rewards:", error);
          return null;
        }
      },
      enabled: !!stabilityPoolContract && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    });

  // Use the custom balance data
  const bitUSDBalance = bitUSDBalanceData;

  const validateAndUpdateFormState = (
    currentStakeAmount: number | undefined
  ) => {
    let maxBalanceForSchema: number | undefined = undefined;
    if (bitUSDBalance?.value) {
      const rawMaxBalance = Number(bitUSDBalance.value) / 1e18;
      // Round maxBalance to 7 decimal places to match NumericFormat's precision
      // This helps prevent floating point comparison issues.
      maxBalanceForSchema = parseFloat(rawMaxBalance.toFixed(7));
    }

    const schema = createStakeFormSchema(maxBalanceForSchema);
    const validationResult = schema.safeParse({
      stakeAmount: currentStakeAmount,
    });

    if (!validationResult.success) {
      setFormErrors(validationResult.error);
    } else {
      setFormErrors(null);
    }
  };

  const handleStakeAmountChange = (values: NumberFormatValues) => {
    const currentNumericStakeAmount = Number(values.value);
    setStakeAmount(currentNumericStakeAmount);
    validateAndUpdateFormState(currentNumericStakeAmount);
  };

  const handleMaxClick = () => {
    if (bitUSDBalance?.value) {
      const rawMaxBalance = Number(bitUSDBalance.value) / 1e18;
      // Set state with the raw max balance. NumericFormat will handle display rounding.
      setStakeAmount(rawMaxBalance);
      // Validate with the raw max balance, validateAndUpdateFormState will handle precision for schema.
      validateAndUpdateFormState(rawMaxBalance);
    }
  };

  // Create batched transaction calls
  const calls =
    bitUSDContract &&
    stabilityPoolContract &&
    address &&
    stakeAmount &&
    stakeAmount > 0
      ? [
          // 1. Approve bitUSD spending
          bitUSDContract.populate("approve", [
            STABILITY_POOL_ADDRESS,
            BigInt(Math.floor(stakeAmount * 1e18)), // Approve exact stake amount
          ]),
          // 2. Provide to stability pool
          stabilityPoolContract.populate("provide_to_sp", [
            BigInt(Math.floor(stakeAmount * 1e18)), // top_up amount in wei
            false, // do_claim = false
          ]),
        ]
      : undefined;

  // Set up the transaction
  const { send, isPending, isSuccess } = useSendTransaction({ calls });

  const getButtonText = () => {
    if (formErrors) {
      return "Check Input";
    }
    if (isPending) {
      return "Staking...";
    }
    if (isSuccess) {
      return "Staked Successfully";
    }
    return "Stake bitUSD";
  };

  // Updated stake submit handler
  const handleStakeSubmit = () => {
    if (calls && !formErrors && stakeAmount && stakeAmount > 0) {
      send();
    }
  };

  // // Debug logging
  // console.log("bitUSD Balance debug:", {
  //     data: bitUSDBalance,
  //     isLoading: isBalanceLoading,
  //     error: balanceError,
  //     address: address,
  //     tokenAddress: USDU_ADDRESS,
  //     contract: bitUSDContract
  // });
  // console.log("Staking Info debug:", {
  //     stakedAmount: stakedAmountData,
  //     isLoadingStaked: isLoadingStakedAmount,
  //     claimableRewards: claimableRewardsData,
  //     isLoadingClaimable: isLoadingClaimableRewards,
  // });

  return (
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <h1 className="text-3xl font-bold mb-2 text-slate-800">Stake bitUSD</h1>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Panel: Staking Input */}
        <div className="md:col-span-2">
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full">
            <CardHeader>
              <CardTitle className="text-slate-700"></CardTitle>
              <CardDescription className="text-slate-500">
                Earn by staking your bitUSD. Current APY:{" "}
                <span className="font-semibold text-green-600">
                  {currentInterestRate?.toFixed(2) || "N/A"}%
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-6">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3 group">
                {/* Row 1: Label and Max Button */}
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="stakeAmount"
                    className="text-base md:text-lg font-medium text-slate-700"
                  >
                    You stake
                  </Label>
                  {/* Always show Max button if user is connected */}
                  {address && (
                    <Button
                      variant="outline"
                      onClick={handleMaxClick}
                      disabled={
                        !bitUSDBalance?.value ||
                        Number(bitUSDBalance.value) === 0
                      }
                      className="h-6 px-2 text-xs rounded-md bg-white border-slate-200 hover:bg-slate-100 transition-colors font-medium"
                    >
                      Max.
                    </Button>
                  )}
                </div>

                {/* Row 2: Input and Token Display */}
                <div className="flex justify-between items-center space-x-4">
                  <div className="flex-grow">
                    <NumericFormat
                      id="stakeAmount"
                      customInput={Input}
                      thousandSeparator=","
                      placeholder="0"
                      inputMode="decimal"
                      allowNegative={false}
                      decimalScale={7}
                      value={stakeAmount}
                      onValueChange={handleStakeAmountChange}
                      isAllowed={(values) => {
                        const { floatValue } = values;
                        if (floatValue === undefined) return true;
                        return floatValue < MAX_LIMIT;
                      }}
                      className="text-3xl md:text-4xl font-semibold h-auto p-0 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none shadow-none tracking-tight text-slate-800"
                    />
                  </div>
                  <div className="w-auto rounded-full h-10 px-4 border border-slate-200 bg-white shadow-sm flex items-center justify-start">
                    <div className="bg-blue-100 p-1 rounded-full mr-2">
                      <span className="text-blue-600 font-bold text-xs">$</span>
                    </div>
                    <span className="font-medium">bitUSD</span>
                  </div>
                </div>

                {/* Row 3: Dollar Value and Balance */}
                <div className="flex justify-between items-center space-x-4">
                  <div className="flex-grow">
                    <NumericFormat
                      className="text-sm text-slate-500 mt-1"
                      displayType="text"
                      value={(bitUSDPrice || 0) * (stakeAmount || 0)}
                      prefix={"≈ $"}
                      thousandSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                    />
                    {formErrors?.issues.map((issue) =>
                      issue.path.includes("stakeAmount") ? (
                        <p
                          key={issue.code + issue.path.join(".")}
                          className="text-xs text-red-500 mt-1"
                        >
                          {issue.message}
                        </p>
                      ) : null
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isBalanceLoading ? (
                      "Balance: Loading..."
                    ) : balanceError ? (
                      "Balance: Error"
                    ) : bitUSDBalance?.value !== undefined ? (
                      <>
                        Balance:{" "}
                        <NumericFormat
                          displayType="text"
                          value={Number(bitUSDBalance.value) / 1e18}
                          thousandSeparator=","
                          decimalScale={3}
                          fixedDecimalScale
                        />{" "}
                        bitUSD
                      </>
                    ) : (
                      "Balance: 0 bitUSD"
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStakeSubmit}
                disabled={
                  !!formErrors ||
                  !stakeAmount ||
                  stakeAmount <= 0 ||
                  !address || // Ensure user is connected
                  isPending
                }
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl shadow-sm hover:shadow transition-all text-base"
              >
                {getButtonText()}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Summary or Info (Optional) */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
            <CardHeader>
              <CardTitle className="text-slate-800">Staking Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-600">Current APY</span>
                <span className="font-semibold text-green-600">
                  {currentInterestRate?.toFixed(2) || "N/A"}%
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-600">Your Staked Amount</span>
                <span className="font-semibold text-slate-800">
                  {isLoadingStakedAmount ? (
                    "Loading..."
                  ) : stakedAmountData !== null &&
                    stakedAmountData !== undefined ? (
                    <NumericFormat
                      displayType="text"
                      value={Number(stakedAmountData) / 1e18}
                      thousandSeparator=","
                      decimalScale={3}
                      fixedDecimalScale
                      suffix=" bitUSD"
                    />
                  ) : (
                    "0 bitUSD"
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-600">Claimable</span>
                <span className="font-semibold text-slate-800">
                  {isLoadingClaimableRewards ? (
                    "Loading..."
                  ) : claimableRewardsData !== null &&
                    claimableRewardsData !== undefined ? (
                    <NumericFormat
                      displayType="text"
                      value={Number(claimableRewardsData) / 1e18}
                      thousandSeparator=","
                      decimalScale={3}
                      fixedDecimalScale
                      suffix=" bitUSD"
                    />
                  ) : (
                    "0 bitUSD"
                  )}
                </span>
              </div>
              <Separator className="bg-slate-100 my-2" />
            </CardContent>
            <CardFooter className="flex flex-col items-stretch pt-4">
              {/* TODO: Add logic to fetch actual pending rewards */}
              <Button
                variant="outline"
                className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => alert("Claiming rewards (not implemented yet)")}
                disabled={
                  !claimableRewardsData || Number(claimableRewardsData) === 0
                }
              >
                Claim Pending Rewards
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default StakePage;

// Assuming Route.MetaArgs is defined similarly to borrow.tsx
// You might need to adjust this based on your actual Route type
// import type { Route } from "./+types/dashboard";
// export function meta({}: Route.MetaArgs) {
export function meta() {
  // Simplified if Route type is not immediately available
  return [
    { title: "Stake bitUSD - BitUSD Protocol" },
    {
      name: "description",
      content: "Stake your bitUSD to earn.",
    },
  ];
}
