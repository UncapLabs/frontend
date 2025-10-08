import { Contract, type RpcProvider } from "starknet";
import {
  getCollateralAddresses,
  getBranchId,
  type CollateralId,
  TOKENS,
} from "~/lib/collateral";
import {
  BORROWER_OPERATIONS_ABI,
  UBTC_ABI,
  PRICE_FEED_ABI,
  TROVE_MANAGER_ABI,
  COLL_SURPLUS_POOL_ABI,
  ADDRESSES_REGISTRY_ABI,
  HINT_HELPERS_ABI,
  STABILITY_POOL_ABI,
  USDU_ABI,
  COLLATERAL_WRAPPER_ABI,
} from ".";

/**
 * Contract builders that leverage ABIs for type safety
 * This approach maintains the benefits of ABI validation while providing a cleaner API
 */

/**
 * Contract call builders using populate for type safety
 */
export const contractCall = {
  /**
   * Generic ERC20 token calls that accept a token address
   */
  token: {
    /**
     * Approve spending of tokens
     */
    approve: (tokenAddress: string, spender: string, amount: bigint) => {
      const contract = new Contract({
        abi: UBTC_ABI, // ERC20 ABI is the same for all tokens
        address: tokenAddress,
      });
      return contract.populate("approve", [spender, amount]);
    },
  },

  borrowerOperations: {
    /**
     * Open a new trove position
     */
    openTrove: (params: {
      owner: string;
      ownerIndex: bigint;
      collAmount: bigint;
      usduAmount: bigint;
      upperHint?: bigint;
      lowerHint?: bigint;
      annualInterestRate: bigint;
      maxUpfrontFee?: bigint;
      addManager?: string;
      removeManager?: string;
      receiver?: string;
      collateralType: CollateralId;
    }) => {
      const addresses = getCollateralAddresses(params.collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
      });

      return contract.populate("open_trove", [
        params.owner,
        params.ownerIndex,
        params.collAmount,
        params.usduAmount,
        params.upperHint ?? 0n,
        params.lowerHint ?? 0n,
        params.annualInterestRate,
        params.maxUpfrontFee ?? 2n ** 256n - 1n,
        params.addManager ?? "0x0",
        params.removeManager ?? "0x0",
        params.receiver ?? "0x0",
      ]);
    },

    /**
     * Add collateral to an existing trove
     */
    addColl: (
      troveId: bigint,
      collAmount: bigint,
      collateralType: CollateralId
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
      });
      return contract.populate("add_coll", [troveId, collAmount]);
    },

    /**
     * Withdraw collateral from a trove
     */
    withdrawColl: (
      troveId: bigint,
      collWithdrawal: bigint,
      collateralType: CollateralId
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
      });
      return contract.populate("withdraw_coll", [troveId, collWithdrawal]);
    },

    /**
     * Borrow more USDU from a trove
     */
    withdrawUsdu: (
      troveId: bigint,
      usduAmount: bigint,
      maxUpfrontFee: bigint,
      collateralType: CollateralId
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
      });
      return contract.populate("withdraw_usdu", [
        troveId,
        usduAmount,
        maxUpfrontFee,
      ]);
    },

    /**
     * Repay USDU debt
     */
    repayUsdu: (
      troveId: bigint,
      usduAmount: bigint,
      collateralType: CollateralId
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
      });
      return contract.populate("repay_usdu", [troveId, usduAmount]);
    },

    /**
     * Close a trove
     */
    closeTrove: (troveId: bigint, collateralType: CollateralId) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
      });
      return contract.populate("close_trove", [troveId]);
    },

    /**
     * Adjust a trove (add/remove collateral and/or debt)
     */
    adjustTrove: (params: {
      troveId: bigint;
      collChange: bigint;
      isCollIncrease: boolean;
      debtChange: bigint;
      isDebtIncrease: boolean;
      maxUpfrontFee: bigint;
      collateralType: CollateralId;
    }) => {
      const addresses = getCollateralAddresses(params.collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
      });
      return contract.populate("adjust_trove", [
        params.troveId,
        params.collChange,
        params.isCollIncrease,
        params.debtChange,
        params.isDebtIncrease,
        params.maxUpfrontFee,
      ]);
    },

    /**
     * Get the batch manager of a trove (for interest rate delegation)
     */
    interestBatchManagerOf: (troveId: bigint, collateralType: CollateralId) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
      });
      return contract.populate("get_interest_batch_manager_of", [troveId]);
    },

    /**
     * Adjust the interest rate of a trove
     */
    adjustTroveInterestRate: (params: {
      troveId: bigint;
      annualInterestRate: bigint;
      upperHint?: bigint;
      lowerHint?: bigint;
      maxUpfrontFee?: bigint;
      collateralType: CollateralId;
    }) => {
      const addresses = getCollateralAddresses(params.collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
      });
      return contract.populate("adjust_trove_interest_rate", [
        params.troveId,
        params.annualInterestRate,
        params.upperHint ?? 0n,
        params.lowerHint ?? 0n,
        params.maxUpfrontFee ?? 2n ** 256n - 1n,
      ]);
    },

    /**
     * Adjust a zombie trove (trove with debt < MIN_DEBT)
     * This is the only way to modify a zombie trove
     */
    adjustZombieTrove: (params: {
      troveId: bigint;
      collChange: bigint;
      isCollIncrease: boolean;
      debtChange: bigint;
      isDebtIncrease: boolean;
      upperHint?: bigint;
      lowerHint?: bigint;
      maxUpfrontFee?: bigint;
      collateralType: CollateralId;
    }) => {
      const addresses = getCollateralAddresses(params.collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
      });
      return contract.populate("adjust_zombie_trove", [
        params.troveId,
        params.collChange,
        params.isCollIncrease,
        params.debtChange,
        params.isDebtIncrease,
        params.upperHint ?? 0n,
        params.lowerHint ?? 0n,
        params.maxUpfrontFee ?? 2n ** 256n - 1n,
      ]);
    },

    /**
     * Claim collateral surplus after liquidation
     * This is called by borrowers to claim any excess collateral
     * from liquidated positions
     */
    claimCollateral: (borrower: string, collateralType: CollateralId) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
      });
      return contract.populate("claim_collateral", [borrower]);
    },
  },

  usdu: {
    /**
     * Approve spending of USDU tokens
     */
    approve: (spender: string, amount: bigint) => {
      const contract = new Contract({
        abi: USDU_ABI,
        address: TOKENS.USDU.address,
      });
      return contract.populate("approve", [spender, amount]);
    },
  },

  collateralWrapper: {
    /**
     * Wrap underlying token (8 decimals) to wrapped token (18 decimals)
     * @param wrapperAddress - Address of the CollateralWrapper contract
     * @param amount - Amount in 8 decimals (underlying token precision)
     */
    wrap: (wrapperAddress: string, amount: bigint) => {
      const contract = new Contract({
        abi: COLLATERAL_WRAPPER_ABI,
        address: wrapperAddress,
      });
      return contract.populate("wrap", [amount]);
    },

    /**
     * Unwrap wrapped token (18 decimals) to underlying token (8 decimals)
     * @param wrapperAddress - Address of the CollateralWrapper contract
     * @param amount - Amount in 18 decimals (wrapped token precision)
     */
    unwrap: (wrapperAddress: string, amount: bigint) => {
      const contract = new Contract({
        abi: COLLATERAL_WRAPPER_ABI,
        address: wrapperAddress,
      });
      return contract.populate("unwrap", [amount]);
    },
  },

  troveManager: {
    /**
     * Get the latest trove data
     */
    getLatestTroveData: (troveId: bigint, collateralType: CollateralId) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: TROVE_MANAGER_ABI,
        address: addresses.troveManager,
      });
      return contract.populate("get_latest_trove_data", [troveId]);
    },
  },

  stabilityPool: {
    /**
     * Deposit USDU into the Stability Pool
     * @param amount - Amount of USDU to deposit
     * @param doClaim - Whether to claim rewards when depositing
     * @param collateralType - Type of collateral
     */
    deposit: (
      amount: bigint,
      doClaim: boolean,
      collateralType: CollateralId
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: STABILITY_POOL_ABI,
        address: addresses.stabilityPool,
      });
      return contract.populate("provide_to_sp", [amount, doClaim]);
    },

    /**
     * Withdraw USDU from the Stability Pool
     * @param amount - Amount of USDU to withdraw
     * @param doClaim - Whether to claim rewards when withdrawing
     * @param collateralType - Type of collateral
     */
    withdraw: (
      amount: bigint,
      doClaim: boolean,
      collateralType: CollateralId
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: STABILITY_POOL_ABI,
        address: addresses.stabilityPool,
      });
      return contract.populate("withdraw_from_sp", [amount, doClaim]);
    },
  },

  collSurplusPool: {
    /**
     * Get the collateral surplus for a borrower
     * This returns the amount of collateral available to claim
     */
    getCollateral: (borrower: string, collateralType: CollateralId) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: COLL_SURPLUS_POOL_ABI,
        address: addresses.collSurplusPool,
      });
      return contract.populate("get_collateral", [borrower]);
    },
  },
};

/**
 * Contract readers that execute calls and return parsed responses
 * These use the contract instances with provider to get properly parsed data
 */
export const contractRead = {
  borrowerOperations: {
    /**
     * Get the batch manager of a trove with parsed response
     */
    getInterestBatchManagerOf: async (
      provider: RpcProvider,
      troveId: bigint,
      collateralType: CollateralId
    ): Promise<string> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: BORROWER_OPERATIONS_ABI,
        address: addresses.borrowerOperations,
        providerOrAccount: provider,
      });
      const result = await contract.call("get_interest_batch_manager_of", [
        troveId,
      ]);
      return result as string;
    },
  },

  troveManager: {
    /**
     * Get the latest trove data with parsed response
     */
    getLatestTroveData: async (
      provider: RpcProvider,
      troveId: bigint,
      collateralType: CollateralId
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: TROVE_MANAGER_ABI,
        address: addresses.troveManager,
        providerOrAccount: provider,
      });
      const result = (await contract.call("get_latest_trove_data", [
        troveId,
      ])) as any;

      // The contract returns a struct with all fields properly parsed by Starknet.js
      return {
        entire_debt: result.entire_debt,
        entire_coll: result.entire_coll,
        redist_usdu_debt_gain: result.redist_usdu_debt_gain,
        redist_coll_gain: result.redist_coll_gain,
        accrued_interest: result.accrued_interest,
        recorded_debt: result.recorded_debt,
        annual_interest_rate: result.annual_interest_rate,
        weighted_recorded_debt: result.weighted_recorded_debt,
        accrued_batch_management_fee: result.accrued_batch_management_fee,
        last_interest_rate_adj_time: result.last_interest_rate_adj_time,
      };
    },

    /**
     * Get trove status with parsed response
     */
    getTroveStatus: async (
      provider: RpcProvider,
      troveId: bigint,
      collateralType: CollateralId
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: TROVE_MANAGER_ABI,
        address: addresses.troveManager,
        providerOrAccount: provider,
      });
      const result = await contract.call("get_trove_status", [troveId]);
      return result as bigint;
    },

    /**
     * Get branch TCR data (Total Collateralization Ratio)
     * Returns total collateral and debt for the entire branch
     */
    getBranchTCR: async (
      provider: RpcProvider,
      collateralType: CollateralId
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: TROVE_MANAGER_ABI,
        address: addresses.troveManager,
        providerOrAccount: provider,
      });

      // Fetch branch totals sequentially to avoid starknet.js concurrency bug
      const entireColl = await contract.call("get_entire_branch_coll", []);
      const entireDebt = await contract.call("get_entire_branch_debt", []);

      return {
        totalCollateral: entireColl as bigint,
        totalDebt: entireDebt as bigint,
      };
    },
  },

  addressesRegistry: {
    /**
     * Get the CCR (Critical Collateralization Ratio)
     */
    getCcr: async (
      provider: RpcProvider,
      collateralType: CollateralId
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: ADDRESSES_REGISTRY_ABI,
        address: addresses.addressesRegistry,
        providerOrAccount: provider,
      });
      const result = await contract.call("get_ccr", []);
      return result as bigint;
    },
  },

  collSurplusPool: {
    /**
     * Get the collateral surplus for a borrower
     */
    getCollateral: async (
      provider: RpcProvider,
      borrower: string,
      collateralType: CollateralId
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: COLL_SURPLUS_POOL_ABI,
        address: addresses.collSurplusPool,
        providerOrAccount: provider,
      });
      const result = await contract.call("get_collateral", [borrower]);
      return result as bigint;
    },
  },

  hintHelpers: {
    /**
     * Predict the upfront fee for opening a new trove
     */
    predictOpenTroveUpfrontFee: async (
      provider: RpcProvider,
      collateralType: CollateralId,
      borrowedAmount: bigint,
      interestRate: bigint
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const branchId = getBranchId(collateralType);

      const contract = new Contract({
        abi: HINT_HELPERS_ABI,
        address: addresses.hintHelpers,
        providerOrAccount: provider,
      });

      const result = await contract.call("predict_open_trove_upfront_fee", [
        branchId,
        borrowedAmount,
        interestRate,
      ]);

      return result as bigint;
    },

    /**
     * Predict the upfront fee for adjusting a trove (increasing debt)
     */
    predictAdjustTroveUpfrontFee: async (
      provider: RpcProvider,
      collateralType: CollateralId,
      troveId: bigint,
      debtIncrease: bigint
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const branchId = getBranchId(collateralType);

      const contract = new Contract({
        abi: HINT_HELPERS_ABI,
        address: addresses.hintHelpers,
        providerOrAccount: provider,
      });

      const result = await contract.call("predict_adjust_trove_upfront_fee", [
        branchId,
        troveId,
        debtIncrease,
      ]);

      return result as bigint;
    },
  },

  stabilityPool: {
    /**
     * Get total deposits in the stability pool
     */
    getTotalDeposits: async (
      provider: RpcProvider,
      collateralType: CollateralId
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: STABILITY_POOL_ABI,
        address: addresses.stabilityPool,
        providerOrAccount: provider,
      });
      const result = await contract.call("get_total_usdu_deposits", []);
      return result as bigint;
    },

    /**
     * Get all stability pool data for a user in one call
     */
    getUserPosition: async (
      provider: RpcProvider,
      userAddress: string,
      collateralType: CollateralId
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract({
        abi: STABILITY_POOL_ABI,
        address: addresses.stabilityPool,
        providerOrAccount: provider,
      });

      // Fetch all data sequentially to avoid starknet.js concurrency bug
      // Use get_depositor_yield_gain_with_pending to include pending rewards
      // CRITICAL: Must fetch both collateralGain (pending) and stashedColl (from previous compounds)
      const deposit = await contract.call("get_deposits", [userAddress]);
      const usduGain = await contract.call("get_depositor_yield_gain_with_pending", [userAddress]);
      const collateralGain = await contract.call("get_depositor_coll_gain", [userAddress]);
      const stashedColl = await contract.call("get_stashed_coll", [userAddress]);
      const totalDeposits = await contract.call("get_total_usdu_deposits", []);

      return {
        deposit: deposit as bigint,
        usduGain: usduGain as bigint,
        collateralGain: collateralGain as bigint,
        stashedColl: stashedColl as bigint,
        totalDeposits: totalDeposits as bigint,
      };
    },
  },
};

/**
 * Factory functions to create contract instances with provider
 * Use these when you need to pass a provider for actual calls
 */
export const createContracts = (
  collateralType: CollateralId,
  provider?: any
) => {
  const addresses = getCollateralAddresses(collateralType);

  return {
    collateral: new Contract({
      abi: UBTC_ABI, // Assuming all collaterals use same ERC20 ABI
      address: addresses.token,
      providerOrAccount: provider,
    }),
    borrowerOperations: new Contract({
      abi: BORROWER_OPERATIONS_ABI,
      address: addresses.borrowerOperations,
      providerOrAccount: provider,
    }),
    usdu: new Contract({
      abi: USDU_ABI,
      address: TOKENS.USDU.address,
      providerOrAccount: provider,
    }),
    priceFeed: new Contract({
      abi: PRICE_FEED_ABI,
      address: addresses.priceFeed,
      providerOrAccount: provider,
    }),
    troveManager: new Contract({
      abi: TROVE_MANAGER_ABI,
      address: addresses.troveManager,
      providerOrAccount: provider,
    }),
  };
};
