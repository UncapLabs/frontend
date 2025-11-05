import type Big from "big.js";
import { bigintToBig } from "~/lib/decimal";

export interface ClaimCalldata {
  amount: Big;
  proof: string[];
  round?: number;
  [key: string]: unknown;
}

export interface RootResult {
  round: number;
  root: string;
  [key: string]: unknown;
}

export interface RoundBreakdownEntry {
  round: number;
  amount: string;
  cumulative: string;
  [key: string]: unknown;
}

export interface RoundBreakdownResponse {
  rounds: RoundBreakdownEntry[];
  [key: string]: unknown;
}

type ClaimParams = {
  address: string;
  round?: number;
};

function getBaseUrl(env: Env): string {
  const base = env.CLAIM_BACKEND_URL || process.env.CLAIM_BACKEND_URL || "";

  if (!base) {
    throw new Error("CLAIM_BACKEND_URL is not configured");
  }

  return base.endsWith("/") ? base : `${base}/`;
}

async function requestClaimApi<T>(
  env: Env,
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  const url = new URL(path, getBaseUrl(env));

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    cf: { cacheTtl: 15 },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Claim API request failed (${response.status}): ${message}`
    );
  }

  return (await response.json()) as T;
}

export async function getClaimCalldata(
  env: Env,
  params: ClaimParams
): Promise<ClaimCalldata> {
  // Backend returns amount as string, we need to convert to Big
  const result = await requestClaimApi<{ amount: string; proof: string[] }>(
    env,
    "get_calldata",
    params
  );

  return {
    ...result,
    amount: bigintToBig(BigInt(result.amount), 18), // STRK has 18 decimals
  };
}

export function getAllocationAmount(
  env: Env,
  params: ClaimParams
): Promise<string> {
  return requestClaimApi<string>(env, "get_allocation_amount", params);
}

export function getRoundBreakdown(
  env: Env,
  params: ClaimParams
): Promise<RoundBreakdownResponse> {
  return requestClaimApi<RoundBreakdownResponse>(
    env,
    "get_round_breakdown",
    params
  );
}
