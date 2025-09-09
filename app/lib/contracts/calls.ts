import { Contract, type RpcProvider } from "starknet";
import {
  getCollateralAddresses,
  getBranchId,
  type CollateralType,
  USDU_TOKEN,
} from "./constants";
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
      const contract = new Contract(
        UBTC_ABI, // ERC20 ABI is the same for all tokens
        tokenAddress
      );
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
      collateralType: CollateralType;
    }) => {
      const addresses = getCollateralAddresses(params.collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations
      );

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
      collateralType: CollateralType
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations
      );
      return contract.populate("add_coll", [troveId, collAmount]);
    },

    /**
     * Withdraw collateral from a trove
     */
    withdrawColl: (
      troveId: bigint,
      collWithdrawal: bigint,
      collateralType: CollateralType
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations
      );
      return contract.populate("withdraw_coll", [troveId, collWithdrawal]);
    },

    /**
     * Borrow more USDU from a trove
     */
    withdrawUsdu: (
      troveId: bigint,
      usduAmount: bigint,
      maxUpfrontFee: bigint,
      collateralType: CollateralType
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations
      );
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
      collateralType: CollateralType
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations
      );
      return contract.populate("repay_usdu", [troveId, usduAmount]);
    },

    /**
     * Close a trove
     */
    closeTrove: (troveId: bigint, collateralType: CollateralType) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations
      );
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
      collateralType: CollateralType;
    }) => {
      const addresses = getCollateralAddresses(params.collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations
      );
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
    interestBatchManagerOf: (
      troveId: bigint,
      collateralType: CollateralType
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations
      );
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
      collateralType: CollateralType;
    }) => {
      const addresses = getCollateralAddresses(params.collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations
      );
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
      collateralType: CollateralType;
    }) => {
      const addresses = getCollateralAddresses(params.collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations
      );
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
    claimCollateral: (borrower: string, collateralType: CollateralType) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations
      );
      return contract.populate("claim_collateral", [borrower]);
    },
  },

  usdu: {
    /**
     * Approve spending of USDU tokens
     */
    approve: (spender: string, amount: bigint) => {
      const contract = new Contract(USDU_ABI, USDU_TOKEN.address);
      return contract.populate("approve", [spender, amount]);
    },
  },

  priceFeed: {
    /**
     * Fetch the current BTC price
     */
    fetchPrice: (collateralType: CollateralType) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(PRICE_FEED_ABI, addresses.priceFeed);
      return contract.populate("fetch_price", []);
    },
  },

  troveManager: {
    /**
     * Get the latest trove data
     */
    getLatestTroveData: (troveId: bigint, collateralType: CollateralType) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(TROVE_MANAGER_ABI, addresses.troveManager);
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
      collateralType: CollateralType
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        STABILITY_POOL_ABI,
        addresses.stabilityPool
      );
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
      collateralType: CollateralType
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        STABILITY_POOL_ABI,
        addresses.stabilityPool
      );
      return contract.populate("withdraw_from_sp", [amount, doClaim]);
    },
  },

  collSurplusPool: {
    /**
     * Get the collateral surplus for a borrower
     * This returns the amount of collateral available to claim
     */
    getCollateral: (borrower: string, collateralType: CollateralType) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        COLL_SURPLUS_POOL_ABI,
        addresses.collSurplusPool
      );
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
      collateralType: CollateralType
    ): Promise<string> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        BORROWER_OPERATIONS_ABI,
        addresses.borrowerOperations,
        provider
      );
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
      collateralType: CollateralType
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        TROVE_MANAGER_ABI,
        addresses.troveManager,
        provider
      );
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
      collateralType: CollateralType
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        TROVE_MANAGER_ABI,
        addresses.troveManager,
        provider
      );
      const result = await contract.call("get_trove_status", [troveId]);
      return result as bigint;
    },

    /**
     * Get branch TCR data (Total Collateralization Ratio)
     * Returns total collateral and debt for the entire branch
     */
    getBranchTCR: async (
      provider: RpcProvider,
      collateralType: CollateralType
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        TROVE_MANAGER_ABI,
        addresses.troveManager,
        provider
      );

      // Fetch branch totals
      const [entireColl, entireDebt] = await Promise.all([
        contract.call("get_entire_branch_coll", []),
        contract.call("get_entire_branch_debt", []),
      ]);

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
    getCcr: async (provider: RpcProvider, collateralType: CollateralType): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        ADDRESSES_REGISTRY_ABI,
        addresses.addressesRegistry,
        provider
      );
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
      collateralType: CollateralType
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        COLL_SURPLUS_POOL_ABI,
        addresses.collSurplusPool,
        provider
      );
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
      collateralType: CollateralType,
      borrowedAmount: bigint,
      interestRate: bigint
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const branchId = getBranchId(collateralType);

      const contract = new Contract(
        HINT_HELPERS_ABI,
        addresses.hintHelpers,
        provider
      );

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
      collateralType: CollateralType,
      troveId: bigint,
      debtIncrease: bigint
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const branchId = getBranchId(collateralType);

      const contract = new Contract(
        HINT_HELPERS_ABI,
        addresses.hintHelpers,
        provider
      );

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
     * Get user's deposit in the stability pool
     */
    getDeposit: async (
      provider: RpcProvider,
      userAddress: string,
      collateralType: CollateralType
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        STABILITY_POOL_ABI,
        addresses.stabilityPool,
        provider
      );
      const result = await contract.call("deposits", [userAddress]);
      return result as bigint;
    },

    /**
     * Get user's USDU rewards (gains) from the stability pool
     */
    getDepositorGain: async (
      provider: RpcProvider,
      userAddress: string,
      collateralType: CollateralType
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        STABILITY_POOL_ABI,
        addresses.stabilityPool,
        provider
      );
      const result = await contract.call("get_depositor_yield_gain", [
        userAddress,
      ]);
      return result as bigint;
    },

    /**
     * Get user's collateral rewards from liquidations
     */
    getDepositorCollateralGain: async (
      provider: RpcProvider,
      userAddress: string,
      collateralType: CollateralType
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        STABILITY_POOL_ABI,
        addresses.stabilityPool,
        provider
      );
      const result = await contract.call("get_depositor_coll_gain", [
        userAddress,
      ]);
      return result as bigint;
    },

    /**
     * Get total deposits in the stability pool
     */
    getTotalDeposits: async (
      provider: RpcProvider,
      collateralType: CollateralType
    ): Promise<bigint> => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        STABILITY_POOL_ABI,
        addresses.stabilityPool,
        provider
      );
      const result = await contract.call("get_total_usdu_deposits", []);
      return result as bigint;
    },

    /**
     * Get all stability pool data for a user in one call
     */
    getUserPosition: async (
      provider: RpcProvider,
      userAddress: string,
      collateralType: CollateralType
    ) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(
        STABILITY_POOL_ABI,
        addresses.stabilityPool,
        provider
      );

      // Fetch all data in parallel
      // Use get_depositor_yield_gain_with_pending to include pending rewards
      const [deposit, usduGain, collateralGain, totalDeposits] =
        await Promise.all([
          contract.call("deposits", [userAddress]),
          contract.call("get_depositor_yield_gain_with_pending", [userAddress]),
          contract.call("get_depositor_coll_gain", [userAddress]),
          contract.call("get_total_usdu_deposits", []),
        ]);

      return {
        deposit: deposit as bigint,
        usduGain: usduGain as bigint,
        collateralGain: collateralGain as bigint,
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
  collateralType: CollateralType,
  provider?: any
) => {
  const addresses = getCollateralAddresses(collateralType);

  return {
    collateral: new Contract(
      UBTC_ABI, // Assuming all collaterals use same ERC20 ABI
      addresses.collateral,
      provider
    ),
    borrowerOperations: new Contract(
      BORROWER_OPERATIONS_ABI,
      addresses.borrowerOperations,
      provider
    ),
    usdu: new Contract(USDU_ABI, USDU_TOKEN.address, provider),
    priceFeed: new Contract(PRICE_FEED_ABI, addresses.priceFeed, provider),
    troveManager: new Contract(
      TROVE_MANAGER_ABI,
      addresses.troveManager,
      provider
    ),
  };
};
