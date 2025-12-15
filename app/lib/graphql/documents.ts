import { graphql } from "./gql";

// Query for troves where the user is the current borrower (active/redeemed)
export const TROVES_AS_BORROWER = graphql(/* GraphQL */ `
  query TrovesAsBorrower($account: String!, $indexer: String!) {
    troves(
      where: { borrower: $account, status_in: ["active", "redeemed"], _indexer: $indexer }
      orderBy: updatedAt
      orderDirection: desc
    ) {
      id
      troveId
      borrower
      debt
      deposit
      interestRate
      redemptionCount
      redeemedColl
      redeemedDebt
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
  query TrovesAsPreviousOwner($account: String!, $indexer: String!) {
    troves(
      where: { previousOwner: $account, status: "liquidated", _indexer: $indexer }
      orderBy: updatedAt
      orderDirection: desc
    ) {
      id
      troveId
      borrower
      debt
      deposit
      interestRate
      redemptionCount
      redeemedColl
      redeemedDebt
      status
      collateral {
        id
      }
      closedAt
      createdAt
      updatedAt
      mightBeLeveraged
      previousOwner
      liquidationTx
    }
  }
`);

export const TROVE_BY_ID = graphql(/* GraphQL */ `
  query TroveById($id: ID!, $indexer: String!) {
    trove(id: $id, indexer: $indexer) {
      id
      borrower
      closedAt
      createdAt
      mightBeLeveraged
      status
      previousOwner
      redemptionCount
      redeemedColl
      redeemedDebt
      liquidationTx
    }
  }
`);

export const NEXT_OWNER_INDEX_BY_BORROWER = graphql(/* GraphQL */ `
  query NextOwnerIndexesByBorrower($id: ID!, $indexer: String!) {
    borrowerinfo(id: $id, indexer: $indexer) {
      nextOwnerIndexes
    }
  }
`);

// Query for all troves with pagination (for stats page)
export const ALL_TROVES = graphql(/* GraphQL */ `
  query AllTroves(
    $indexer: String!
    $first: Int!
    $skip: Int!
    $status: String
    $orderBy: Trove_orderBy
    $orderDirection: OrderDirection
  ) {
    troves(
      where: { _indexer: $indexer, status: $status }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      troveId
      borrower
      previousOwner
      debt
      deposit
      interestRate
      status
      collateral {
        id
        collIndex
      }
      interestBatch {
        batchManager
        annualInterestRate
      }
      createdAt
      updatedAt
      closedAt
      redeemedColl
      redeemedDebt
      liquidationTx
    }
  }
`);

// Query to count troves for pagination
export const TROVES_COUNT = graphql(/* GraphQL */ `
  query TrovesCount($indexer: String!, $status: String) {
    troves(where: { _indexer: $indexer, status: $status }, first: 1000) {
      id
    }
  }
`);

// Query for troves filtered by borrower address (for search)
export const TROVES_BY_BORROWER = graphql(/* GraphQL */ `
  query TrovesByBorrower(
    $indexer: String!
    $borrower: String!
    $status: String
  ) {
    troves(
      where: { _indexer: $indexer, borrower: $borrower, status: $status }
      first: 100
      orderBy: debt
      orderDirection: desc
    ) {
      id
      troveId
      borrower
      previousOwner
      debt
      deposit
      interestRate
      status
      collateral {
        id
        collIndex
      }
      interestBatch {
        batchManager
        annualInterestRate
      }
      createdAt
      updatedAt
      closedAt
      redeemedColl
      redeemedDebt
      liquidationTx
    }
  }
`);

// Query for troves filtered by previous owner (for liquidated positions search)
export const TROVES_BY_PREVIOUS_OWNER = graphql(/* GraphQL */ `
  query TrovesByPreviousOwner(
    $indexer: String!
    $previousOwner: String!
    $status: String
  ) {
    troves(
      where: { _indexer: $indexer, previousOwner: $previousOwner, status: $status }
      first: 100
      orderBy: debt
      orderDirection: desc
    ) {
      id
      troveId
      borrower
      previousOwner
      debt
      deposit
      interestRate
      status
      collateral {
        id
        collIndex
      }
      interestBatch {
        batchManager
        annualInterestRate
      }
      createdAt
      updatedAt
      closedAt
      redeemedColl
      redeemedDebt
      liquidationTx
    }
  }
`);

// Query for all interest rate brackets
export const ALL_INTEREST_RATE_BRACKETS = graphql(/* GraphQL */ `
  query AllInterestRateBrackets($indexer: String!) {
    interestratebrackets(
      first: 1000
      where: { totalDebt_gt: 0, _indexer: $indexer }
      orderBy: rate
    ) {
      rate
      totalDebt
      sumDebtTimesRateD36
      pendingDebtTimesOneYearD36
      updatedAt
      collateral {
        collIndex
      }
    }
  }
`);
