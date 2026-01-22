import { Label } from "~/components/ui/label";
import { InfoBox } from "~/components/ui/info-box";
import { ArrowIcon } from "~/components/icons/arrow-icon";
import { ExternalLink } from "lucide-react";
import { useQueryState, parseAsStringEnum, parseAsString } from "nuqs";
import { createMeta } from "~/lib/utils/meta";
import type { Route } from "./+types/bridge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import {
  COLLATERAL_LIST,
  DEFAULT_COLLATERAL,
  getCollateralByAddress,
} from "~/lib/collateral";
import {
  SOURCE_CHAINS,
  getAvailableBridges,
  getSourceTokensForChain,
  type SourceChainId,
  type SourceTokenId,
  type RhinoSourceToken,
  type BridgeProvider,
} from "~/lib/bridge/config";
import { NumericFormat, type NumberFormatValues } from "react-number-format";
import { useCollateralPrice } from "~/hooks/use-fetch-prices";
import Big from "big.js";

function Bridge() {
  // URL state for source chain selection
  const [sourceChain, setSourceChain] = useQueryState(
    "from",
    parseAsStringEnum<SourceChainId>([
      "bitcoin",
      "ethereum",
      "base",
      "arbitrum",
      "optimism",
      "polygon",
      "bnb",
      "avalanche",
    ]).withDefault("ethereum")
  );

  // URL state for destCollateral selection (using token address) - used for deep linking from borrow page
  const [selectedCollateralAddress] = useQueryState("destCollateral");

  // URL state for source token
  const [sourceToken, setSourceToken] = useQueryState(
    "token",
    parseAsStringEnum<SourceTokenId>(["WBTC", "SOLVBTC", "TBTC", "USDC", "USDT", "BTC"]).withDefault(
      "WBTC"
    )
  );

  // URL state for destination token (what they receive on Starknet)
  const [destTokenAddress, setDestTokenAddress] = useQueryState("dest");

  // URL state for amount
  const [amount, setAmount] = useQueryState("amount", parseAsString.withDefault(""));

  // Get destination destCollateral - prefer destToken URL param, then selectedCollateralAddress from deep link, then default
  // Note: When coming from Bitcoin, the only destination is WBTC
  const isBitcoinSource = sourceChain === "bitcoin";
  const destCollateral = isBitcoinSource
    ? DEFAULT_COLLATERAL // Bitcoin can only bridge to WBTC
    : getCollateralByAddress(destTokenAddress || "") ||
      getCollateralByAddress(selectedCollateralAddress || "") ||
      DEFAULT_COLLATERAL;

  // Get current source chain object
  const currentSourceChain = SOURCE_CHAINS.find((c) => c.id === sourceChain) || SOURCE_CHAINS[0];

  // Get available source tokens for the selected chain
  const availableSourceTokens = getSourceTokensForChain(sourceChain);

  // Map destination collateral to matching source token for deep linking
  const collateralToSourceToken: Record<string, SourceTokenId> = {
    WWBTC: "WBTC",
    TBTC: "TBTC",
    SOLVBTC: "SOLVBTC",
  };

  // Determine the best source token:
  // 1. If user explicitly selected a token in URL, use that (if available on chain)
  // 2. If deep-linked from borrow page, try to match the destination collateral
  // 3. Fall back to first available token
  const matchingSourceToken = selectedCollateralAddress
    ? collateralToSourceToken[destCollateral.id]
    : null;

  const isTokenAvailable = (tokenId: SourceTokenId | null): boolean =>
    tokenId !== null && availableSourceTokens.some((t) => t.id === tokenId);

  const effectiveSourceToken = isTokenAvailable(sourceToken)
    ? sourceToken
    : isTokenAvailable(matchingSourceToken)
      ? matchingSourceToken!
      : availableSourceTokens[0]?.id || "WBTC";

  // Get current source token object
  const currentSourceToken = availableSourceTokens.find((t) => t.id === effectiveSourceToken) || availableSourceTokens[0];

  // Get available bridges based on current selection (source chain + source token + destination collateral)
  const availableBridges = getAvailableBridges(
    sourceChain,
    effectiveSourceToken as SourceTokenId,
    destCollateral.id
  );

  // Get destination collateral price (always needed for destination amount calculation)
  const isStablecoin = effectiveSourceToken === "USDC" || effectiveSourceToken === "USDT";
  const hasAmount = amount !== null && amount !== "" && parseFloat(amount) > 0;
  const destPrice = useCollateralPrice(destCollateral.id, { enabled: hasAmount });

  // Calculate USD value of source amount (stablecoins hardcoded to $1)
  const sourceUsdValue = (() => {
    if (!amount) return new Big(0);
    try {
      const amountBig = new Big(amount);
      // Stablecoins are $1
      if (isStablecoin) {
        return amountBig;
      }
      // For BTC-based source tokens, use destination price as approximation
      // (WBTC, SolvBTC, tBTC are all ~same price as BTC)
      if (!destPrice?.price) return new Big(0);
      return amountBig.times(destPrice.price);
    } catch {
      return new Big(0);
    }
  })();

  // Calculate estimated destination amount = USD value / destination token price
  const estimatedDestAmount = (() => {
    if (!sourceUsdValue || sourceUsdValue.eq(0)) return new Big(0);
    if (!destPrice?.price || destPrice.price.eq(0)) return new Big(0);
    try {
      return sourceUsdValue.div(destPrice.price);
    } catch {
      return new Big(0);
    }
  })();

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="flex justify-between pb-6 lg:pb-8 items-baseline">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
          Bridge to Starknet
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Section: Bridge Interface */}
        <div className="flex-1 lg:flex-[2] order-1">
          <div className="space-y-1">
            {/* FROM Card - Source Chain & Token */}
            <div className="bg-white rounded-2xl p-6 space-y-6">
              {/* Header Row: Chain Selector */}
              <div className="flex items-center gap-3">
                <Label className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
                  From
                </Label>

                {/* Chain Selector */}
                <Select
                  value={sourceChain}
                  onValueChange={(value) => setSourceChain(value as SourceChainId)}
                >
                  <SelectTrigger className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg px-3 py-2 h-auto border-0 min-w-0">
                    <img
                      src={currentSourceChain.icon}
                      alt={currentSourceChain.name}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-sm font-medium font-sora text-neutral-800">
                      {currentSourceChain.name}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="border border-neutral-200 rounded-lg shadow-md">
                    {SOURCE_CHAINS.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        <div className="flex items-center gap-2">
                          <img
                            src={chain.icon}
                            alt={chain.name}
                            className="w-5 h-5 object-contain"
                          />
                          <span className="text-sm font-medium font-sora">
                            {chain.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Main content: Source Token selector + Amount input */}
              <div className="flex items-center gap-6">
                {/* Source Token Selector */}
                <div className="flex flex-col gap-2">
                  <Select
                    value={effectiveSourceToken}
                    onValueChange={(value) => setSourceToken(value as SourceTokenId)}
                  >
                    <SelectTrigger className="p-2.5 bg-token-bg rounded-lg inline-flex justify-start items-center gap-2 h-auto border-0 hover:opacity-80 transition-all">
                      <div className="flex items-center gap-2">
                        <img
                          src={currentSourceToken?.icon || "/wbtc.png"}
                          alt={currentSourceToken?.name || "WBTC"}
                          className="w-5 h-5 object-contain flex-shrink-0"
                        />
                        <span className="text-token-orange text-xs font-medium font-sora">
                          {currentSourceToken?.name || "WBTC"}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="border border-neutral-200 rounded-lg shadow-md">
                      {availableSourceTokens.map((token) => (
                        <SelectItem key={token.id} value={token.id}>
                          <div className="flex items-center gap-2">
                            <img
                              src={token.icon}
                              alt={token.name}
                              className="w-5 h-5 object-contain"
                            />
                            <span className="text-xs font-medium font-sora">
                              {token.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input (matching TokenInput style) */}
                <div className="flex-1">
                  <NumericFormat
                    thousandSeparator=","
                    decimalSeparator="."
                    allowedDecimalSeparators={[",", "."]}
                    placeholder="0"
                    inputMode="decimal"
                    allowNegative={false}
                    decimalScale={8}
                    value={amount}
                    onValueChange={(values: NumberFormatValues) => {
                      setAmount(values.value || null);
                    }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-8 sm:leading-9 md:leading-10 font-normal font-sora h-auto p-0 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none outline-none shadow-none text-neutral-800 w-full"
                  />
                </div>
              </div>

              {/* Bottom row: USD value */}
              <div className="flex justify-between items-end">
                <NumericFormat
                  className="text-neutral-800 text-sm font-medium font-sora leading-none"
                  displayType="text"
                  value={sourceUsdValue.toString()}
                  prefix="= $"
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </div>
            </div>

            {/* Arrow between cards */}
            <div className="relative flex justify-center items-center">
              <div className="absolute z-10">
                <ArrowIcon
                  size={40}
                  className="sm:w-12 sm:h-12 md:w-16 md:h-16"
                  innerCircleColor="#242424"
                  direction="down"
                />
              </div>
            </div>

            {/* TO Card - Starknet Destination */}
            <div className="bg-white rounded-2xl p-6 space-y-6">
              {/* Header Row: Chain display on left */}
              <div className="flex items-center gap-3">
                <Label className="text-neutral-800 text-xs font-medium font-sora uppercase leading-3 tracking-tight">
                  To
                </Label>

                {/* Starknet Chain (static) */}
                <div className="flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2">
                  <img
                    src="/starknet.png"
                    alt="Starknet"
                    className="w-5 h-5 object-contain"
                  />
                  <span className="text-sm font-medium font-sora text-neutral-800">
                    Starknet
                  </span>
                </div>
              </div>

              {/* Main content: Token selector + Amount display */}
              <div className="flex items-center gap-6">
                {/* Destination Token Selector */}
                <div className="flex flex-col gap-2">
                  {isBitcoinSource ? (
                    // Static display when coming from Bitcoin (only WBTC available)
                    <div className="p-2.5 bg-token-bg rounded-lg inline-flex justify-start items-center gap-2">
                      <img
                        src={destCollateral.icon}
                        alt={destCollateral.symbol}
                        className="w-5 h-5 object-contain flex-shrink-0"
                      />
                      <span className="text-token-orange text-xs font-medium font-sora">
                        {destCollateral.symbol}
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={destCollateral.addresses.token}
                      onValueChange={(address) => setDestTokenAddress(address)}
                    >
                      <SelectTrigger className="p-2.5 bg-token-bg rounded-lg inline-flex justify-start items-center gap-2 h-auto border-0 hover:opacity-80 transition-all">
                        <div className="flex items-center gap-2">
                          <img
                            src={destCollateral.icon}
                            alt={destCollateral.symbol}
                            className="w-5 h-5 object-contain flex-shrink-0"
                          />
                          <span className="text-token-orange text-xs font-medium font-sora">
                            {destCollateral.symbol}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="border border-neutral-200 rounded-lg shadow-md">
                        {COLLATERAL_LIST.map((token) => (
                          <SelectItem key={token.id} value={token.addresses.token}>
                            <div className="flex items-center gap-2">
                              <img
                                src={token.icon}
                                alt={token.symbol}
                                className="w-5 h-5 object-contain"
                              />
                              <span className="text-xs font-medium font-sora">
                                {token.symbol}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Amount Display (estimated based on USD value / dest price) */}
                <div className="flex-1">
                  <NumericFormat
                    thousandSeparator=","
                    decimalSeparator="."
                    displayType="text"
                    value={estimatedDestAmount.gt(0) ? estimatedDestAmount.round(6).toString() : "0"}
                    decimalScale={6}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-8 sm:leading-9 md:leading-10 font-normal font-sora text-neutral-800"
                  />
                </div>
              </div>

              {/* Bottom row: USD value */}
              <div className="flex justify-between items-end">
                <NumericFormat
                  className="text-neutral-800 text-sm font-medium font-sora leading-none"
                  displayType="text"
                  value={sourceUsdValue.toString()}
                  prefix="= $"
                  thousandSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                />
              </div>
            </div>

            {/* Bridge Options */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 mt-4">
              <Label className="text-neutral-500 text-xs font-medium font-sora uppercase leading-3 tracking-tight block mb-4">
                Select Bridge Provider
              </Label>

              {availableBridges.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 font-sora">
                  <p>No bridges available for this combination.</p>
                  <p className="text-sm mt-2">
                    Try selecting a different source chain or token.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableBridges.map((bridge) => (
                    <BridgeCard
                      key={bridge.id}
                      bridge={bridge}
                      sourceChain={sourceChain}
                      sourceToken={effectiveSourceToken as SourceTokenId}
                      amount={amount}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Info */}
        <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md lg:min-w-[320px] space-y-4 order-2">
          <InfoBox title="Bridging to Starknet" variant="blue">
            <p className="text-sm">
              Bridge your Bitcoin assets from other chains to Starknet to start
              borrowing USDU against your collateral.
            </p>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>
                <strong>Stargate</strong> - Fast LayerZero bridge for WBTC and
                SolvBTC
              </li>
              <li>
                <strong>StarkGate</strong> - Official canonical bridge from
                Ethereum
              </li>
              <li>
                <strong>Rhino.fi</strong> - Bridge + swap any token to WBTC
              </li>
              <li>
                <strong>Atomiq</strong> - Bridge from native Bitcoin
              </li>
            </ul>
          </InfoBox>

          <InfoBox title="Gas Fees" variant="neutral">
            <p className="text-sm">
              Make sure you have enough native tokens on the source chain to pay
              for gas fees. Bridging typically costs between $1-10 depending on
              network conditions.
            </p>
          </InfoBox>
        </div>
      </div>
    </div>
  );
}

interface BridgeCardProps {
  bridge: BridgeProvider;
  sourceChain: SourceChainId | null;
  sourceToken: SourceTokenId;
  amount: string;
}

function BridgeCard({
  bridge,
  sourceChain,
  sourceToken,
  amount,
}: BridgeCardProps) {
  // Map source token to destination collateral for URL generation
  const sourceToCollateral: Record<string, "WWBTC" | "SOLVBTC" | "TBTC"> = {
    SOLVBTC: "SOLVBTC",
    TBTC: "TBTC",
  };
  const collateralId = sourceToCollateral[sourceToken] || "WWBTC";

  // Rhino accepts USDC/USDT as source tokens
  const rhinoToken = (sourceToken === "USDC" || sourceToken === "USDT")
    ? sourceToken as RhinoSourceToken
    : undefined;

  const bridgeUrl = bridge.getUrl({
    sourceChain: sourceChain || "ethereum",
    collateral: collateralId,
    sourceToken: rhinoToken,
    amount: amount || undefined,
  });

  // Show first 2 chain badges, with count for remaining
  const displayedChains = bridge.supportedChains.slice(0, 2);
  const remainingChainCount = bridge.supportedChains.length - 2;

  return (
    <div className="bg-neutral-50 rounded-xl p-4 sm:p-5 hover:bg-neutral-100/80 transition-colors">
      <div className="flex items-center gap-4">
        {/* Bridge Logo */}
        <img
          src={bridge.icon}
          alt={bridge.name}
          className="w-10 h-10 rounded-lg object-contain bg-white p-1.5 flex-shrink-0"
        />

        {/* Bridge Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium font-sora text-[#242424]">
              {bridge.name}
            </h3>
            {/* Chain badges */}
            <div className="hidden sm:flex items-center gap-1">
              {displayedChains.map((chainId) => {
                const chain = SOURCE_CHAINS.find((c) => c.id === chainId);
                return chain ? (
                  <img
                    key={chainId}
                    src={chain.icon}
                    alt={chain.name}
                    className="w-4 h-4 rounded-full"
                    title={chain.name}
                  />
                ) : null;
              })}
              {remainingChainCount > 0 && (
                <span className="text-[10px] text-neutral-400 font-sora">
                  +{remainingChainCount}
                </span>
              )}
            </div>
          </div>
          <p className="text-xs font-normal font-sora text-neutral-500 mt-0.5 truncate">
            {bridge.description}
          </p>
        </div>

        {/* Bridge Button */}
        <a
          href={bridgeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-token-bg-blue hover:bg-blue-600 text-white text-xs font-medium font-sora py-2.5 px-4 rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0"
        >
          Bridge
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

    </div>
  );
}

export default Bridge;

export function meta(args: Route.MetaArgs) {
  return createMeta(args, {
    title: "Uncap - Bridge BTC to Starknet",
    description:
      "Bridge your Bitcoin assets (WBTC, tBTC, SolvBTC) to Starknet to start borrowing USDU",
  });
}
