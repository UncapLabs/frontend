// Dynamically select deployment addresses based on environment
import sepoliaAddresses from "./sepolia_addresses.json";
import mainnetAddresses from "./mainnet_addresses.json";

console.log("VITE_CHAIN_ID:", import.meta.env.VITE_CHAIN_ID);
console.log("MODE:", import.meta.env.MODE);

const isMainnet = import.meta.env.VITE_CHAIN_ID === "SN_MAIN";

// Export the correct addresses based on environment
const deploymentData = isMainnet ? mainnetAddresses : sepoliaAddresses;

export default deploymentData;
