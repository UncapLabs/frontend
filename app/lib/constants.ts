import type { Abi } from "starknet";

export const INTEREST_RATE_SCALE_DOWN_FACTOR = 10n ** 16n;

export const TBTC_ADDRESS =
  "0x48308747f280d4d48910f920cd4959bd405cf504b4ee09cae7e9fc8ed1f1d67";

export const BITUSD_ADDRESS =
  "0x6feeca6bdb67f098e4c728b3c942d4b714b13a3a6ff3e7ebc902c25a408d13b";

export const PRICE_FEED_BTC =
  "0x4db7a80e186f604fa30e173448d41047e2753be00918c932e689565930a18b6";

export const TBTC_DECIMALS = 18;

export const TBTC_SYMBOL = "TBTC";

export const TBTC_NAME = "Testnet Bitcoin";

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
];

export const TBTC_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      {
        name: "spender",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "amount",
        type: "core::integer::u256",
      },
    ],
    outputs: [{ type: "core::bool" }],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "mint",
    state_mutability: "external",
    inputs: [
      {
        name: "recipient",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "amount",
        type: "core::integer::u256",
      },
    ],
    outputs: [],
  },
] as const satisfies Abi;

export const TROVE_MANAGER_ABI = [
  {
    type: "impl",
    name: "ITroveManagerImpl",
    interface_name: "bit_usd::TroveManager::ITroveManager",
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
    type: "enum",
    name: "core::bool",
    variants: [
      { name: "False", type: "()" },
      { name: "True", type: "()" },
    ],
  },
  {
    type: "struct",
    name: "bit_usd::TroveManager::LatestTroveData",
    members: [
      { name: "entire_debt", type: "core::integer::u256" },
      { name: "entire_coll", type: "core::integer::u256" },
      { name: "redist_bit_usd_debt_gain", type: "core::integer::u256" },
      { name: "redist_coll_gain", type: "core::integer::u256" },
      { name: "accrued_interest", type: "core::integer::u256" },
      { name: "recorded_debt", type: "core::integer::u256" },
      { name: "annual_interest_rate", type: "core::integer::u256" },
      { name: "weighted_recorded_debt", type: "core::integer::u256" },
      { name: "accrued_batch_management_fee", type: "core::integer::u256" },
      { name: "last_interest_rate_adj_time", type: "core::integer::u256" },
    ],
  },
  {
    type: "enum",
    name: "bit_usd::TroveManager::Status",
    variants: [
      { name: "NonExistent", type: "()" },
      { name: "Active", type: "()" },
      { name: "ClosedByOwner", type: "()" },
      { name: "ClosedByLiquidation", type: "()" },
      { name: "Zombie", type: "()" },
    ],
  },
  {
    type: "struct",
    name: "bit_usd::TroveManager::Trove",
    members: [
      { name: "debt", type: "core::integer::u256" },
      { name: "coll", type: "core::integer::u256" },
      { name: "stake", type: "core::integer::u256" },
      { name: "status", type: "bit_usd::TroveManager::Status" },
      { name: "array_index", type: "core::integer::u64" },
      { name: "last_debt_update_time", type: "core::integer::u64" },
      { name: "last_interest_rate_adj_time", type: "core::integer::u64" },
      { name: "annual_interest_rate", type: "core::integer::u256" },
      {
        name: "interest_batch_manager",
        type: "core::starknet::contract_address::ContractAddress",
      },
      { name: "batch_debt_shares", type: "core::integer::u256" },
    ],
  },
  {
    type: "struct",
    name: "bit_usd::TroveManager::RewardSnapshots",
    members: [
      { name: "coll", type: "core::integer::u256" },
      { name: "bit_usd_debt", type: "core::integer::u256" },
    ],
  },
  {
    type: "struct",
    name: "bit_usd::TroveManager::LatestBatchData",
    members: [
      { name: "total_debt_shares", type: "core::integer::u256" },
      {
        name: "entire_debt_without_redistribution",
        type: "core::integer::u256",
      },
      {
        name: "entire_coll_without_redistribution",
        type: "core::integer::u256",
      },
      { name: "accrued_interest", type: "core::integer::u256" },
      { name: "recorded_debt", type: "core::integer::u256" },
      { name: "annual_interest_rate", type: "core::integer::u256" },
      { name: "weighted_recorded_debt", type: "core::integer::u256" },
      { name: "annual_management_fee", type: "core::integer::u256" },
      { name: "accrued_management_fee", type: "core::integer::u256" },
      {
        name: "weighted_recorded_batch_management_fee",
        type: "core::integer::u256",
      },
      { name: "last_debt_update_time", type: "core::integer::u256" },
      { name: "last_interest_rate_adj_time", type: "core::integer::u256" },
    ],
  },
  {
    type: "struct",
    name: "core::array::Span::<core::integer::u256>",
    members: [
      { name: "snapshot", type: "@core::array::Array::<core::integer::u256>" },
    ],
  },
  {
    type: "struct",
    name: "bit_usd::TroveManager::TroveChange",
    members: [
      { name: "applied_redist_bit_usd_debt_gain", type: "core::integer::u256" },
      { name: "applied_redist_coll_gain", type: "core::integer::u256" },
      { name: "coll_increase", type: "core::integer::u256" },
      { name: "coll_decrease", type: "core::integer::u256" },
      { name: "debt_increase", type: "core::integer::u256" },
      { name: "debt_decrease", type: "core::integer::u256" },
      { name: "new_weighted_recorded_debt", type: "core::integer::u256" },
      { name: "old_weighted_recorded_debt", type: "core::integer::u256" },
      { name: "upfront_fee", type: "core::integer::u256" },
      { name: "batch_accrued_management_fee", type: "core::integer::u256" },
      {
        name: "new_weighted_recorded_batch_management_fee",
        type: "core::integer::u256",
      },
      {
        name: "old_weighted_recorded_batch_management_fee",
        type: "core::integer::u256",
      },
    ],
  },
  {
    type: "struct",
    name: "bit_usd::TroveManager::OnSetInterestBatchManagerParams",
    members: [
      { name: "trove_id", type: "core::integer::u256" },
      { name: "trove_coll", type: "core::integer::u256" },
      { name: "trove_debt", type: "core::integer::u256" },
      { name: "trove_change", type: "bit_usd::TroveManager::TroveChange" },
      {
        name: "new_batch_address",
        type: "core::starknet::contract_address::ContractAddress",
      },
      { name: "new_batch_coll", type: "core::integer::u256" },
      { name: "new_batch_debt", type: "core::integer::u256" },
    ],
  },
  {
    type: "interface",
    name: "bit_usd::TroveManager::ITroveManager",
    items: [
      {
        type: "function",
        name: "get_unbacked_portion_price_and_redeemability",
        inputs: [],
        outputs: [
          { type: "(core::integer::u256, core::integer::u256, core::bool)" },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_latest_trove_data",
        inputs: [{ name: "trove_id", type: "core::integer::u256" }],
        outputs: [{ type: "bit_usd::TroveManager::LatestTroveData" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_batch_ids",
        inputs: [{ name: "index", type: "core::integer::u64" }],
        outputs: [
          { type: "core::starknet::contract_address::ContractAddress" },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_trove_ids_count",
        inputs: [],
        outputs: [{ type: "core::integer::u64" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_trove_from_trove_ids_array",
        inputs: [{ name: "index", type: "core::integer::u256" }],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_trove_annual_interest_rate",
        inputs: [{ name: "trove_id", type: "core::integer::u256" }],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_trove_status",
        inputs: [{ name: "trove_id", type: "core::integer::u256" }],
        outputs: [{ type: "bit_usd::TroveManager::Status" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_trove_nft",
        inputs: [],
        outputs: [
          { type: "core::starknet::contract_address::ContractAddress" },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_borrower_operations",
        inputs: [],
        outputs: [
          { type: "core::starknet::contract_address::ContractAddress" },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_stability_pool",
        inputs: [],
        outputs: [
          { type: "core::starknet::contract_address::ContractAddress" },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_sorted_troves",
        inputs: [],
        outputs: [
          { type: "core::starknet::contract_address::ContractAddress" },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_CCR",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_troves",
        inputs: [{ name: "index", type: "core::integer::u256" }],
        outputs: [{ type: "bit_usd::TroveManager::Trove" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_reward_snapshots",
        inputs: [{ name: "index", type: "core::integer::u256" }],
        outputs: [{ type: "bit_usd::TroveManager::RewardSnapshots" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_latest_batch_data",
        inputs: [
          {
            name: "batch_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [{ type: "bit_usd::TroveManager::LatestBatchData" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_owner_to_positions",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [{ type: "core::array::Array::<core::integer::u256>" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "set_addresses",
        inputs: [
          {
            name: "active_pool",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "default_pool",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "price_feed",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "eth",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "borrower_operations",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "trove_nft",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "gas_pool",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "coll_surplus_pool",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "sorted_troves",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "collateral_registry",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "bitusd",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "stability_pool",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "get_current_ICR",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "price", type: "core::integer::u256" },
        ],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_last_zombie_trove_id",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_shutdown_time",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "redeem_collateral",
        inputs: [
          {
            name: "msg_sender",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "redeem_amount", type: "core::integer::u256" },
          { name: "price", type: "core::integer::u256" },
          { name: "redemption_rate", type: "core::integer::u256" },
          { name: "max_iterations", type: "core::integer::u256" },
        ],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "batch_liquidate_troves",
        inputs: [
          {
            name: "trove_array",
            type: "core::array::Span::<core::integer::u256>",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_remove_from_batch",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "new_trove_coll", type: "core::integer::u256" },
          { name: "new_trove_debt", type: "core::integer::u256" },
          { name: "trove_change", type: "bit_usd::TroveManager::TroveChange" },
          {
            name: "batch_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "new_batch_coll", type: "core::integer::u256" },
          { name: "new_batch_debt", type: "core::integer::u256" },
          { name: "new_annual_interest_rate", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_set_interest_batch_manager",
        inputs: [
          {
            name: "params",
            type: "bit_usd::TroveManager::OnSetInterestBatchManagerParams",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_lower_batch_manager_annual_fee",
        inputs: [
          {
            name: "batch_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "new_coll", type: "core::integer::u256" },
          { name: "new_debt", type: "core::integer::u256" },
          { name: "new_annual_management_fee", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "urgent_redemption",
        inputs: [
          { name: "bit_usd_amount", type: "core::integer::u256" },
          {
            name: "trove_ids",
            type: "core::array::Span::<core::integer::u256>",
          },
          { name: "min_collateral", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_open_trove_and_join_batch",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "trove_id", type: "core::integer::u256" },
          { name: "trove_change", type: "bit_usd::TroveManager::TroveChange" },
          {
            name: "batch_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "batch_coll", type: "core::integer::u256" },
          { name: "batch_debt", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "set_trove_status_to_active",
        inputs: [{ name: "trove_id", type: "core::integer::u256" }],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_adjust_trove_interest_rate",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "new_coll", type: "core::integer::u256" },
          { name: "new_debt", type: "core::integer::u256" },
          { name: "new_annual_interest_rate", type: "core::integer::u256" },
          { name: "trove_change", type: "bit_usd::TroveManager::TroveChange" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_adjust_trove",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "new_coll", type: "core::integer::u256" },
          { name: "new_debt", type: "core::integer::u256" },
          { name: "trove_change", type: "bit_usd::TroveManager::TroveChange" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_close_trove",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "trove_change", type: "bit_usd::TroveManager::TroveChange" },
          {
            name: "batch_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "new_batch_coll", type: "core::integer::u256" },
          { name: "new_batch_debt", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_open_trove",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "trove_id", type: "core::integer::u256" },
          { name: "trove_change", type: "bit_usd::TroveManager::TroveChange" },
          { name: "annual_interest_rate", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_adjust_trove_inside_batch",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "new_trove_coll", type: "core::integer::u256" },
          { name: "new_trove_debt", type: "core::integer::u256" },
          { name: "trove_change", type: "bit_usd::TroveManager::TroveChange" },
          {
            name: "batch_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "new_batch_coll", type: "core::integer::u256" },
          { name: "new_batch_debt", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_apply_trove_interest",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "new_trove_coll", type: "core::integer::u256" },
          { name: "new_trove_debt", type: "core::integer::u256" },
          {
            name: "batch_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "new_batch_coll", type: "core::integer::u256" },
          { name: "new_batch_debt", type: "core::integer::u256" },
          { name: "trove_change", type: "bit_usd::TroveManager::TroveChange" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_register_batch_manager",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "annual_interest_rate", type: "core::integer::u256" },
          { name: "annual_management_fee", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "shutdown",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_set_batch_manager_annual_interest_rate",
        inputs: [
          {
            name: "batch_address",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "new_coll", type: "core::integer::u256" },
          { name: "new_debt", type: "core::integer::u256" },
          { name: "new_annual_interest_rate", type: "core::integer::u256" },
          { name: "upfront_fee", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
    ],
  },
  {
    type: "impl",
    name: "LiquityBaseImpl",
    interface_name: "bit_usd::dependencies::LiquityBase::ILiquityBase",
  },
  {
    type: "interface",
    name: "bit_usd::dependencies::LiquityBase::ILiquityBase",
    items: [
      {
        type: "function",
        name: "get_entire_branch_coll",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_entire_branch_debt",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
    ],
  },
  {
    type: "constructor",
    name: "constructor",
    inputs: [
      {
        name: "addresses_registry",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::ActivePoolAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_active_pool_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::DefaultPoolAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_default_pool_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::PriceFeedAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_price_feed_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::Event",
    kind: "enum",
    variants: [
      {
        name: "ActivePoolAddressChanged",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::ActivePoolAddressChanged",
        kind: "nested",
      },
      {
        name: "DefaultPoolAddressChanged",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::DefaultPoolAddressChanged",
        kind: "nested",
      },
      {
        name: "PriceFeedAddressChanged",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::PriceFeedAddressChanged",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::TroveManager::TroveManager::Event",
    kind: "enum",
    variants: [
      {
        name: "LiquityBaseEvent",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::Event",
        kind: "flat",
      },
    ],
  },
] as const satisfies Abi;

export const BORROWER_OPERATIONS_ADDRESS =
  "0x78c4cf9487ed62e1d0493e2ced5fba1a7967821b724570b43168cc1c3ee5125";
export const AP_ADDRESS =
  "0x3c48071797a190796702afc65662193dd64a3c0f804f4bb10585bddc854e7da";
export const COLL_SURPLUS_ADDRESS =
  "0x22af123449ea2128ebf55e28fd3e42fb7c6c2f6d2fdbfcce270e617656c1947";
export const DEFAULT_POOL_ADDRESS =
  "0x42bc9a14c28f61bbdd58bb869878089d66ba81b535b80896f35ff5fbe5f020e";
export const SORTED_TROVES_ADDRESS =
  "0x567b1898ed5d0c605e885630c97ced5e0c621fae596813cbd9e1c96cefb4ca8";
export const TM_ADDRESS =
  "0x4a4f2b83d0fbd3413a49c489f9f66f57127414b4a5dd8d12eef74b926d0fa77";
export const TROVE_NFT_ADDRESS =
  "0x2b953c32396151e9e043647bad6e3537a7c9d691f7f1d621dea1b8258065b9";
export const STABILITY_POOL_ADDRESS =
  "0x674956bd771f47d57ad4f8078ad6db2ba7ff37d5622627097dc935fcfb3ec73";

export const BORROWER_OPERATIONS_ABI = [
  {
    type: "impl",
    name: "BorrowerOperationsImpl",
    interface_name: "bit_usd::BorrowerOperations::IBorrowerOperations",
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
    type: "struct",
    name: "bit_usd::BorrowerOperations::BorrowerOperations::OpenTroveAndJoinInterestBatchManagerParams",
    members: [
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
      },
      { name: "owner_index", type: "core::integer::u256" },
      { name: "coll_amount", type: "core::integer::u256" },
      { name: "bitusd_amount", type: "core::integer::u256" },
      { name: "upper_hint", type: "core::integer::u256" },
      { name: "lower_hint", type: "core::integer::u256" },
      {
        name: "interest_batch_manager",
        type: "core::starknet::contract_address::ContractAddress",
      },
      { name: "max_upfront_fee", type: "core::integer::u256" },
      {
        name: "add_manager",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "remove_manager",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "receiver",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    type: "enum",
    name: "core::bool",
    variants: [
      { name: "False", type: "()" },
      { name: "True", type: "()" },
    ],
  },
  {
    type: "struct",
    name: "bit_usd::BorrowerOperations::BorrowerOperations::InterestIndividualDelegate",
    members: [
      {
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
      },
      { name: "min_interest_rate", type: "core::integer::u128" },
      { name: "max_interest_rate", type: "core::integer::u128" },
      { name: "min_interest_rate_change_period", type: "core::integer::u256" },
    ],
  },
  {
    type: "interface",
    name: "bit_usd::BorrowerOperations::IBorrowerOperations",
    items: [
      {
        type: "function",
        name: "open_trove",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "owner_index", type: "core::integer::u256" },
          { name: "coll_amount", type: "core::integer::u256" },
          { name: "bitusd_amount", type: "core::integer::u256" },
          { name: "upper_hint", type: "core::integer::u256" },
          { name: "lower_hint", type: "core::integer::u256" },
          { name: "annual_interest_rate", type: "core::integer::u256" },
          { name: "max_upfront_fee", type: "core::integer::u256" },
          {
            name: "add_manager",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "remove_manager",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "receiver",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "open_trove_and_join_interest_batch_manager",
        inputs: [
          {
            name: "params",
            type: "bit_usd::BorrowerOperations::BorrowerOperations::OpenTroveAndJoinInterestBatchManagerParams",
          },
        ],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "add_coll",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "coll_amount", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "withdraw_coll",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "coll_withdrawal", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "withdraw_bitusd",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "bitusd_amount", type: "core::integer::u256" },
          { name: "max_upfront_fee", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "repay_bitusd",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "bitusd_amount", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "close_trove",
        inputs: [{ name: "trove_id", type: "core::integer::u256" }],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "adjust_trove",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "coll_change", type: "core::integer::u256" },
          { name: "is_coll_increase", type: "core::bool" },
          { name: "debt_change", type: "core::integer::u256" },
          { name: "is_debt_increase", type: "core::bool" },
          { name: "max_upfront_fee", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "adjust_zombie_trove",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "coll_change", type: "core::integer::u256" },
          { name: "is_coll_increase", type: "core::bool" },
          { name: "debt_change", type: "core::integer::u256" },
          { name: "is_debt_increase", type: "core::bool" },
          { name: "upper_hint", type: "core::integer::u256" },
          { name: "lower_hint", type: "core::integer::u256" },
          { name: "max_upfront_fee", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "adjust_trove_interest_rate",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "new_annual_interest_rate", type: "core::integer::u256" },
          { name: "upper_hint", type: "core::integer::u256" },
          { name: "lower_hint", type: "core::integer::u256" },
          { name: "max_upfront_fee", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "apply_pending_debt",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "lower_hint", type: "core::integer::u256" },
          { name: "upper_hint", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "on_liquidate_trove",
        inputs: [{ name: "trove_id", type: "core::integer::u256" }],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "claim_collateral",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "has_been_shutdown",
        inputs: [],
        outputs: [{ type: "core::bool" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "shutdown",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "shutdown_from_oracle_failure",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "check_batch_manager_exists",
        inputs: [
          {
            name: "batch_manager",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [{ type: "core::bool" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_interest_individual_delegate_of",
        inputs: [{ name: "trove_id", type: "core::integer::u256" }],
        outputs: [
          {
            type: "bit_usd::BorrowerOperations::BorrowerOperations::InterestIndividualDelegate",
          },
        ],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "set_interest_individual_delegate",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          {
            name: "delegate",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "min_interest_rate", type: "core::integer::u128" },
          { name: "max_interest_rate", type: "core::integer::u128" },
          { name: "new_annual_interest_rate", type: "core::integer::u256" },
          { name: "upper_hint", type: "core::integer::u256" },
          { name: "lower_hint", type: "core::integer::u256" },
          { name: "max_upfront_fee", type: "core::integer::u256" },
          {
            name: "min_interest_rate_change_period",
            type: "core::integer::u256",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "set_interest_batch_manager",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          {
            name: "new_batch_manager",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "upper_hint", type: "core::integer::u256" },
          { name: "lower_hint", type: "core::integer::u256" },
          { name: "max_upfront_fee", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "remove_from_batch",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "new_annual_interest_rate", type: "core::integer::u256" },
          { name: "upper_hint", type: "core::integer::u256" },
          { name: "lower_hint", type: "core::integer::u256" },
          { name: "max_upfront_fee", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "switch_batch_manager",
        inputs: [
          { name: "trove_id", type: "core::integer::u256" },
          { name: "remove_upper_hint", type: "core::integer::u256" },
          { name: "remove_lower_hint", type: "core::integer::u256" },
          {
            name: "new_batch_manager",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "add_upper_hint", type: "core::integer::u256" },
          { name: "add_lower_hint", type: "core::integer::u256" },
          { name: "max_upfront_fee", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
    ],
  },
  {
    type: "impl",
    name: "LiquityBaseImpl",
    interface_name: "bit_usd::dependencies::LiquityBase::ILiquityBase",
  },
  {
    type: "interface",
    name: "bit_usd::dependencies::LiquityBase::ILiquityBase",
    items: [
      {
        type: "function",
        name: "get_entire_branch_coll",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_entire_branch_debt",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
    ],
  },
  {
    type: "constructor",
    name: "constructor",
    inputs: [
      {
        name: "addresses_registry",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::BorrowerOperations::BorrowerOperations::TroveManagerAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_trove_manager_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::BorrowerOperations::BorrowerOperations::GasPoolAddressChanged",
    kind: "struct",
    members: [
      {
        name: "gas_pool_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::BorrowerOperations::BorrowerOperations::CollSurplusPoolAddressChanged",
    kind: "struct",
    members: [
      {
        name: "coll_surplus_pool_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::BorrowerOperations::BorrowerOperations::SortedTrovesAddressChanged",
    kind: "struct",
    members: [
      {
        name: "sorted_troves_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::BorrowerOperations::BorrowerOperations::BitUSDTokenAddressChanged",
    kind: "struct",
    members: [
      {
        name: "bitusd_token_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::BorrowerOperations::BorrowerOperations::ShutDown",
    kind: "struct",
    members: [{ name: "tcr", type: "core::integer::u256", kind: "data" }],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::ActivePoolAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_active_pool_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::DefaultPoolAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_default_pool_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::PriceFeedAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_price_feed_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::Event",
    kind: "enum",
    variants: [
      {
        name: "ActivePoolAddressChanged",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::ActivePoolAddressChanged",
        kind: "nested",
      },
      {
        name: "DefaultPoolAddressChanged",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::DefaultPoolAddressChanged",
        kind: "nested",
      },
      {
        name: "PriceFeedAddressChanged",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::PriceFeedAddressChanged",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::BorrowerOperations::BorrowerOperations::Event",
    kind: "enum",
    variants: [
      {
        name: "TroveManagerAddressChanged",
        type: "bit_usd::BorrowerOperations::BorrowerOperations::TroveManagerAddressChanged",
        kind: "nested",
      },
      {
        name: "GasPoolAddressChanged",
        type: "bit_usd::BorrowerOperations::BorrowerOperations::GasPoolAddressChanged",
        kind: "nested",
      },
      {
        name: "CollSurplusPoolAddressChanged",
        type: "bit_usd::BorrowerOperations::BorrowerOperations::CollSurplusPoolAddressChanged",
        kind: "nested",
      },
      {
        name: "SortedTrovesAddressChanged",
        type: "bit_usd::BorrowerOperations::BorrowerOperations::SortedTrovesAddressChanged",
        kind: "nested",
      },
      {
        name: "BitUSDTokenAddressChanged",
        type: "bit_usd::BorrowerOperations::BorrowerOperations::BitUSDTokenAddressChanged",
        kind: "nested",
      },
      {
        name: "ShutDown",
        type: "bit_usd::BorrowerOperations::BorrowerOperations::ShutDown",
        kind: "nested",
      },
      {
        name: "LiquityBaseEvent",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::Event",
        kind: "flat",
      },
    ],
  },
] as const satisfies Abi;

export const STABILITY_POOL_ABI = [
  {
    type: "impl",
    name: "StabilityPoolImpl",
    interface_name: "bit_usd::StabilityPool::IStabilityPool",
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
    type: "enum",
    name: "core::bool",
    variants: [
      { name: "False", type: "()" },
      { name: "True", type: "()" },
    ],
  },
  {
    type: "interface",
    name: "bit_usd::StabilityPool::IStabilityPool",
    items: [
      {
        type: "function",
        name: "get_coll_balance",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_total_bitusd_deposits",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_yield_gains_owed",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_yield_gains_pending",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "provide_to_sp",
        inputs: [
          { name: "top_up", type: "core::integer::u256" },
          { name: "do_claim", type: "core::bool" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "withdraw_from_sp",
        inputs: [
          { name: "amount", type: "core::integer::u256" },
          { name: "do_claim", type: "core::bool" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "claim_all_coll_gains",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "trigger_bitusd_rewards",
        inputs: [{ name: "bold_yield", type: "core::integer::u256" }],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "offset",
        inputs: [
          { name: "debt_to_offset", type: "core::integer::u256" },
          { name: "coll_to_add", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "get_depositor_coll_gain",
        inputs: [
          {
            name: "depositor",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_depositor_yield_gain",
        inputs: [
          {
            name: "depositor",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_compounded_bitusd_deposit",
        inputs: [
          {
            name: "depositor",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_depositor_yield_gain_with_pending",
        inputs: [
          {
            name: "depositor",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
    ],
  },
  {
    type: "impl",
    name: "LiquityBaseImpl",
    interface_name: "bit_usd::dependencies::LiquityBase::ILiquityBase",
  },
  {
    type: "interface",
    name: "bit_usd::dependencies::LiquityBase::ILiquityBase",
    items: [
      {
        type: "function",
        name: "get_entire_branch_coll",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_entire_branch_debt",
        inputs: [],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
    ],
  },
  {
    type: "constructor",
    name: "constructor",
    inputs: [
      {
        name: "addresses_registry",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::StabilityPool::StabilityPool::StabilityPoolCollBalanceUpdated",
    kind: "struct",
    members: [
      { name: "new_balance", type: "core::integer::u256", kind: "data" },
    ],
  },
  {
    type: "event",
    name: "bit_usd::StabilityPool::StabilityPool::StabilityPoolBitUSDBalanceUpdated",
    kind: "struct",
    members: [
      { name: "new_balance", type: "core::integer::u256", kind: "data" },
    ],
  },
  {
    type: "event",
    name: "bit_usd::StabilityPool::StabilityPool::P_Updated",
    kind: "struct",
    members: [{ name: "P", type: "core::integer::u256", kind: "data" }],
  },
  {
    type: "event",
    name: "bit_usd::StabilityPool::StabilityPool::S_Updated",
    kind: "struct",
    members: [
      { name: "S", type: "core::integer::u256", kind: "data" },
      { name: "scale", type: "core::integer::u256", kind: "data" },
    ],
  },
  {
    type: "event",
    name: "bit_usd::StabilityPool::StabilityPool::B_Updated",
    kind: "struct",
    members: [
      { name: "B", type: "core::integer::u256", kind: "data" },
      { name: "scale", type: "core::integer::u256", kind: "data" },
    ],
  },
  {
    type: "event",
    name: "bit_usd::StabilityPool::StabilityPool::ScaleUpdated",
    kind: "struct",
    members: [
      { name: "current_scale", type: "core::integer::u256", kind: "data" },
    ],
  },
  {
    type: "event",
    name: "bit_usd::StabilityPool::StabilityPool::DepositUpdated",
    kind: "struct",
    members: [
      {
        name: "depositor",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
      { name: "new_deposit", type: "core::integer::u256", kind: "data" },
      { name: "stashed_coll", type: "core::integer::u256", kind: "data" },
      { name: "snapshot_p", type: "core::integer::u256", kind: "data" },
      { name: "snapshot_s", type: "core::integer::u256", kind: "data" },
      { name: "snapshot_b", type: "core::integer::u256", kind: "data" },
      { name: "snapshot_scale", type: "core::integer::u256", kind: "data" },
    ],
  },
  {
    type: "enum",
    name: "bit_usd::StabilityPool::StabilityPool::Operation",
    variants: [
      { name: "provide_to_sp", type: "()" },
      { name: "withdraw_from_sp", type: "()" },
      { name: "claim_all_coll_gains", type: "()" },
    ],
  },
  {
    type: "struct",
    name: "bit_usd::i257::i257",
    members: [
      { name: "abs", type: "core::integer::u256" },
      { name: "is_negative", type: "core::bool" },
    ],
  },
  {
    type: "event",
    name: "bit_usd::StabilityPool::StabilityPool::DepositOperation",
    kind: "struct",
    members: [
      {
        name: "depositor",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
      {
        name: "operation",
        type: "bit_usd::StabilityPool::StabilityPool::Operation",
        kind: "data",
      },
      {
        name: "deposit_loss_since_last_operation",
        type: "core::integer::u256",
        kind: "data",
      },
      {
        name: "top_up_or_withdrawal",
        type: "bit_usd::i257::i257",
        kind: "data",
      },
      {
        name: "yield_gain_since_last_operation",
        type: "core::integer::u256",
        kind: "data",
      },
      { name: "yield_gain_claimed", type: "core::integer::u256", kind: "data" },
      {
        name: "eth_gain_since_last_operation",
        type: "core::integer::u256",
        kind: "data",
      },
      { name: "eth_gain_claimed", type: "core::integer::u256", kind: "data" },
    ],
  },
  {
    type: "event",
    name: "bit_usd::StabilityPool::StabilityPool::TroveManagerAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_trove_manager_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::StabilityPool::StabilityPool::BitUSDTokenAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_bitusd_token_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::ActivePoolAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_active_pool_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::DefaultPoolAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_default_pool_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::PriceFeedAddressChanged",
    kind: "struct",
    members: [
      {
        name: "new_price_feed_address",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::Event",
    kind: "enum",
    variants: [
      {
        name: "ActivePoolAddressChanged",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::ActivePoolAddressChanged",
        kind: "nested",
      },
      {
        name: "DefaultPoolAddressChanged",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::DefaultPoolAddressChanged",
        kind: "nested",
      },
      {
        name: "PriceFeedAddressChanged",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::PriceFeedAddressChanged",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "bit_usd::StabilityPool::StabilityPool::Event",
    kind: "enum",
    variants: [
      {
        name: "StabilityPoolCollBalanceUpdated",
        type: "bit_usd::StabilityPool::StabilityPool::StabilityPoolCollBalanceUpdated",
        kind: "nested",
      },
      {
        name: "StabilityPoolBitUSDBalanceUpdated",
        type: "bit_usd::StabilityPool::StabilityPool::StabilityPoolBitUSDBalanceUpdated",
        kind: "nested",
      },
      {
        name: "P_Updated",
        type: "bit_usd::StabilityPool::StabilityPool::P_Updated",
        kind: "nested",
      },
      {
        name: "S_Updated",
        type: "bit_usd::StabilityPool::StabilityPool::S_Updated",
        kind: "nested",
      },
      {
        name: "B_Updated",
        type: "bit_usd::StabilityPool::StabilityPool::B_Updated",
        kind: "nested",
      },
      {
        name: "ScaleUpdated",
        type: "bit_usd::StabilityPool::StabilityPool::ScaleUpdated",
        kind: "nested",
      },
      {
        name: "DepositUpdated",
        type: "bit_usd::StabilityPool::StabilityPool::DepositUpdated",
        kind: "nested",
      },
      {
        name: "DepositOperation",
        type: "bit_usd::StabilityPool::StabilityPool::DepositOperation",
        kind: "nested",
      },
      {
        name: "TroveManagerAddressChanged",
        type: "bit_usd::StabilityPool::StabilityPool::TroveManagerAddressChanged",
        kind: "nested",
      },
      {
        name: "BitUSDTokenAddressChanged",
        type: "bit_usd::StabilityPool::StabilityPool::BitUSDTokenAddressChanged",
        kind: "nested",
      },
      {
        name: "LiquityBaseEvent",
        type: "bit_usd::dependencies::LiquityBase::LiquityBaseComponent::Event",
        kind: "flat",
      },
    ],
  },
] as const satisfies Abi;

// Token definitions for reusable components
export const TBTC_TOKEN = {
  address: TBTC_ADDRESS,
  symbol: TBTC_SYMBOL,
  decimals: TBTC_DECIMALS,
  icon: "/bitcoin.png",
} as const;

export const BITUSD_TOKEN = {
  address: BITUSD_ADDRESS,
  symbol: "bitUSD",
  decimals: 18,
  icon: "/bitusd.png",
} as const;
