import type { Abi } from "starknet";

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
