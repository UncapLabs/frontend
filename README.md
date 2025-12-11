# Uncap Finance

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

3. Create environment files:

`.env.development` (client-side variables):

```env
VITE_CHAIN_ID=SN_SEPOLIA
VITE_ALCHEMY_API=your_alchemy_api_key
```

`.dev.vars` (server-side variables for Cloudflare Workers):

```env
NODE_URL=https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/your_alchemy_api_key
GRAPHQL_ENDPOINT=your_graphql_endpoint
NETWORK=sepolia
```

4. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
pnpm build
```

## Deployment

The application is configured to deploy to Cloudflare Workers:

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

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- A Starknet wallet (Argent X or Braavos)

## Security

The protocol smart contracts have been audited by [ChainSecurity](https://www.chainsecurity.com/security-audit/uncap-finance).
