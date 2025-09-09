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
      redemptionCount
      redeemedColl
      redeemedDebt
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

// Query for all interest rate brackets
export const ALL_INTEREST_RATE_BRACKETS = graphql(/* GraphQL */ `
  query AllInterestRateBrackets {
    interestratebrackets(
      first: 1000
      where: { totalDebt_gt: 0 }
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
