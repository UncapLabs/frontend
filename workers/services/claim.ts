export interface ClaimCalldata {
  amount: string;
  proof: string[];
  round?: number;
  [key: string]: unknown;
}

export interface RootResult {
  round: number;
  root: string;
  [key: string]: unknown;
}

type ClaimParams = {
  address: string;
  round?: number;
};

type RootParams = {
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
    throw new Error(`Claim API request failed (${response.status}): ${message}`);
  }

  return (await response.json()) as T;
}

export function getClaimCalldata(
  env: Env,
  params: ClaimParams
): Promise<ClaimCalldata> {
  return requestClaimApi<ClaimCalldata>(env, "get_calldata", params);
}

export function getAllocationAmount(
  env: Env,
  params: ClaimParams
): Promise<string> {
  return requestClaimApi<string>(env, "get_allocation_amount", params);
}

export function getRoot(env: Env, params: RootParams): Promise<RootResult> {
  return requestClaimApi<RootResult>(env, "get_root", params);
}
