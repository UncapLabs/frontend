import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { HelpCircle, ExternalLink } from "lucide-react";
import { useMediaQuery } from "~/hooks/use-media-query";
import { useState } from "react";

type Tab = "bridge" | "borrowing";

interface InfoDialogProps {
  defaultTab?: Tab;
  children?: React.ReactNode;
}

export function InfoDialog({ defaultTab = "bridge", children }: InfoDialogProps = {}) {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const defaultTrigger = (
    <button
      className="transition-all hover:scale-110 hover:opacity-80"
      aria-label="Help and information"
      title="Get help"
    >
      <HelpCircle className="h-6 w-6 text-[#006CFF]" />
    </button>
  );

  const trigger = children || defaultTrigger;

  const tabButtons = (
    <div className="flex gap-2 border-b border-neutral-200 mt-4">
      <button
        onClick={() => setActiveTab("bridge")}
        className={`px-4 py-2 text-sm font-medium font-sora transition-colors relative ${
          activeTab === "bridge"
            ? "text-[#006CFF]"
            : "text-neutral-600 hover:text-neutral-800"
        }`}
      >
        How to Bridge BTC
        {activeTab === "bridge" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#006CFF]" />
        )}
      </button>
      <button
        onClick={() => setActiveTab("borrowing")}
        className={`px-4 py-2 text-sm font-medium font-sora transition-colors relative ${
          activeTab === "borrowing"
            ? "text-[#006CFF]"
            : "text-neutral-600 hover:text-neutral-800"
        }`}
      >
        How Borrowing Works
        {activeTab === "borrowing" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#006CFF]" />
        )}
      </button>
    </div>
  );

  const bridgeContent = (
    <div className="space-y-6">
      {/* Option 1: From Bitcoin Network */}
      <div className="bg-neutral-50 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium font-sora text-[#242424]">
            From Bitcoin Network
          </h3>
          {/* Visual flow: Bitcoin → Starknet */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z" />
              </svg>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 16H24M24 16L18 10M24 16L18 22"
                stroke="#94938D"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <img
              src="/starknet.png"
              alt="Starknet"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-normal font-sora text-neutral-700 mb-4">
            Use Atomiq Exchange - a fully trustless cross-chain DEX for swapping
            between Bitcoin and Starknet
          </p>

          <div className="flex items-start gap-4">
            <img
              src="/xverse_wallet.png"
              alt="Xverse Wallet"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-[#006CFF] text-white text-xs font-bold font-sora flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <p className="text-sm font-medium font-sora text-neutral-800">
                    Get Xverse Wallet
                  </p>
                </div>
                <p className="text-xs font-normal font-sora text-neutral-600 ml-8">
                  Supports both Bitcoin and Starknet in one wallet
                </p>
                <a
                  href="https://xverse.app/?utm_source=uncap.finance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#006CFF] hover:text-[#0056CC] font-medium font-sora mt-1 ml-8"
                >
                  Download Xverse
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-[#006CFF] text-white text-xs font-bold font-sora flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm font-medium font-sora text-neutral-800">
                    Bridge wBTC to Starknet
                  </p>
                </div>
                <p className="text-xs font-normal font-sora text-neutral-600 ml-8">
                  Visit Atomiq Exchange and swap BTC → wBTC on Starknet
                </p>
                <a
                  href="https://app.atomiq.exchange/?utm_source=uncap.finance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#006CFF] hover:text-[#0056CC] font-medium font-sora mt-1 ml-8"
                >
                  Open Atomiq Exchange
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Option 2: From EVM Networks */}
      <div className="bg-neutral-50 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium font-sora text-[#242424]">
            From EVM Networks (Ethereum, L2s)
          </h3>
          {/* Visual flow: Ethereum → Starknet */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#627EEA] flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
              </svg>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 16H24M24 16L18 10M24 16L18 22"
                stroke="#94938D"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <img
              src="/starknet.png"
              alt="Starknet"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-normal font-sora text-neutral-700 mb-4">
            Bridge wBTC from Ethereum or other EVM chains using official
            Starknet bridges
          </p>

          <div className="flex items-start gap-4">
            <img
              src="/ready_wallet.png"
              alt="Ready Wallet"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-[#006CFF] text-white text-xs font-bold font-sora flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <p className="text-sm font-medium font-sora text-neutral-800">
                    Get Ready Wallet
                  </p>
                </div>
                <p className="text-xs font-normal font-sora text-neutral-600 ml-8">
                  You'll need an EVM wallet (MetaMask, Rabby) to send + Ready
                  Wallet to receive on Starknet
                </p>
                <a
                  href="https://www.ready.co/ready-wallet?utm_source=uncap.finance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#006CFF] hover:text-[#0056CC] font-medium font-sora mt-1 ml-8"
                >
                  Get Ready Wallet
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-[#006CFF] text-white text-xs font-bold font-sora flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm font-medium font-sora text-neutral-800">
                    Bridge to Starknet
                  </p>
                </div>
                <p className="text-xs font-normal font-sora text-neutral-600 ml-8">
                  Bridge wBTC directly, or bridge any token (like ETH) and swap
                  to wBTC on AVNU
                </p>
                <div className="flex flex-wrap gap-2 mt-1 ml-8">
                  <a
                    href="https://starkgate.starknet.io/ethereum/bridge?mode=deposit&utm_source=uncap.finance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#006CFF] hover:text-[#0056CC] font-medium font-sora"
                  >
                    Open StarkGate
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-xs text-neutral-400">•</span>
                  <a
                    href="https://app.avnu.fi/en/eth-wbtc?utm_source=uncap.finance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#006CFF] hover:text-[#0056CC] font-medium font-sora"
                  >
                    Swap on AVNU
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const borrowingContent = (
    <div className="space-y-6">
      {/* Step 1: Provide Collateral */}
      <div className="relative bg-neutral-50 rounded-xl p-6 space-y-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/coin_03.png"
            alt=""
            className="absolute bottom-[-10%] right-[-5%] w-32 h-32 sm:w-40 sm:h-40 object-contain opacity-40"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#006CFF] text-white text-sm font-bold font-sora flex items-center justify-center flex-shrink-0">
                1
              </div>
              <h3 className="text-lg font-medium font-sora text-[#242424]">
                Provide Collateral
              </h3>
            </div>
          </div>

          <div className="max-w-md">
            <p className="text-sm font-normal font-sora text-neutral-700 text-justify">
              Deposit wBTC as collateral to open a borrowing position. Your
              Bitcoin remains under your control. You can adjust your loan,
              including your interest rate, or repay your debt at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: Borrow USDU */}
      <div className="relative bg-neutral-50 rounded-xl p-6 space-y-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/wallet.png"
            alt=""
            className="absolute bottom-[-10%] left-[-5%] w-32 h-32 sm:w-40 sm:h-40 object-contain opacity-30"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-end mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#006CFF] text-white text-sm font-bold font-sora flex items-center justify-center flex-shrink-0">
                2
              </div>
              <h3 className="text-lg font-medium font-sora text-[#242424]">
                Borrow USDU
              </h3>
            </div>
          </div>

          <div className="max-w-md ml-auto">
            <p className="text-sm font-normal font-sora text-neutral-700 text-justify">
              Mint USDU, a BTC-backed stablecoin pegged 1:1 to the US dollar.
              USDU can be{" "}
              <a
                href="https://app.ekubo.org/charts/USDU/USDC?utm_source=uncap.finance"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#006CFF] hover:text-[#0056CC] font-medium underline"
              >
                swapped to USDC on Ekubo
              </a>{" "}
              at any time. When borrowing, pay attention to your loan-to-value
              (LTV) ratio and liquidation price to keep your position healthy.
            </p>
          </div>
        </div>
      </div>

      {/* Step 3: Set Interest Rate */}
      <div className="relative bg-neutral-50 rounded-xl p-6 space-y-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/chart.png"
            alt=""
            className="absolute bottom-[-10%] right-[-5%] w-40 h-40 sm:w-48 sm:h-48 object-contain opacity-25"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#006CFF] text-white text-sm font-bold font-sora flex items-center justify-center flex-shrink-0">
                3
              </div>
              <h3 className="text-lg font-medium font-sora text-[#242424]">
                Set Your Interest Rate
              </h3>
            </div>
          </div>

          <div className="max-w-md">
            <p className="text-sm font-normal font-sora text-neutral-700 text-justify">
              Choose your own interest rate when borrowing. Lower rates save you
              money but increase your redemption risk - when USDU trades below $1,
              someone can swap USDU for your collateral at face value, repaying
              part of your debt. Higher rates provide better protection. You can
              adjust your rate anytime to balance cost and safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-3xl">
          {tabButtons}
          <DialogHeader>
            <DialogTitle>
              {activeTab === "bridge"
                ? "Bridge Bitcoin to Starknet"
                : "How Borrowing Works"}
            </DialogTitle>
            <DialogDescription>
              {activeTab === "bridge"
                ? "Choose the best bridging method based on where your Bitcoin is located"
                : "Learn how to borrow USDU against your bitcoin collateral"}
            </DialogDescription>
          </DialogHeader>
          {activeTab === "bridge" ? bridgeContent : borrowingContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="overflow-y-auto flex-1">
          {tabButtons}
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-medium font-sora text-[#242424]">
              {activeTab === "bridge"
                ? "Bridge Bitcoin to Starknet"
                : "How Borrowing Works"}
            </DrawerTitle>
            <DrawerDescription className="text-neutral-800 text-sm font-normal font-sora">
              {activeTab === "bridge"
                ? "Choose the best bridging method based on where your Bitcoin is located"
                : "Learn how to borrow USDU against your collateral"}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8">
            {activeTab === "bridge" ? bridgeContent : borrowingContent}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
