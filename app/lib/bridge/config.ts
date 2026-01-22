import { type CollateralId, COLLATERALS } from "~/lib/collateral";

// Source chain types
export type SourceChainId =
  | "bitcoin"
  | "ethereum"
  | "base"
  | "arbitrum"
  | "optimism"
  | "polygon"
  | "bnb"
  | "avalanche";

export interface SourceChain {
  id: SourceChainId;
  name: string;
  icon: string;
}

// Main source chains shown in the UI selector
export const SOURCE_CHAINS: SourceChain[] = [
  { id: "ethereum", name: "Ethereum", icon: "/eth.svg" },
  { id: "base", name: "Base", icon: "/base.jpg" },
  { id: "arbitrum", name: "Arbitrum", icon: "/arbitrum.jpg" },
  { id: "optimism", name: "Optimism", icon: "/optimism.jpg" },
  { id: "polygon", name: "Polygon", icon: "/polygon.jpg" },
  { id: "bnb", name: "BNB Chain", icon: "/bnb.jpg" },
  { id: "avalanche", name: "Avalanche", icon: "/avalanche.png" },
  { id: "bitcoin", name: "Bitcoin", icon: "/bitcoin.png" },
];

// Source token types for bridging
export type SourceTokenId = "WBTC" | "SOLVBTC" | "TBTC" | "USDC" | "USDT" | "BTC";

export interface SourceToken {
  id: SourceTokenId;
  name: string;
  icon: string;
  // Which chains this token is available on
  availableOn: SourceChainId[];
}

// All EVM chains where Rhino can bridge+swap any token
const ALL_EVM_CHAINS: SourceChainId[] = [
  "ethereum", "base", "arbitrum", "optimism", "polygon", "bnb", "avalanche"
];

// All source tokens available for bridging
// Since Rhino can accept any token and swap it, we show all tokens on all EVM chains
export const SOURCE_TOKENS: SourceToken[] = [
  // BTC-based tokens - available on all EVM chains (Rhino can swap, direct bridges filter by their own rules)
  { id: "WBTC", name: "WBTC", icon: "/wbtc.png", availableOn: ALL_EVM_CHAINS },
  { id: "SOLVBTC", name: "SolvBTC", icon: "/SolvBTC.png", availableOn: ALL_EVM_CHAINS },
  { id: "TBTC", name: "tBTC", icon: "/tbtc.webp", availableOn: ALL_EVM_CHAINS },
  // Stablecoins - available on all EVM chains (Rhino bridge + swap)
  { id: "USDC", name: "USDC", icon: "/usdc.svg", availableOn: ALL_EVM_CHAINS },
  { id: "USDT", name: "USDT", icon: "/tether.png", availableOn: ALL_EVM_CHAINS },
  // Native BTC (for Atomiq from Bitcoin network)
  { id: "BTC", name: "BTC", icon: "/bitcoin.png", availableOn: ["bitcoin"] },
];

// Get available source tokens for a given chain
export function getSourceTokensForChain(chainId: SourceChainId): SourceToken[] {
  return SOURCE_TOKENS.filter((token) => token.availableOn.includes(chainId));
}

// Map source token to its "native" destination collateral on Starknet
// This is used to determine if a bridge can handle the transfer directly (same asset)
// or if a swap is required (different asset)
export function getSourceTokenNativeCollateral(sourceToken: SourceTokenId): CollateralId | null {
  switch (sourceToken) {
    case "WBTC":
      return "WWBTC";
    case "SOLVBTC":
      return "SOLVBTC";
    case "TBTC":
      return "TBTC";
    case "BTC":
      return "WWBTC"; // Native BTC bridges to WBTC on Starknet
    case "USDC":
    case "USDT":
      return null; // Stablecoins require a swap, no native collateral
    default:
      return null;
  }
}

// Rhino source token types (for URL generation)
export type RhinoSourceToken = "USDT" | "USDC";

// Bridge provider types
export type BridgeProviderId = "stargate" | "starkgate" | "rhino" | "atomiq";

export interface BridgeProvider {
  id: BridgeProviderId;
  name: string;
  description: string;
  icon: string;
  supportedChains: SourceChainId[];
  supportedSourceTokens: SourceTokenId[];
  supportedCollaterals: CollateralId[];
  // Whether this bridge supports the swap feature (like Rhino)
  supportsSwap?: boolean;
  getUrl: (params: {
    sourceChain: SourceChainId;
    collateral: CollateralId;
    sourceToken?: RhinoSourceToken;
    amount?: string;
  }) => string;
}

// Map chain IDs to Stargate's chain names
const STARGATE_CHAIN_MAP: Record<string, string> = {
  ethereum: "ethereum",
  base: "base",
};

// Normalize Starknet address for URL usage (remove leading zeros after 0x)
function normalizeStarknetAddress(address: string): string {
  return address.replace(/^0x0+/, "0x");
}

// Source token addresses per chain for Stargate
const STARGATE_SOURCE_TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  WBTC: {
    ethereum: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    base: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
  },
  SOLVBTC: {
    ethereum: "0x7A56E1C57C7475CCf742a1832B028F0456652F97",
  },
};

// Map chain IDs to Rhino's chain names
const RHINO_CHAIN_MAP: Record<string, string> = {
  ethereum: "ETHEREUM",
  base: "BASE",
  arbitrum: "ARBITRUM",
  optimism: "OPTIMISM",
  polygon: "POLYGON",
  bnb: "BSC",
  avalanche: "AVALANCHE",
};

// Bridge providers configuration
export const BRIDGE_PROVIDERS: BridgeProvider[] = [
  {
    id: "stargate",
    name: "Stargate",
    description: "LayerZero-powered bridge with deep liquidity across many chains",
    icon: "/stargate.png",
    supportedChains: ["ethereum", "base"],
    supportedSourceTokens: ["WBTC", "SOLVBTC"],
    supportedCollaterals: ["WWBTC", "SOLVBTC"],
    getUrl: ({ sourceChain, collateral, amount }) => {
      const srcChain = STARGATE_CHAIN_MAP[sourceChain] || "ethereum";
      // Get source token based on destination collateral
      const sourceToken = collateral === "SOLVBTC" ? "SOLVBTC" : "WBTC";
      const srcTokenAddress = STARGATE_SOURCE_TOKEN_ADDRESSES[sourceToken]?.[sourceChain];
      // Get destination token address on Starknet
      // For WBTC, use the underlying WBTC address (not wrapped WWBTC)
      // For SOLVBTC, use the collateral address directly
      const dstTokenAddress = collateral === "WWBTC"
        ? COLLATERALS.WWBTC.underlyingToken?.address
        : COLLATERALS[collateral]?.addresses.token;

      let url = `https://stargate.finance/?srcChain=${srcChain}&dstChain=starknet`;
      if (srcTokenAddress) {
        url += `&srcToken=${srcTokenAddress}`;
      }
      if (dstTokenAddress) {
        url += `&dstToken=${normalizeStarknetAddress(dstTokenAddress)}`;
      }
      if (amount) {
        url += `&amount=${amount}`;
      }
      return url;
    },
  },
  {
    id: "starkgate",
    name: "StarkGate",
    description: "Official Starknet canonical bridge from Ethereum",
    icon: "/starknet.png",
    supportedChains: ["ethereum"],
    supportedSourceTokens: ["WBTC", "TBTC", "SOLVBTC"],
    supportedCollaterals: ["WWBTC", "TBTC", "SOLVBTC"],
    getUrl: () => {
      return "https://starkgate.starknet.io/ethereum/bridge?mode=deposit&utm_source=uncap.finance";
    },
  },
  {
    id: "rhino",
    name: "Rhino.fi",
    description: "Bridge and swap any token directly to WBTC on Starknet",
    icon: "/rhinofi.jpg",
    supportedChains: [
      "ethereum",
      "base",
      "arbitrum",
      "optimism",
      "polygon",
      "bnb",
      "avalanche",
    ],
    supportedSourceTokens: ["WBTC", "USDC", "USDT"],
    supportedCollaterals: ["WWBTC"],
    supportsSwap: true,
    getUrl: ({ sourceChain, sourceToken, amount }) => {
      const chainIn = RHINO_CHAIN_MAP[sourceChain] || "ETHEREUM";
      const token = sourceToken || "ETH";
      let url = `https://app.rhino.fi/bridge?mode=pay&chainIn=${chainIn}&chainOut=STARKNET&token=${token}&tokenOut=WBTC`;
      if (amount) {
        url += `&amount=${amount}`;
      }
      return url;
    },
  },
  {
    id: "atomiq",
    name: "Atomiq Exchange",
    description: "Trustless cross-chain DEX for native Bitcoin to Starknet",
    icon: "/atomic.jpg",
    supportedChains: ["bitcoin"],
    supportedSourceTokens: ["BTC"],
    supportedCollaterals: ["WWBTC"],
    getUrl: () => {
      return "https://app.atomiq.exchange/?utm_source=uncap.finance";
    },
  },
];

/**
 * Get available bridge providers based on selected source chain, source token, and destination collateral
 *
 * Logic:
 * - All bridges: Must support the source token
 * - Direct bridges (Stargate, StarkGate): Only shown when source token maps to destination collateral (same asset)
 * - Swap bridges (Rhino): Shown if chain and source token are supported - they output WBTC, user can swap on Starknet
 * - Atomiq: Only for BTC from Bitcoin chain → WBTC
 */
export function getAvailableBridges(
  sourceChain: SourceChainId | null,
  sourceToken: SourceTokenId | null,
  destCollateral: CollateralId | null
): BridgeProvider[] {
  // Get the native collateral for the source token
  const sourceNativeCollateral = sourceToken ? getSourceTokenNativeCollateral(sourceToken) : null;

  // Check if this is a "same asset" bridge (source token maps to destination collateral)
  const isSameAsset = sourceNativeCollateral && destCollateral && sourceNativeCollateral === destCollateral;

  return BRIDGE_PROVIDERS.filter((bridge) => {
    // Filter by supported chains
    if (sourceChain && !bridge.supportedChains.includes(sourceChain)) {
      return false;
    }

    // Filter by supported source tokens
    if (sourceToken && !bridge.supportedSourceTokens.includes(sourceToken)) {
      return false;
    }

    // Filter by supported destination collateral
    if (destCollateral && !bridge.supportedCollaterals.includes(destCollateral)) {
      return false;
    }

    // Swap bridges (like Rhino) pass if chain, source token, and collateral are supported
    if (bridge.supportsSwap) {
      return true;
    }

    // Direct bridges require same asset bridging (source token maps to destination collateral)
    return isSameAsset;
  });
}

/**
 * Get source chain by ID
 */
export function getSourceChain(id: SourceChainId): SourceChain | undefined {
  return SOURCE_CHAINS.find((chain) => chain.id === id);
}
