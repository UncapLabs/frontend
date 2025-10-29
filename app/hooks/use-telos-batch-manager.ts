import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import { useMemo } from "react";
import Big from "big.js";
import type { Collateral } from "~/lib/collateral";
import type { RateMode } from "~/components/borrow/rate-mode-selector";

interface UseTelosBatchMetadataOptions {
  branchId?: number;
  batchManagerAddress?: string;
  enabled?: boolean;
  refetchIntervalMs?: number;
}

export function useTelosBatchMetadata(
  options: UseTelosBatchMetadataOptions = {}
) {
  const trpc = useTRPC();
  const {
    branchId = 0,
    batchManagerAddress,
    enabled = true,
    refetchIntervalMs = 30_000,
  } = options;

  return useQuery({
    ...trpc.interestRouter.getTelosBatchMetadata.queryOptions({
      branchId,
      batchManagerAddress,
    }),
    staleTime: refetchIntervalMs,
    refetchInterval: refetchIntervalMs,
    enabled,
  });
}

interface UseTelosManagedInfoOptions {
  telosBatch: ReturnType<typeof useTelosBatchMetadata>;
  collateral: Collateral;
  manualInterestRate: Big;
  rateMode: RateMode;
  collateralRatio?: Big;
  hasBorrowValues?: boolean;
}

export function useTelosManagedInfo({
  telosBatch,
  collateral,
  manualInterestRate,
  rateMode,
  collateralRatio,
  hasBorrowValues = false,
}: UseTelosManagedInfoOptions) {
  return useMemo(() => {
    const isLoadingTelosData =
      rateMode === "managed" &&
      !telosBatch.data &&
      (telosBatch.isPending || telosBatch.isFetching);

    const telosAprPercent = telosBatch.data
      ? telosBatch.data.annualInterestRate.times(100)
      : undefined;
    const telosFeePercent = telosBatch.data
      ? telosBatch.data.annualManagementFee.times(100)
      : undefined;
    const telosBcrPercent = telosBatch.data
      ? telosBatch.data.bcrRequirement.times(100)
      : undefined;
    const telosCooldownSeconds =
      telosBatch.data?.minInterestRateChangePeriodSeconds;
    const telosBatchManagerAddress =
      telosBatch.data?.batchManagerAddress ??
      collateral.defaultInterestManager ??
      collateral.addresses.batchManager;

    const effectiveInterestRate =
      rateMode === "managed" && telosAprPercent
        ? telosAprPercent
        : manualInterestRate;

    const managedInterestInfo = {
      apr: telosAprPercent,
      fee: telosFeePercent,
      cooldownSeconds: telosCooldownSeconds,
      cooldownEndsAt: telosBatch.data?.cooldownEndsAt,
      bcr: telosBcrPercent,
      batchManagerLabel: "Telos",
      isLoading: telosBatch.isLoading || isLoadingTelosData,
      isError: telosBatch.isError,
      managedDebt: telosBatch.data?.managedDebt,
    };

    // Calculate Telos disable reason
    const telosRequirementRatio = collateral.minCollateralizationRatio.plus(
      telosBatch.data?.bcrRequirement ?? new Big(0)
    );
    const telosRequirementPercent = telosRequirementRatio.times(100);
    const telosMeetsBcr =
      hasBorrowValues && collateralRatio
        ? collateralRatio.gte(telosRequirementPercent)
        : true;

    let telosDisableReason: string | undefined;
    if (isLoadingTelosData) {
      telosDisableReason = "Loading Telos settings...";
    } else if (telosBatch.isError) {
      telosDisableReason =
        "Unable to load Telos settings. Please try again later.";
    } else if (hasBorrowValues && telosBatch.data && !telosMeetsBcr) {
      telosDisableReason = `Increase collateral or reduce debt to reach at least ${telosRequirementPercent.toFixed(
        2
      )}% collateral ratio required by Telos.`;
    }

    const telosManagedDisabled = Boolean(telosDisableReason);

    return {
      effectiveInterestRate,
      telosBatchManagerAddress,
      managedInterestInfo,
      telosDisableReason,
      telosManagedDisabled,
    };
  }, [
    rateMode,
    telosBatch,
    collateral,
    manualInterestRate,
    collateralRatio,
    hasBorrowValues,
  ]);
}
