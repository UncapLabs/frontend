import {
  useAccount,
  useDisconnect,
  useStarkProfile,
} from "@starknet-react/core";
import { AvatarIcon } from "./icons/avatar-icon";
import { toHexChainid, isMainnet } from "../lib/utils/chain-id";
import { formatTruncatedAddress } from "../lib/utils/format-address";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { useMediaQuery } from "~/hooks/use-media-query";
import { useWalletConnect } from "~/hooks/use-wallet-connect";

// Internal component for displaying wallet info
function WalletInfoDisplay({
  activeConnectorName,
  starkProfile,
  address,
  getExplorerUrl,
  handleCopyToClipboard,
  copied,
  handleDisconnect,
}: {
  activeConnectorName?: string;
  starkProfile: any; // Consider defining a more specific type for starkProfile
  address?: string;
  getExplorerUrl: () => string;
  handleCopyToClipboard: () => void;
  copied: boolean;
  handleDisconnect: () => void;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Connected with {activeConnectorName || "Unknown Connector"}
        </p>
        <button
          onClick={handleDisconnect}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Disconnect <span aria-hidden="true">&rarr;</span>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        {starkProfile?.profilePicture ? (
          <img
            src={starkProfile.profilePicture}
            alt={starkProfile.name || "Profile picture"}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10">
            <AvatarIcon />
          </div>
        )}
        <p className="text-lg font-medium truncate" title={address}>
          {address ? formatTruncatedAddress(address) : ""}
        </p>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <a
          href={getExplorerUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
        >
          View on explorer
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            ></path>
          </svg>
        </a>
        <button
          onClick={handleCopyToClipboard}
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
        >
          {copied ? "Copied!" : "Copy to clipboard"}
          {!copied && (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              ></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function WalletConnector() {
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { connectWallet: connectWalletHook } = useWalletConnect();

  async function connectWallet() {
    setIsOpen(false);
    await connectWalletHook();
  }

  const { address, chainId, connector: activeConnector } = useAccount();
  const { data: starkProfile } = useStarkProfile({ address });

  const getExplorerUrl = () => {
    if (!address || chainId === undefined) return "#";
    const hexChainId = toHexChainid(chainId);
    const explorerBaseUrl = isMainnet(hexChainId)
      ? "https://voyager.online"
      : "https://sepolia.voyager.online";
    return `${explorerBaseUrl}/contract/${address}`;
  };

  const handleCopyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
  };

  if (!address) {
    return (
      <button
        onClick={connectWallet}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-medium h-10 px-4 transition-all text-[#242424] dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Connect Wallet
      </button>
    );
  }

  const walletInfoProps = {
    activeConnectorName: activeConnector?.name,
    starkProfile,
    address,
    getExplorerUrl,
    handleCopyToClipboard,
    copied,
    handleDisconnect,
  };

  const TriggerButton = (
    <button
      className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-xl text-xs font-medium h-10 px-2 transition-all text-[#242424] dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
      title={`Connected as ${
        starkProfile?.name || formatTruncatedAddress(address || "")
      }. Click for details.`}
    >
      <div className="flex items-center justify-center w-[30px] h-[30px] bg-[#FC8702] rounded-lg shrink-0">
        {starkProfile?.profilePicture ? (
          <img
            src={starkProfile.profilePicture}
            alt={starkProfile.name || "Profile picture"}
            className="w-[30px] h-[30px] rounded-lg object-cover"
          />
        ) : (
          <div className="w-[30px] h-[30px] rounded-lg bg-[#FC8702] flex items-center justify-center">
            <div className="w-[15px] h-[15px] rounded-full bg-white" />
          </div>
        )}
      </div>
      <span className="truncate pr-1">
        {starkProfile?.name || formatTruncatedAddress(address || "")}
      </span>
      {/* Dropdown arrow */}
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
        <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{TriggerButton}</DialogTrigger>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Wallet</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <WalletInfoDisplay {...walletInfoProps} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left p-6 pb-4">
          <DrawerTitle>Wallet</DrawerTitle>
        </DrawerHeader>
        <div className="px-6">
          <WalletInfoDisplay {...walletInfoProps} />
        </div>
        <DrawerFooter className="pt-4 px-6 pb-6">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
