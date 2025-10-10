import { Contract, RpcProvider } from "starknet";
import { TOKENS } from "~/lib/collateral";
import { USDU_ABI } from "~/lib/contracts";
import { bigintToBig } from "~/lib/decimal";

/**
 * Get total USDU circulating supply by calling totalSupply() on the USDU ERC-20 contract
 * Returns a string with decimals included (e.g., "120701989.810851047571342265")
 * This format matches CoinGecko's requirements for supply API
 */
export async function getTotalCirculatingSupply(
  nodeUrl: string
): Promise<string> {
  const provider = new RpcProvider({ nodeUrl });

  try {
    const usduContract = new Contract({
      abi: USDU_ABI,
      address: TOKENS.USDU.address,
      providerOrAccount: provider,
    });

    const totalSupply = (await usduContract.call("total_supply", [])) as bigint;

    // Convert from bigint (18 decimals) to decimal string
    const totalSupplyBig = bigintToBig(totalSupply, 18);

    return totalSupplyBig.toString();
  } catch (error) {
    console.error("Error fetching USDU total supply:", error);
    throw error; // Re-throw so the API can return proper error response
  }
}
