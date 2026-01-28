import { publicProcedure, router } from "../trpc";
import Big from "big.js";

// --- Lagoon Vault ---

const LAGOON_VAULT_ADDRESS = "0xeff2c1cc0e3bbb6bedc9622a309ed75eab730521";
const LAGOON_CHAIN_ID = 1;
const LAGOON_DEPOSIT_URL = `https://app.lagoon.finance/vault/${LAGOON_CHAIN_ID}/${LAGOON_VAULT_ADDRESS}`;
const LAGOON_CACHE_KEY = "lagoon-vault-data";
const LAGOON_CACHE_TTL = 5 * 60; // 5 minutes

function getLagoonCacheKey(): string {
  const network = process.env.NETWORK || "sepolia";
  return `${network}:${LAGOON_CACHE_KEY}`;
}

type LagoonVaultData = {
  name: string;
  symbol: string;
  description: string;
  shortDescription: string;
  depositUrl: string;
  curator: { name: string } | null;
  underlyingAsset: { symbol: string };
};

// Types matching the actual mNAV worker response
type MnavStabilityPool = {
  usdu: string;
  usduYieldGain: string;
  collateralGain: string;
  stashedColl: string;
};

type MnavBranch = {
  branchName: string;
  collateral: string; // 18 decimals (wrapped)
  debt: string; // 18 decimals
  stabilityPool: MnavStabilityPool;
};

type MnavWorkerResponse = {
  timestamp: string; // ISO date string
  network: "mainnet" | "sepolia";
  blockNumbers: {
    ethereum: number;
    starknet: number;
  };
  positions: {
    ethereum: {
      wbtc: string;
    };
    starknet: {
      wbtc: string;
      usdu: string;
      usdc: string;
      usdcE: string;
    };
    uncap: {
      branches: {
        WWBTC: MnavBranch;
        TBTC: MnavBranch;
        SOLVBTC: MnavBranch;
      };
      totals: {
        collateral: string;
        debt: string;
        spUsdu: string;
        spYieldGain: string;
        spCollGain: string;
      };
    };
    extended: {
      valueUsd: string;
      valueUsdFormatted: string;
    };
  };
  prices: {
    wbtcUsd: string;
    wbtcUsdRaw: string;
  };
  totalAssets: string;
  totalAssetsFormatted: string;
  totalValueUsd: string;
  calculationVersion: string;
  warnings: string[];
};

// Types for the processed response sent to frontend
export type VaultBranchPosition = {
  branchId: number;
  branchName: string;
  collateral: string; // 18 decimals (wrapped)
  debt: string; // 18 decimals
  stabilityPoolUsdu: string; // 18 decimals
  stabilityPoolYieldGain: string; // 18 decimals
};

export type VaultWalletBalances = {
  ethereum: {
    wbtc: string; // raw value (8 decimals)
    totalUsd: string; // USD value
  };
  starknet: {
    wbtc: string; // 8 decimals
    usdu: string; // 18 decimals
    usdc: string; // 6 decimals
    usdce: string; // 6 decimals
    totalUsd: string; // USD value
  };
};

export type VaultAllocation = {
  name: string;
  value: number; // percentage
  usdValue: string;
};

export type VaultAnalyticsData = {
  timestamp: string; // ISO date string
  blockNumbers: {
    ethereum: number;
    starknet: number;
  };
  btcPrice: string;
  network: "mainnet" | "sepolia";
  totalNavUsd: string;
  totalNavWbtc: string;
  allocations: VaultAllocation[];
  branches: VaultBranchPosition[];
  walletBalances: VaultWalletBalances;
  extendedVaultUsd: string;
  warnings: string[];
};

const BRANCH_NAME_TO_ID: Record<string, number> = {
  WWBTC: 0,
  TBTC: 1,
  SOLVBTC: 2,
};

export const vaultRouter = router({
  getLagoonVault: publicProcedure.query(async ({ ctx }): Promise<LagoonVaultData | null> => {
    const cacheKey = getLagoonCacheKey();
    try {
      const cached = await ctx.env.CACHE.get(cacheKey, "json");
      if (cached) return cached as LagoonVaultData;
    } catch {
      // Cache read failed, proceed with fresh fetch
    }

    try {
      const url = `https://app.lagoon.finance/api/vault?chainId=${LAGOON_CHAIN_ID}&address=${LAGOON_VAULT_ADDRESS}&includeApr=true`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        console.error(`Lagoon API error: ${response.status}`);
        return null;
      }

      // biome-ignore lint: Lagoon API response has dynamic shape
      const raw: any = await response.json();

      const result: LagoonVaultData = {
        name: raw.name ?? "",
        symbol: raw.symbol ?? "",
        description: raw.description ?? "",
        shortDescription: raw.shortDescription ?? "",
        depositUrl: LAGOON_DEPOSIT_URL,
        curator: raw.curators?.[0] ? { name: raw.curators[0].name } : null,
        underlyingAsset: { symbol: raw.asset?.symbol ?? "WBTC" },
      };

      try {
        await ctx.env.CACHE.put(cacheKey, JSON.stringify(result), {
          expirationTtl: LAGOON_CACHE_TTL,
        });
      } catch {
        // Cache write failed, not critical
      }

      return result;
    } catch (error) {
      console.error("Failed to fetch Lagoon vault data:", error);
      return null;
    }
  }),

  getAnalytics: publicProcedure.query(async ({ ctx }): Promise<VaultAnalyticsData> => {
    // Call uncap-jobs worker via service binding
    const response = await ctx.env.UNCAP_JOBS.fetch(
      new Request("https://uncap-jobs/api/mnav", {
        method: "GET",
      })
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`mNAV worker error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = (await response.json()) as MnavWorkerResponse;

    // Parse BTC price
    const btcPrice = new Big(data.prices.wbtcUsd);

    // Parse total NAV (remove $ and parse)
    const totalNavUsdStr = data.totalValueUsd.replace(/[$,]/g, "");
    const totalNavUsd = new Big(totalNavUsdStr);

    // Parse total assets (WBTC amount - raw is in 8 decimals)
    const totalNavWbtc = new Big(data.totalAssets).div(1e8);

    // Transform branches to our format
    const branches: VaultBranchPosition[] = Object.entries(data.positions.uncap.branches).map(
      ([key, branch]) => ({
        branchId: BRANCH_NAME_TO_ID[key] ?? 0,
        branchName: branch.branchName,
        collateral: branch.collateral,
        debt: branch.debt,
        stabilityPoolUsdu: branch.stabilityPool.usdu,
        stabilityPoolYieldGain: branch.stabilityPool.usduYieldGain,
      })
    );

    // Calculate allocation breakdown
    const allocations: VaultAllocation[] = [];

    if (totalNavUsd.gt(0)) {
      // Uncap NET value = Collateral Value - Debt
      const uncapCollateralWbtc = new Big(data.positions.uncap.totals.collateral).div(1e18);
      const uncapCollateralUsd = uncapCollateralWbtc.times(btcPrice);
      const uncapDebtUsd = new Big(data.positions.uncap.totals.debt).div(1e18); // USDU is ~1 USD
      const uncapNetUsd = uncapCollateralUsd.minus(uncapDebtUsd);

      if (uncapNetUsd.gt(0)) {
        allocations.push({
          name: "Uncap Positions",
          value: uncapNetUsd.div(totalNavUsd).times(100).toNumber(),
          usdValue: uncapNetUsd.toFixed(2),
        });
      }

      // Extended vault (optional field) - valueUsd is in 6 decimals
      const extendedVaultUsd = new Big(data.positions.extended?.valueUsd ?? "0").div(1e6);
      if (extendedVaultUsd.gt(0)) {
        allocations.push({
          name: "Extended Vault",
          value: extendedVaultUsd.div(totalNavUsd).times(100).toNumber(),
          usdValue: extendedVaultUsd.toFixed(2),
        });
      }

      // Wallet holdings (calculated below, reused)
      const ethWbtc = new Big(data.positions.ethereum.wbtc).div(1e8);
      const snWbtc = new Big(data.positions.starknet.wbtc).div(1e8);
      const snUsdu = new Big(data.positions.starknet.usdu).div(1e18);
      const snUsdc = new Big(data.positions.starknet.usdc).div(1e6);
      const snUsdce = new Big(data.positions.starknet.usdcE ?? "0").div(1e6);

      const walletUsd = ethWbtc.plus(snWbtc).times(btcPrice).plus(snUsdu).plus(snUsdc).plus(snUsdce);
      if (walletUsd.gt(0)) {
        allocations.push({
          name: "Wallet Holdings",
          value: walletUsd.div(totalNavUsd).times(100).toNumber(),
          usdValue: walletUsd.toFixed(2),
        });
      }

      // Stability Pool deposits + yield gain
      const spUsdu = new Big(data.positions.uncap.totals.spUsdu).div(1e18);
      const spYieldGain = new Big(data.positions.uncap.totals.spYieldGain).div(1e18);
      const spTotalValue = spUsdu.plus(spYieldGain);
      if (spTotalValue.gt(0)) {
        allocations.push({
          name: "Stability Pool",
          value: spTotalValue.div(totalNavUsd).times(100).toNumber(),
          usdValue: spTotalValue.toFixed(2),
        });
      }
    }

    // Calculate wallet USD totals
    const ethWbtcAmount = new Big(data.positions.ethereum.wbtc).div(1e8);
    const ethTotalUsd = ethWbtcAmount.times(btcPrice);

    const snWbtcAmount = new Big(data.positions.starknet.wbtc).div(1e8);
    const snUsduAmount = new Big(data.positions.starknet.usdu).div(1e18);
    const snUsdcAmount = new Big(data.positions.starknet.usdc).div(1e6);
    const snUsdceAmount = new Big(data.positions.starknet.usdcE ?? "0").div(1e6);
    const snTotalUsd = snWbtcAmount.times(btcPrice).plus(snUsduAmount).plus(snUsdcAmount).plus(snUsdceAmount);

    const result = {
      timestamp: data.timestamp,
      blockNumbers: data.blockNumbers,
      btcPrice: data.prices.wbtcUsd,
      network: data.network,
      totalNavUsd: totalNavUsd.toFixed(2),
      totalNavWbtc: totalNavWbtc.toFixed(8),
      allocations,
      branches,
      walletBalances: {
        ethereum: {
          wbtc: data.positions.ethereum.wbtc,
          totalUsd: ethTotalUsd.toFixed(2),
        },
        starknet: {
          wbtc: data.positions.starknet.wbtc,
          usdu: data.positions.starknet.usdu,
          usdc: data.positions.starknet.usdc,
          usdce: data.positions.starknet.usdcE ?? "0",
          totalUsd: snTotalUsd.toFixed(2),
        },
      },
      extendedVaultUsd: new Big(data.positions.extended?.valueUsd ?? "0").div(1e6).toFixed(2),
      warnings: data.warnings ?? [],
    };

    return result;
  }),
});

export type VaultRouter = typeof vaultRouter;
