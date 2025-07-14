import { Contract } from "starknet";
import * as contractDefs from "./definitions";

/**
 * Contract builders that leverage ABIs for type safety
 * This approach maintains the benefits of ABI validation while providing a cleaner API
 */

/**
 * Contract call builders using populate for type safety
 */
export const contractCall = {
  tbtc: {
    /**
     * Approve spending of TBTC tokens
     */
    approve: (spender: string, amount: bigint) => {
      const contract = new Contract(
        contractDefs.TBTC.abi,
        contractDefs.TBTC.address
      );
      return contract.populate("approve", [spender, amount]);
    },

    /**
     * Get TBTC balance of an account (for simulating calls)
     */
    balanceOf: (account: string) => {
      const contract = new Contract(
        contractDefs.TBTC.abi,
        contractDefs.TBTC.address
      );
      return contract.populate("balanceOf", [account]);
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
      bitUsdAmount: bigint;
      upperHint?: bigint;
      lowerHint?: bigint;
      annualInterestRate: bigint;
      maxUpfrontFee?: bigint;
      addManager?: string;
      removeManager?: string;
      receiver?: string;
    }) => {
      const contract = new Contract(
        contractDefs.BorrowerOperations.abi,
        contractDefs.BorrowerOperations.address
      );
      return contract.populate("open_trove", [
        params.owner,
        params.ownerIndex,
        params.collAmount,
        params.bitUsdAmount,
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
    addColl: (troveId: bigint, collAmount: bigint) => {
      const contract = new Contract(
        contractDefs.BorrowerOperations.abi,
        contractDefs.BorrowerOperations.address
      );
      return contract.populate("add_coll", [troveId, collAmount]);
    },

    /**
     * Withdraw collateral from a trove
     */
    withdrawColl: (troveId: bigint, collWithdrawal: bigint) => {
      const contract = new Contract(
        contractDefs.BorrowerOperations.abi,
        contractDefs.BorrowerOperations.address
      );
      return contract.populate("withdraw_coll", [troveId, collWithdrawal]);
    },

    /**
     * Borrow more BitUSD from a trove
     */
    withdrawBitUsd: (
      troveId: bigint,
      bitUsdAmount: bigint,
      maxUpfrontFee: bigint
    ) => {
      const contract = new Contract(
        contractDefs.BorrowerOperations.abi,
        contractDefs.BorrowerOperations.address
      );
      return contract.populate("withdraw_bitusd", [
        troveId,
        bitUsdAmount,
        maxUpfrontFee,
      ]);
    },

    /**
     * Repay BitUSD debt
     */
    repayBitUsd: (troveId: bigint, bitUsdAmount: bigint) => {
      const contract = new Contract(
        contractDefs.BorrowerOperations.abi,
        contractDefs.BorrowerOperations.address
      );
      return contract.populate("repay_bitusd", [troveId, bitUsdAmount]);
    },

    /**
     * Close a trove
     */
    closeTrove: (troveId: bigint) => {
      const contract = new Contract(
        contractDefs.BorrowerOperations.abi,
        contractDefs.BorrowerOperations.address
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
    }) => {
      const contract = new Contract(
        contractDefs.BorrowerOperations.abi,
        contractDefs.BorrowerOperations.address
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

  bitUsd: {
    /**
     * Get BitUSD balance of an account
     */
    balanceOf: (account: string) => {
      // BitUSD has empty ABI, so we'll need to handle this differently
      // For now, return a basic call data structure
      return {
        contractAddress: contractDefs.USDU.address,
        entrypoint: "balanceOf",
        calldata: [account],
      };
    },
    /**
     * Approve spending of BitUSD tokens
     */
    approve: (spender: string, amount: bigint) => {
      // BitUSD has empty ABI, but follows standard ERC20 interface
      return {
        contractAddress: contractDefs.USDU.address,
        entrypoint: "approve",
        calldata: [spender, amount],
      };
    },
  },

  priceFeed: {
    /**
     * Fetch the current BTC price
     */
    fetchPrice: () => {
      const contract = new Contract(
        contractDefs.PriceFeed.abi,
        contractDefs.PriceFeed.address
      );
      return contract.populate("fetch_price", []);
    },

    /**
     * Fetch the redemption price
     */
    fetchRedemptionPrice: () => {
      const contract = new Contract(
        contractDefs.PriceFeed.abi,
        contractDefs.PriceFeed.address
      );
      return contract.populate("fetch_redemption_price", []);
    },
  },

  troveManager: {
    /**
     * Get the latest trove data
     */
    getLatestTroveData: (troveId: bigint) => {
      const contract = new Contract(
        contractDefs.TroveManager.abi,
        contractDefs.TroveManager.address
      );
      return contract.populate("get_latest_trove_data", [troveId]);
    },

    /**
     * Get trove status
     */
    getTroveStatus: (troveId: bigint) => {
      const contract = new Contract(
        contractDefs.TroveManager.abi,
        contractDefs.TroveManager.address
      );
      return contract.populate("get_trove_status", [troveId]);
    },

    /**
     * Get positions owned by an address
     */
    getOwnerToPositions: (owner: string) => {
      const contract = new Contract(
        contractDefs.TroveManager.abi,
        contractDefs.TroveManager.address
      );
      return contract.populate("get_owner_to_positions", [owner]);
    },
  },
};

/**
 * Factory functions to create contract instances with provider
 * Use these when you need to pass a provider for actual calls
 */
export const createContracts = (provider?: any) => ({
  tbtc: new Contract(
    contractDefs.TBTC.abi,
    contractDefs.TBTC.address,
    provider
  ),
  borrowerOperations: new Contract(
    contractDefs.BorrowerOperations.abi,
    contractDefs.BorrowerOperations.address,
    provider
  ),
  // BitUSD has empty ABI - handle separately if needed
  bitUsd: new Contract(
    contractDefs.USDU.abi,
    contractDefs.USDU.address,
    provider
  ),
  priceFeed: new Contract(
    contractDefs.PriceFeed.abi,
    contractDefs.PriceFeed.address,
    provider
  ),
  troveManager: new Contract(
    contractDefs.TroveManager.abi,
    contractDefs.TroveManager.address,
    provider
  ),
});
