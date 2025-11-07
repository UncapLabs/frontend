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
    "\n  query TrovesAsBorrower($account: String!, $indexer: String!) {\n    troves(\n      where: { borrower: $account, status_in: [\"active\", \"redeemed\"], _indexer: $indexer }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n": typeof types.TrovesAsBorrowerDocument,
    "\n  query TrovesAsPreviousOwner($account: String!, $indexer: String!) {\n    troves(\n      where: { previousOwner: $account, status: \"liquidated\", _indexer: $indexer }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n      liquidationTx\n    }\n  }\n": typeof types.TrovesAsPreviousOwnerDocument,
    "\n  query TroveById($id: ID!, $indexer: String!) {\n    trove(id: $id, indexer: $indexer) {\n      id\n      borrower\n      closedAt\n      createdAt\n      mightBeLeveraged\n      status\n      previousOwner\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      liquidationTx\n    }\n  }\n": typeof types.TroveByIdDocument,
    "\n  query NextOwnerIndexesByBorrower($id: ID!, $indexer: String!) {\n    borrowerinfo(id: $id, indexer: $indexer) {\n      nextOwnerIndexes\n    }\n  }\n": typeof types.NextOwnerIndexesByBorrowerDocument,
    "\n  query AllInterestRateBrackets($indexer: String!) {\n    interestratebrackets(\n      first: 1000\n      where: { totalDebt_gt: 0, _indexer: $indexer }\n      orderBy: rate\n    ) {\n      rate\n      totalDebt\n      sumDebtTimesRateD36\n      pendingDebtTimesOneYearD36\n      updatedAt\n      collateral {\n        collIndex\n      }\n    }\n  }\n": typeof types.AllInterestRateBracketsDocument,
};
const documents: Documents = {
    "\n  query TrovesAsBorrower($account: String!, $indexer: String!) {\n    troves(\n      where: { borrower: $account, status_in: [\"active\", \"redeemed\"], _indexer: $indexer }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n": types.TrovesAsBorrowerDocument,
    "\n  query TrovesAsPreviousOwner($account: String!, $indexer: String!) {\n    troves(\n      where: { previousOwner: $account, status: \"liquidated\", _indexer: $indexer }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n      liquidationTx\n    }\n  }\n": types.TrovesAsPreviousOwnerDocument,
    "\n  query TroveById($id: ID!, $indexer: String!) {\n    trove(id: $id, indexer: $indexer) {\n      id\n      borrower\n      closedAt\n      createdAt\n      mightBeLeveraged\n      status\n      previousOwner\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      liquidationTx\n    }\n  }\n": types.TroveByIdDocument,
    "\n  query NextOwnerIndexesByBorrower($id: ID!, $indexer: String!) {\n    borrowerinfo(id: $id, indexer: $indexer) {\n      nextOwnerIndexes\n    }\n  }\n": types.NextOwnerIndexesByBorrowerDocument,
    "\n  query AllInterestRateBrackets($indexer: String!) {\n    interestratebrackets(\n      first: 1000\n      where: { totalDebt_gt: 0, _indexer: $indexer }\n      orderBy: rate\n    ) {\n      rate\n      totalDebt\n      sumDebtTimesRateD36\n      pendingDebtTimesOneYearD36\n      updatedAt\n      collateral {\n        collIndex\n      }\n    }\n  }\n": types.AllInterestRateBracketsDocument,
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
export function graphql(source: "\n  query TrovesAsBorrower($account: String!, $indexer: String!) {\n    troves(\n      where: { borrower: $account, status_in: [\"active\", \"redeemed\"], _indexer: $indexer }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n"): (typeof documents)["\n  query TrovesAsBorrower($account: String!, $indexer: String!) {\n    troves(\n      where: { borrower: $account, status_in: [\"active\", \"redeemed\"], _indexer: $indexer }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TrovesAsPreviousOwner($account: String!, $indexer: String!) {\n    troves(\n      where: { previousOwner: $account, status: \"liquidated\", _indexer: $indexer }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n      liquidationTx\n    }\n  }\n"): (typeof documents)["\n  query TrovesAsPreviousOwner($account: String!, $indexer: String!) {\n    troves(\n      where: { previousOwner: $account, status: \"liquidated\", _indexer: $indexer }\n      orderBy: updatedAt\n      orderDirection: desc\n    ) {\n      id\n      troveId\n      borrower\n      debt\n      deposit\n      interestRate\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      status\n      collateral {\n        id\n      }\n      closedAt\n      createdAt\n      updatedAt\n      mightBeLeveraged\n      previousOwner\n      liquidationTx\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TroveById($id: ID!, $indexer: String!) {\n    trove(id: $id, indexer: $indexer) {\n      id\n      borrower\n      closedAt\n      createdAt\n      mightBeLeveraged\n      status\n      previousOwner\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      liquidationTx\n    }\n  }\n"): (typeof documents)["\n  query TroveById($id: ID!, $indexer: String!) {\n    trove(id: $id, indexer: $indexer) {\n      id\n      borrower\n      closedAt\n      createdAt\n      mightBeLeveraged\n      status\n      previousOwner\n      redemptionCount\n      redeemedColl\n      redeemedDebt\n      liquidationTx\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query NextOwnerIndexesByBorrower($id: ID!, $indexer: String!) {\n    borrowerinfo(id: $id, indexer: $indexer) {\n      nextOwnerIndexes\n    }\n  }\n"): (typeof documents)["\n  query NextOwnerIndexesByBorrower($id: ID!, $indexer: String!) {\n    borrowerinfo(id: $id, indexer: $indexer) {\n      nextOwnerIndexes\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AllInterestRateBrackets($indexer: String!) {\n    interestratebrackets(\n      first: 1000\n      where: { totalDebt_gt: 0, _indexer: $indexer }\n      orderBy: rate\n    ) {\n      rate\n      totalDebt\n      sumDebtTimesRateD36\n      pendingDebtTimesOneYearD36\n      updatedAt\n      collateral {\n        collIndex\n      }\n    }\n  }\n"): (typeof documents)["\n  query AllInterestRateBrackets($indexer: String!) {\n    interestratebrackets(\n      first: 1000\n      where: { totalDebt_gt: 0, _indexer: $indexer }\n      orderBy: rate\n    ) {\n      rate\n      totalDebt\n      sumDebtTimesRateD36\n      pendingDebtTimesOneYearD36\n      updatedAt\n      collateral {\n        collIndex\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;