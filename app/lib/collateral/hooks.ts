// Add missing imports
import { useState, useCallback, useMemo } from "react";
import {
  COLLATERALS,
  DEFAULT_COLLATERAL,
  getCollateral,
  getCollateralByAddress,
  type Collateral,
  type CollateralId,
} from "./index";

/**
 * Hook to get collateral configuration by ID or address
 * @param idOrAddress - Collateral ID (e.g., "UBTC") or token address
 * @returns Collateral configuration object
 */
export function useCollateral(idOrAddress?: string | null): Collateral {
  const collateral = useMemo(() => {
    if (!idOrAddress) return DEFAULT_COLLATERAL;

    // Try as ID first
    if (idOrAddress in COLLATERALS) {
      return getCollateral(idOrAddress as CollateralId);
    }

    // Try as address
    const byAddress = getCollateralByAddress(idOrAddress);
    if (byAddress) return byAddress;

    // Fallback to default
    return DEFAULT_COLLATERAL;
  }, [idOrAddress]);

  return collateral;
}

/**
 * Hook to get all available collaterals
 * @returns Array of all collateral configurations
 */
export function useCollateralList(): Collateral[] {
  return Object.values(COLLATERALS);
}

/**
 * Hook to manage collateral selection state
 * @param defaultId - Default collateral ID
 * @returns Current collateral and selection handler
 */
export function useCollateralSelection(defaultId: CollateralId = "UBTC") {
  const [selectedId, setSelectedId] = useState<CollateralId>(defaultId);
  const collateral = useCollateral(selectedId);

  const selectCollateral = useCallback((id: CollateralId) => {
    setSelectedId(id);
  }, []);

  return {
    collateral,
    selectedId,
    selectCollateral,
  };
}

// Backwards compatibility - to be removed after migration
export function useCollateralToken(selectedTokenAddress: string) {
  const collateral = useCollateral(selectedTokenAddress);

  // Return in old format for compatibility
  return {
    selectedCollateralToken: {
      address: collateral.addresses.token,
      symbol: collateral.symbol,
      decimals: collateral.decimals,
      icon: collateral.icon,
      collateralType: collateral.id,
      ...(collateral.underlyingToken && {
        underlyingAddress: collateral.underlyingToken.address,
        underlyingDecimals: collateral.underlyingToken.decimals,
      }),
    },
  };
}
