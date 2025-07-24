import { Contract } from "starknet";
import { USDU, getContractDefinitions } from "./definitions";
import { getCollateralAddresses, type CollateralType } from "./constants";
import {
  BORROWER_OPERATIONS_ABI,
  UBTC_ABI,
  PRICE_FEED_ABI,
  TROVE_MANAGER_ABI,
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
  },

  usdu: {
    /**
     * Get USDU balance of an account
     */
    balanceOf: (account: string) => {
      const contract = new Contract(USDU.abi, USDU.address);
      return contract.populate("balanceOf", [account]);
    },
    /**
     * Approve spending of USDU tokens
     */
    approve: (spender: string, amount: bigint) => {
      const contract = new Contract(USDU.abi, USDU.address);
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

    /**
     * Fetch the redemption price
     */
    fetchRedemptionPrice: (collateralType: CollateralType) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(PRICE_FEED_ABI, addresses.priceFeed);
      return contract.populate("fetch_redemption_price", []);
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

    /**
     * Get trove status
     */
    getTroveStatus: (troveId: bigint, collateralType: CollateralType) => {
      const addresses = getCollateralAddresses(collateralType);
      const contract = new Contract(TROVE_MANAGER_ABI, addresses.troveManager);
      return contract.populate("get_trove_status", [troveId]);
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
    usdu: new Contract(USDU.abi, USDU.address, provider),
    priceFeed: new Contract(PRICE_FEED_ABI, addresses.priceFeed, provider),
    troveManager: new Contract(
      TROVE_MANAGER_ABI,
      addresses.troveManager,
      provider
    ),
  };
};
