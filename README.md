# Uncap Finance

> **Note:** Uncap is winding down. The protocol continues to function normally on-chain. This frontend will remain live until August 2026 to give users ample time to withdraw their funds.

Uncap is a decentralized protocol on Starknet (heavily inspired by Liquity v2) with two core functions:

1. **Borrow against your Bitcoin** — Get liquidity without selling
2. **Mint USDU** — A Bitcoin-backed, uncensorable stablecoin

## Borrow Against Your Bitcoin

- **Set your own interest rate** — From as low as 0.5%, the cheapest in DeFi
- **Non-custodial** — Your Bitcoin is never lent out or rehypothecated
- **Tax-efficient** — Access liquidity without triggering a taxable sale
- **Full ownership** — Get your Bitcoin back when you repay

## USDU: Stable Dollars You Truly Own

USDU is a decentralized stablecoin backed by over-collateralized Bitcoin:

- **Always redeemable** — 1 USDU = $1 worth of Bitcoin, no questions asked
- **Uncensorable** — No blacklists, no admin keys, can never be frozen
- **Earn yield** — Deposit in the Stability Pool to earn real yield from borrower interest
- **Hard-pegged** — Backed by >$1 of Bitcoin per USDU

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- A Starknet wallet (Argent X or Braavos)
- An [Alchemy](https://www.alchemy.com/) account (or another Starknet RPC provider)

## Running Locally

1. Clone the repository:

```bash
git clone https://github.com/UncapLabs/frontend.git
cd frontend
```

2. Install dependencies:

```bash
pnpm install
```

3. Create environment files from the examples:

```bash
cp .env.example .env.development
cp .dev.vars.example .dev.vars
```

Then edit both files and fill in your API keys.

`.env.development` — client-side variables (exposed to the browser):

| Variable | Description |
|---|---|
| `VITE_CHAIN_ID` | `SN_MAIN` for mainnet, `SN_SEPOLIA` for testnet |
| `VITE_ALCHEMY_API` | Your Alchemy API key |

`.dev.vars` — server-side variables (Cloudflare Workers, never exposed to client):

| Variable | Description |
|---|---|
| `NODE_URL` | Starknet RPC endpoint (Alchemy, Infura, etc.) |
| `GRAPHQL_ENDPOINT` | Indexer endpoint for querying on-chain data |
| `CLAIM_BACKEND_URL` | Backend for STRK claim proofs |
| `NETWORK` | `mainnet` or `sepolia` |

4. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

```bash
pnpm build
```

## Deployment

The application is deployed to Cloudflare Workers:

```bash
pnpm deploy
```

## Tech Stack

- React 19
- TypeScript
- TailwindCSS
- tRPC
- Starknet.js
- Cloudflare Workers
- Vite

## Security

The protocol smart contracts have been audited by [ChainSecurity](https://www.chainsecurity.com/security-audit/uncap-finance).
