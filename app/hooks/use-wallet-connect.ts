import { useCallback } from "react";
import { useConnect, type Connector } from "@starknet-react/core";
import {
  type StarknetkitConnector,
  useStarknetkitConnectModal,
} from "starknetkit";

export function useWalletConnect() {
  const { connect, connectors } = useConnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  });

  const connectWallet = useCallback(async () => {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    connect({ connector: connector as Connector });
  }, [starknetkitConnectModal, connect]);

  return { connectWallet };
}