import { graphql } from "./gql";

// Query for troves where the user is the current borrower (active/redeemed)
export const TROVES_AS_BORROWER = graphql(/* GraphQL */ `
  query TrovesAsBorrower($account: String!) {
    troves(
      where: { borrower: $account, status_in: ["active", "redeemed"] }
      orderBy: updatedAt
      orderDirection: desc
    ) {
      id
      troveId
      borrower
      debt
      deposit
      interestRate
      status
      collateral {
        id
      }
      closedAt
      createdAt
      updatedAt
      mightBeLeveraged
      previousOwner
    }
  }
`);

// Query for troves where the user was the previous owner (liquidated)
export const TROVES_AS_PREVIOUS_OWNER = graphql(/* GraphQL */ `
  query TrovesAsPreviousOwner($account: String!) {
    troves(
      where: { previousOwner: $account, status: "liquidated" }
      orderBy: updatedAt
      orderDirection: desc
    ) {
      id
      troveId
      borrower
      debt
      deposit
      interestRate
      status
      collateral {
        id
      }
      closedAt
      createdAt
      updatedAt
      mightBeLeveraged
      previousOwner
    }
  }
`);

export const GET_TROVE_BY_ID = graphql(/* GraphQL */ `
  query GetTroveById($troveId: ID!) {
    trove(id: $troveId) {
      id
      troveId
      borrower
      debt
      deposit
      interestRate
      status
      interestBatch {
        id
        batchManager
        debt
        coll
      }
      collateral {
        id
      }
    }
  }
`);

export const TROVE_BY_ID = graphql(/* GraphQL */ `
  query TroveById($id: ID!) {
    trove(id: $id) {
      id
      borrower
      closedAt
      createdAt
      mightBeLeveraged
      status
      previousOwner
    }
  }
`);

export const GET_TROVES_BY_COLLATERAL = graphql(/* GraphQL */ `
  query GetTrovesByCollateral($collateralId: ID, $first: Int!, $skip: Int!) {
    troves(
      where: { collateral: $collateralId, status: "active" }
      first: $first
      skip: $skip
      orderBy: debt
      orderDirection: desc
    ) {
      id
      troveId
      borrower
      debt
      deposit
      interestRate
    }
  }
`);

export const GET_ALL_COLLATERALS = graphql(/* GraphQL */ `
  query GetAllCollaterals {
    collaterals {
      id
      collIndex
    }
  }
`);

export const NEXT_OWNER_INDEX_BY_BORROWER = graphql(/* GraphQL */ `
  query NextOwnerIndexesByBorrower($id: ID!) {
    borrowerinfo(id: $id) {
      nextOwnerIndexes
    }
  }
`);
