// Dynamically select deployment addresses based on environment
import sepoliaAddresses from "./sepolia_addresses.json";
import mainnetAddresses from "./mainnet_addresses.json";

const isMainnet = import.meta.env.VITE_CHAIN_ID === "SN_MAIN";

// Export the correct addresses based on environment
const deploymentData = isMainnet ? mainnetAddresses : sepoliaAddresses;

export default deploymentData;
