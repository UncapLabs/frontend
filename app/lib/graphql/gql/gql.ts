/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query TrovesAsBorrower($account: String!) {\n    troves(\n      where: { borrower: $account, status_in: [\"active\", \"redeemed\"] }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n": typeof types.TrovesAsBorrowerDocument,
    "\n  query TrovesAsPreviousOwner($account: String!) {\n    troves(\n      where: { previousOwner: $account, status: \"liquidated\" }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n": typeof types.TrovesAsPreviousOwnerDocument,
    "\n  query GetTroveById($troveId: ID!) {\n    trove(id: $troveId) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      status\n      interestBatch {\n        id\n        batchManager\n        debt\n        coll\n      }\n      collateral {\n        id\n      }\n    }\n  }\n": typeof types.GetTroveByIdDocument,
    "\n  query TroveById($id: ID!) {\n    trove(id: $id) {\n      id\n      borrower\n      closedAt\n      createdAt\n      mightBeLeveraged\n      status\n      previousOwner\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n    }\n  }\n": typeof types.TroveByIdDocument,
    "\n  query GetTrovesByCollateral($collateralId: ID, $first: Int!, $skip: Int!) {\n    troves(\n      where: { collateral: $collateralId, status: \"active\" }\n      first: $first\n      skip: $skip\n      orderBy: debt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n    }\n  }\n": typeof types.GetTrovesByCollateralDocument,
    "\n  query GetAllCollaterals {\n    collaterals {\n      id\n      collIndex\n    }\n  }\n": typeof types.GetAllCollateralsDocument,
    "\n  query NextOwnerIndexesByBorrower($id: ID!) {\n    borrowerinfo(id: $id) {\n      nextOwnerIndexes\n    }\n  }\n": typeof types.NextOwnerIndexesByBorrowerDocument,
};
const documents: Documents = {
    "\n  query TrovesAsBorrower($account: String!) {\n    troves(\n      where: { borrower: $account, status_in: [\"active\", \"redeemed\"] }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n": types.TrovesAsBorrowerDocument,
    "\n  query TrovesAsPreviousOwner($account: String!) {\n    troves(\n      where: { previousOwner: $account, status: \"liquidated\" }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n": types.TrovesAsPreviousOwnerDocument,
    "\n  query GetTroveById($troveId: ID!) {\n    trove(id: $troveId) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      status\n      interestBatch {\n        id\n        batchManager\n        debt\n        coll\n      }\n      collateral {\n        id\n      }\n    }\n  }\n": types.GetTroveByIdDocument,
    "\n  query TroveById($id: ID!) {\n    trove(id: $id) {\n      id\n      borrower\n      closedAt\n      createdAt\n      mightBeLeveraged\n      status\n      previousOwner\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n    }\n  }\n": types.TroveByIdDocument,
    "\n  query GetTrovesByCollateral($collateralId: ID, $first: Int!, $skip: Int!) {\n    troves(\n      where: { collateral: $collateralId, status: \"active\" }\n      first: $first\n      skip: $skip\n      orderBy: debt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n    }\n  }\n": types.GetTrovesByCollateralDocument,
    "\n  query GetAllCollaterals {\n    collaterals {\n      id\n      collIndex\n    }\n  }\n": types.GetAllCollateralsDocument,
    "\n  query NextOwnerIndexesByBorrower($id: ID!) {\n    borrowerinfo(id: $id) {\n      nextOwnerIndexes\n    }\n  }\n": types.NextOwnerIndexesByBorrowerDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TrovesAsBorrower($account: String!) {\n    troves(\n      where: { borrower: $account, status_in: [\"active\", \"redeemed\"] }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n"): (typeof documents)["\n  query TrovesAsBorrower($account: String!) {\n    troves(\n      where: { borrower: $account, status_in: [\"active\", \"redeemed\"] }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TrovesAsPreviousOwner($account: String!) {\n    troves(\n      where: { previousOwner: $account, status: \"liquidated\" }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n"): (typeof documents)["\n  query TrovesAsPreviousOwner($account: String!) {\n    troves(\n      where: { previousOwner: $account, status: \"liquidated\" }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetTroveById($troveId: ID!) {\n    trove(id: $troveId) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      status\n      interestBatch {\n        id\n        batchManager\n        debt\n        coll\n      }\n      collateral {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetTroveById($troveId: ID!) {\n    trove(id: $troveId) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      status\n      interestBatch {\n        id\n        batchManager\n        debt\n        coll\n      }\n      collateral {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TroveById($id: ID!) {\n    trove(id: $id) {\n      id\n      borrower\n      closedAt\n      createdAt\n      mightBeLeveraged\n      status\n      previousOwner\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n    }\n  }\n"): (typeof documents)["\n  query TroveById($id: ID!) {\n    trove(id: $id) {\n      id\n      borrower\n      closedAt\n      createdAt\n      mightBeLeveraged\n      status\n      previousOwner\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetTrovesByCollateral($collateralId: ID, $first: Int!, $skip: Int!) {\n    troves(\n      where: { collateral: $collateralId, status: \"active\" }\n      first: $first\n      skip: $skip\n      orderBy: debt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n    }\n  }\n"): (typeof documents)["\n  query GetTrovesByCollateral($collateralId: ID, $first: Int!, $skip: Int!) {\n    troves(\n      where: { collateral: $collateralId, status: \"active\" }\n      first: $first\n      skip: $skip\n      orderBy: debt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetAllCollaterals {\n    collaterals {\n      id\n      collIndex\n    }\n  }\n"): (typeof documents)["\n  query GetAllCollaterals {\n    collaterals {\n      id\n      collIndex\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query NextOwnerIndexesByBorrower($id: ID!) {\n    borrowerinfo(id: $id) {\n      nextOwnerIndexes\n    }\n  }\n"): (typeof documents)["\n  query NextOwnerIndexesByBorrower($id: ID!) {\n    borrowerinfo(id: $id) {\n      nextOwnerIndexes\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;