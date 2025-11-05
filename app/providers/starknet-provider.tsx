import React, { useEffect, useRef } from "react";

import { sepolia, mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  voyager,
  useAccount,
  useWalletRequest,
} from "@starknet-react/core";
import { connectors } from "../lib/wallet/connectors";
import { TransactionStoreProvider } from "./transaction-provider";
import { constants } from "starknet";
import { toHexChainid } from "../lib/utils/chain-id";

// Component that monitors connection and prompts network switch if needed
function NetworkChecker() {
  const { address, chainId } = useAccount();
  const hasChecked = useRef(false);

  // Get the required chain ID from environment variable
  const envChainId = import.meta.env.VITE_CHAIN_ID;
  const requiredChainId =
    envChainId === "SN_MAIN"
      ? constants.StarknetChainId.SN_MAIN
      : constants.StarknetChainId.SN_SEPOLIA;

  const switchNetwork = useWalletRequest({
    type: "wallet_switchStarknetChain",
    params: {
      chainId: requiredChainId,
    },
  });

  useEffect(() => {
    // Only check once per session when wallet is connected
    if (address && chainId && !hasChecked.current) {
      hasChecked.current = true;

      const currentChainIdHex = toHexChainid(chainId);

      console.log("Network check:", {
        currentChainIdHex,
        requiredChainId,
        envChainId: import.meta.env.VITE_CHAIN_ID,
        match: currentChainIdHex === requiredChainId,
      });

      if (currentChainIdHex !== requiredChainId) {
        console.log("Triggering network switch...");
        // Trigger wallet prompt to switch network
        switchNetwork.requestAsync().catch((error) => {
          console.log("Network switch declined or failed:", error);
        });
      }
    }

    // Reset the check flag when user disconnects
    if (!address) {
      hasChecked.current = false;
    }
  }, [address, chainId, requiredChainId, switchNetwork]);

  return null;
}

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = [mainnet, sepolia];
  const providers = publicProvider();

  return (
    <StarknetConfig
      chains={chains}
      provider={providers}
      connectors={connectors}
      explorer={voyager}
      autoConnect={true}
    >
      <NetworkChecker />
      <TransactionStoreProvider>{children}</TransactionStoreProvider>
    </StarknetConfig>
  );
}
