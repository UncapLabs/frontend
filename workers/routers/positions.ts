import { z } from "zod/v4";
import { publicProcedure, router } from "../trpc";
import { Contract, RpcProvider } from "starknet";
import {
  getCollateralAddresses,
  UBTC_TOKEN,
  GBTC_TOKEN,
  type CollateralType,
} from "~/lib/contracts/constants";
import { getBitcoinprice } from "workers/services/utils";
import { TROVE_MANAGER_ABI } from "~/lib/contracts";

const USDU_DECIMALS = 18;
const MCR_VALUE = 1.1;
const CCR_VALUE = 1.5;
const INTEREST_RATE_SCALE_DOWN_FACTOR = 10n ** 16n;

export interface Position {
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

const formatBigIntToNumber = (value: bigint, decimals: number): number => {
  if (decimals === 0) return Number(value);
  const factor = Math.pow(10, decimals);
  return Number(value.toString()) / factor;
};

const formatInterestRateForDisplay = (rawValue: bigint): number => {
  return Number(rawValue) / Number(INTEREST_RATE_SCALE_DOWN_FACTOR);
};

export const positionsRouter = router({
  getUserOnChainPositions: publicProcedure
    .input(
      z.object({
        userAddress: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { userAddress } = input;

      if (!process.env.NODE_URL) {
        console.error("NODE_URL environment variable is not defined");
        throw new Error("RPC node URL not configured");
      }

      const myProvider = new RpcProvider({
        nodeUrl: process.env.NODE_URL,
      });

      try {
        // Get positions for all collateral types
        const allPositions: Position[] = [];
        
        // Query UBTC positions
        const ubtcAddresses = getCollateralAddresses("UBTC");
        const ubtcTroveManager = new Contract(
          TROVE_MANAGER_ABI,
          ubtcAddresses.troveManager,
          myProvider
        );
        
        const ubtcPositionsResult = await ubtcTroveManager.get_owner_to_positions(userAddress);
        const ubtcTroveIds: bigint[] = Array.isArray(ubtcPositionsResult) ? ubtcPositionsResult : [];
        
        // Query GBTC positions
        const gbtcAddresses = getCollateralAddresses("GBTC");
        const gbtcTroveManager = new Contract(
          TROVE_MANAGER_ABI,
          gbtcAddresses.troveManager,
          myProvider
        );
        
        const gbtcPositionsResult = await gbtcTroveManager.get_owner_to_positions(userAddress);
        const gbtcTroveIds: bigint[] = Array.isArray(gbtcPositionsResult) ? gbtcPositionsResult : [];

        // Fetch Bitcoin price once outside the loop
        const bitcoinPrice = await getBitcoinprice();

        // Process UBTC positions
        const processPositions = async (
          troveIds: bigint[],
          troveManager: Contract,
          collateralToken: typeof UBTC_TOKEN | typeof GBTC_TOKEN
        ): Promise<(Position | null)[]> => {
          const batchSize = 1;
          const resolvedPositions: (Position | null)[] = [];

          for (let i = 0; i < troveIds.length; i += batchSize) {
            const batch = troveIds.slice(i, i + batchSize);
            const batchPromises = batch.map(async (troveId: bigint) => {
              try {
                const latestTroveData = await troveManager.get_latest_trove_data(troveId);

                if (
                  !latestTroveData ||
                  typeof latestTroveData.entire_coll === "undefined" ||
                  typeof latestTroveData.entire_debt === "undefined"
                ) {
                  console.warn(
                    "Incomplete or undefined latestTroveData for troveId:",
                    troveId.toString()
                  );
                  return null;
                }

                const collateralAmount = formatBigIntToNumber(
                  latestTroveData.entire_coll as bigint,
                  collateralToken.decimals
                );
                const borrowedAmount = formatBigIntToNumber(
                  latestTroveData.entire_debt as bigint,
                  USDU_DECIMALS
                );

                const collateralValue =
                  collateralAmount * (Number(bitcoinPrice) / 1e18);

                let healthFactor = Infinity;
                if (borrowedAmount > 0) {
                  healthFactor = collateralValue / borrowedAmount / MCR_VALUE;
                }

                let liquidationPrice = 0;
                if (collateralAmount > 0) {
                  liquidationPrice =
                    (borrowedAmount * MCR_VALUE) / collateralAmount;
                }

                const debtLimit = collateralValue / CCR_VALUE;
                const interestRate = formatInterestRateForDisplay(
                  latestTroveData.annual_interest_rate as bigint
                );

                return {
                  id: troveId.toString(),
                  collateralAsset: collateralToken.symbol,
                  collateralAmount,
                  collateralValue,
                  borrowedAsset: "USDU",
                  borrowedAmount,
                  healthFactor,
                  liquidationPrice,
                  debtLimit,
                  interestRate,
                } as Position;
              } catch (error) {
                console.error(`Error fetching data for trove ${troveId}:`, error);
                return null;
              }
            });

            const batchResults = await Promise.all(batchPromises);
            resolvedPositions.push(...batchResults);

            // Add small delay between batches if needed
            if (i + batchSize < troveIds.length) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }

          return resolvedPositions;
        };

        // Process positions for both collateral types
        const [ubtcPositions, gbtcPositions] = await Promise.all([
          processPositions(ubtcTroveIds, ubtcTroveManager, UBTC_TOKEN),
          processPositions(gbtcTroveIds, gbtcTroveManager, GBTC_TOKEN)
        ]);

        // Combine all positions
        const allResolvedPositions = [...ubtcPositions, ...gbtcPositions];
        const filteredPositions = allResolvedPositions.filter(
          (p) => p !== null
        ) as Position[];
        
        console.log("All positions:", filteredPositions);
        return { positions: filteredPositions };
      } catch (error) {
        console.error(
          "Error fetching user positions in tRPC procedure:",
          error
        );
        throw new Error("Failed to fetch on-chain positions");
      }
    }),
});

export type PositionsRouter = typeof positionsRouter;
