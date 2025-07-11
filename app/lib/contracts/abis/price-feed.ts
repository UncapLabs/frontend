import type { Abi } from "starknet";

export const PRICE_FEED_ABI = [
  {
    type: "impl",
    name: "IPriceFeedMockImpl",
    interface_name: "bit_usd::mocks::PriceFeedMock::IPriceFeedMock",
  },
  {
    type: "struct",
    name: "core::integer::u256",
    members: [
      { name: "low", type: "core::integer::u128" },
      { name: "high", type: "core::integer::u128" },
    ],
  },
  {
    type: "interface",
    name: "bit_usd::mocks::PriceFeedMock::IPriceFeedMock",
    items: [
      {
        type: "function",
        name: "fetch_price",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "fetch_redemption_price",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::mocks::PriceFeedMock::PriceFeedMock::Event",
    kind: "enum",
    variants: [],
  },
] as const satisfies Abi;
