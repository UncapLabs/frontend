import { RpcProvider } from "starknet";
import Big from "big.js";
import { contractRead } from "~/lib/contracts/calls";
import { getCollateral, type CollateralId } from "~/lib/collateral";
import { bigintToBig } from "~/lib/decimal";

export interface TelosBatchMetadata {
  collateralId: CollateralId;
  batchManagerAddress: string;
  annualInterestRate: Big;
  minInterestRate: Big;
  maxInterestRate: Big;
  annualManagementFee: Big;
  minInterestRateChangePeriodSeconds: number;
  bcrRequirement: Big;
  lastInterestRateAdjustment: number;
  lastDebtUpdateTime: number;
  managedDebt: Big;
}

export async function fetchTelosBatchMetadata(
  provider: RpcProvider,
  collateralId: CollateralId,
  batchManagerAddress?: string
): Promise<TelosBatchMetadata> {
  const collateral = getCollateral(collateralId);
  const managerAddress =
    batchManagerAddress ??
    collateral.defaultInterestManager ??
    "0x0";

  const [batchData, config, bcr] = await Promise.all([
    contractRead.batchManager.getLatestBatchData(
      provider,
      collateralId,
      managerAddress
    ),
    contractRead.borrowerOperations.getInterestBatchManager(
      provider,
      collateralId,
      managerAddress
    ),
    contractRead.borrowerOperations.getBcr(provider, collateralId),
  ]);

  return {
    collateralId,
    batchManagerAddress: managerAddress,
    annualInterestRate: bigintToBig(batchData.annualInterestRate, 18),
    minInterestRate: bigintToBig(config.minInterestRate, 18),
    maxInterestRate: bigintToBig(config.maxInterestRate, 18),
    annualManagementFee: bigintToBig(batchData.annualManagementFee, 18),
    minInterestRateChangePeriodSeconds: Number(
      config.minInterestRateChangePeriod
    ),
    bcrRequirement: bigintToBig(bcr, 18),
    lastInterestRateAdjustment: Number(batchData.lastInterestRateAdjTime),
    lastDebtUpdateTime: Number(batchData.lastDebtUpdateTime),
    managedDebt: bigintToBig(
      batchData.entireDebtWithoutRedistribution,
      18
    ),
  };
}
