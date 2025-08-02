import { hash, cairo } from "starknet";
import { toHexAddress } from "./address";

type Address = `0x${string}`;

/**
 * Computes the troveId using the same logic as the smart contract
 * Uses Poseidon hash of (msg_sender, owner, owner_index_low, owner_index_high)
 *
 * @param owner The owner address (who will call the contract and also own the trove)
 * @param ownerIndex The owner index (bigint or number)
 * @returns The computed troveId as a string
 */
export function getTroveId(
  owner: Address,
  ownerIndex: bigint | number
): string {
  // In the smart contract, msg_sender is the account calling the function
  // When the user calls openTrove, msg_sender is the user's address
  const msgSender = owner;

  // Convert ownerIndex to u256 format (low, high)
  const ownerIndexU256 = cairo.uint256(BigInt(ownerIndex));

  // Match the contract exactly:
  // hash_state.update_with(msg_sender).update_with(owner).update_with(owner_index)
  // where owner_index is a u256 (passed as low, high)
  const troveId = hash.computePoseidonHashOnElements([
    msgSender,
    owner,
    ownerIndexU256.low,
    ownerIndexU256.high,
  ]);

  // Use toHexAddress for proper formatting with leading zeros
  const paddedTroveId = toHexAddress(troveId);

  console.log("[getTroveId] Computed troveId:", {
    msgSender,
    owner,
    ownerIndexLow: ownerIndexU256.low,
    ownerIndexHigh: ownerIndexU256.high,
    result: troveId,
    padded: paddedTroveId,
  });

  return paddedTroveId;
}

/**
 * Creates a prefixed troveId with branchId
 * @param branchId The branch ID (0 for UBTC, 1 for GBTC)
 * @param troveId The computed trove ID
 * @returns The prefixed trove ID in format "branchId:troveId"
 */
export function getPrefixedTroveId(branchId: number, troveId: string): string {
  return `${branchId}:${troveId}`;
}
