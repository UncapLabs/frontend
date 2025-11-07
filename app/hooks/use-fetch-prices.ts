import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/lib/trpc";
import { type CollateralId } from "~/lib/collateral";

interface CollateralPriceOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch collateral price for a specific collateral type
 * @param collateralType - The type of collateral (WWBTC, UBTC, GBTC)
 * @param options - Optional configuration
 */
export function useCollateralPrice(
  collateralType: CollateralId,
  options: CollateralPriceOptions = {}
) {
  const { enabled = true } = options;
  const trpc = useTRPC();

  const query = useQuery({
    ...trpc.priceRouter.getBitcoinPrice.queryOptions({ collateralType }),
    enabled,
    refetchInterval: enabled ? 30000 : false,
    staleTime: 10000,
  });

  return query.data;
}

interface UsduPriceOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch USDU price
 * @param options - Optional configuration
 */
export function useUsduPrice(options: UsduPriceOptions = {}) {
  const { enabled = true } = options;
  const trpc = useTRPC();

  const query = useQuery({
    ...trpc.priceRouter.getUSDUPrice.queryOptions(),
    enabled,
    refetchInterval: enabled ? 30000 : false,
    staleTime: 10000,
  });

  return query.data;
}
