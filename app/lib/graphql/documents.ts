import { graphql } from './gql';

export const GET_OWNER_POSITIONS = graphql(/* GraphQL */ `
  query GetOwnerPositions($owner: String!) {
    troves(where: { borrower: $owner }) {
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
      createdAt
      updatedAt
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