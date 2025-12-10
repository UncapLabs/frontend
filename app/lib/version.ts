// Frontend commit hash - injected at build time by Vite
export const FRONTEND_COMMIT_HASH = __COMMIT_HASH__;

// Smart contracts commit hash - update this when deploying new contracts
// TODO: Update when contracts repo becomes public
export const CONTRACTS_COMMIT_HASH: string | null = null;

// GitHub repository URLs
export const FRONTEND_REPO_URL = "https://github.com/UncapLabs/frontend";
export const CONTRACTS_REPO_URL: string | null = null; // TODO: Add when public
