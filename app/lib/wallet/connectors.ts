import { InjectedConnector } from "starknetkit/injected";
import {
  BraavosMobileConnector,
  isInBraavosMobileAppBrowser,
} from "starknetkit/braavosMobile";
import { constants } from "starknet";

const CHAIN_ID =
  import.meta.env.VITE_CHAIN_ID === constants.NetworkName.SN_MAIN
    ? constants.NetworkName.SN_MAIN
    : constants.NetworkName.SN_SEPOLIA;

const isMobileDevice = () => {
  if (typeof window === "undefined") {
    return false;
  }
  // Primary method: User Agent + Touch support check
  const userAgent = navigator?.userAgent?.toLowerCase();
  const isMobileUA =
    /android|webos|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent);
  const hasTouchSupport =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Backup method: Screen size
  const isSmallScreen = window.innerWidth <= 768;

  // Combine checks: Must match user agent AND (touch support OR small screen)
  return isMobileUA && (hasTouchSupport || isSmallScreen);
};

export const availableConnectors = (): any[] => {
  if (isInBraavosMobileAppBrowser()) {
    return [BraavosMobileConnector.init({})];
  }

  if (isMobileDevice()) {
    // On mobile (not in Braavos app), show specific mobile connectors
    return [
      new InjectedConnector({
        options: { id: "argentX", name: "Ready Wallet (formerly Argent)" },
      }),
      new InjectedConnector({ options: { id: "xverse" } }),
      BraavosMobileConnector.init({}),
    ].filter(Boolean);
  } else {
    // On desktop, show the broader list of connectors
    return [
      new InjectedConnector({ options: { id: "argentX" } }),
      new InjectedConnector({ options: { id: "xverse" } }),
      new InjectedConnector({ options: { id: "braavos" } }),
      new InjectedConnector({ options: { id: "keplr" } }),
      new InjectedConnector({ options: { id: "okxwallet" } }),
      new InjectedConnector({ options: { id: "metamask" } }),
      new InjectedConnector({ options: { id: "fordefi", name: "Fordefi" } }),
    ].filter(Boolean);
  }
};

export const connectors = availableConnectors();
