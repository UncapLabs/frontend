/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimalU256: { input: any; output: any; }
};

export type BorrowerInfo = {
  __typename?: 'BorrowerInfo';
  _indexer: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  nextOwnerIndexes: Array<Scalars['Int']['output']>;
  troves: Scalars['Int']['output'];
  trovesByCollateral: Array<Scalars['Int']['output']>;
};

export type BorrowerInfo_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  troves?: InputMaybe<Scalars['Int']['input']>;
  troves_gt?: InputMaybe<Scalars['Int']['input']>;
  troves_gte?: InputMaybe<Scalars['Int']['input']>;
  troves_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  troves_lt?: InputMaybe<Scalars['Int']['input']>;
  troves_lte?: InputMaybe<Scalars['Int']['input']>;
  troves_not?: InputMaybe<Scalars['Int']['input']>;
  troves_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export enum BorrowerInfo_OrderBy {
  Indexer = '_indexer',
  Id = 'id',
  Troves = 'troves'
}

export type Collateral = {
  __typename?: 'Collateral';
  _indexer: Scalars['String']['output'];
  addresses: CollateralAddresses;
  collIndex: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  minCollRatio: Scalars['BigDecimalU256']['output'];
  troves: Array<Trove>;
};

export type CollateralAddresses = {
  __typename?: 'CollateralAddresses';
  _indexer: Scalars['String']['output'];
  borrowerOperations: Scalars['String']['output'];
  collateral: Collateral;
  id: Scalars['ID']['output'];
  liquidationManager: Scalars['String']['output'];
  redemptionManager: Scalars['String']['output'];
  sortedTroves: Scalars['String']['output'];
  stabilityPool: Scalars['String']['output'];
  token: Scalars['String']['output'];
  troveManager: Scalars['String']['output'];
  troveManagerEventsEmitter: Scalars['String']['output'];
  troveNft: Scalars['String']['output'];
};

export type CollateralAddresses_Collateral_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  addresses?: InputMaybe<Scalars['ID']['input']>;
  addresses_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  addresses_not?: InputMaybe<Scalars['ID']['input']>;
  addresses_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  collIndex?: InputMaybe<Scalars['Int']['input']>;
  collIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  collIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  collIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  collIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  collIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  collIndex_not?: InputMaybe<Scalars['Int']['input']>;
  collIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  minCollRatio?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  minCollRatio_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export type CollateralAddresses_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  borrowerOperations?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_contains?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  borrowerOperations_not?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_not_contains?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  collateral?: InputMaybe<Scalars['ID']['input']>;
  collateral_?: InputMaybe<CollateralAddresses_Collateral_Filter>;
  collateral_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  collateral_not?: InputMaybe<Scalars['ID']['input']>;
  collateral_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  liquidationManager?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_contains?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  liquidationManager_not?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_not_contains?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  redemptionManager?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_contains?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  redemptionManager_not?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_not_contains?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sortedTroves?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_contains?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sortedTroves_not?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_not_contains?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stabilityPool?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_contains?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stabilityPool_not?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_not_contains?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveManager?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_contains?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveManagerEventsEmitter_not?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_not_contains?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveManager_contains?: InputMaybe<Scalars['String']['input']>;
  troveManager_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveManager_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveManager_not?: InputMaybe<Scalars['String']['input']>;
  troveManager_not_contains?: InputMaybe<Scalars['String']['input']>;
  troveManager_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveManager_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveNft?: InputMaybe<Scalars['String']['input']>;
  troveNft_contains?: InputMaybe<Scalars['String']['input']>;
  troveNft_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveNft_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveNft_not?: InputMaybe<Scalars['String']['input']>;
  troveNft_not_contains?: InputMaybe<Scalars['String']['input']>;
  troveNft_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveNft_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum CollateralAddresses_OrderBy {
  Indexer = '_indexer',
  BorrowerOperations = 'borrowerOperations',
  Collateral = 'collateral',
  Id = 'id',
  LiquidationManager = 'liquidationManager',
  RedemptionManager = 'redemptionManager',
  SortedTroves = 'sortedTroves',
  StabilityPool = 'stabilityPool',
  Token = 'token',
  TroveManager = 'troveManager',
  TroveManagerEventsEmitter = 'troveManagerEventsEmitter',
  TroveNft = 'troveNft'
}

export type Collateral_CollateralAddresses_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  borrowerOperations?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_contains?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  borrowerOperations_not?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_not_contains?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  borrowerOperations_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  collateral?: InputMaybe<Scalars['ID']['input']>;
  collateral_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  collateral_not?: InputMaybe<Scalars['ID']['input']>;
  collateral_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  liquidationManager?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_contains?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  liquidationManager_not?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_not_contains?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  liquidationManager_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  redemptionManager?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_contains?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  redemptionManager_not?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_not_contains?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  redemptionManager_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sortedTroves?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_contains?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sortedTroves_not?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_not_contains?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  sortedTroves_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stabilityPool?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_contains?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stabilityPool_not?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_not_contains?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stabilityPool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveManager?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_contains?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveManagerEventsEmitter_not?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_not_contains?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveManagerEventsEmitter_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveManager_contains?: InputMaybe<Scalars['String']['input']>;
  troveManager_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveManager_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveManager_not?: InputMaybe<Scalars['String']['input']>;
  troveManager_not_contains?: InputMaybe<Scalars['String']['input']>;
  troveManager_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveManager_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveNft?: InputMaybe<Scalars['String']['input']>;
  troveNft_contains?: InputMaybe<Scalars['String']['input']>;
  troveNft_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveNft_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveNft_not?: InputMaybe<Scalars['String']['input']>;
  troveNft_not_contains?: InputMaybe<Scalars['String']['input']>;
  troveNft_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveNft_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type Collateral_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  addresses?: InputMaybe<Scalars['ID']['input']>;
  addresses_?: InputMaybe<Collateral_CollateralAddresses_Filter>;
  addresses_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  addresses_not?: InputMaybe<Scalars['ID']['input']>;
  addresses_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  collIndex?: InputMaybe<Scalars['Int']['input']>;
  collIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  collIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  collIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  collIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  collIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  collIndex_not?: InputMaybe<Scalars['Int']['input']>;
  collIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  minCollRatio?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  minCollRatio_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export enum Collateral_OrderBy {
  Indexer = '_indexer',
  Addresses = 'addresses',
  CollIndex = 'collIndex',
  Id = 'id',
  MinCollRatio = 'minCollRatio'
}

export type EkuboPosition = {
  __typename?: 'EkuboPosition';
  _indexer: Scalars['String']['output'];
  earningRate: Scalars['BigDecimalU256']['output'];
  id: Scalars['ID']['output'];
  lastUpdateTime: Scalars['Int']['output'];
  pointsEarned: Scalars['BigDecimalU256']['output'];
  pool: Scalars['String']['output'];
  poolAddress: Scalars['String']['output'];
  user: User;
  value: Scalars['BigDecimalU256']['output'];
};

export type EkuboPosition_User_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lastUpdateTime?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lastUpdateTime_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalPoints?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalPoints_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalRate?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalRate_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalValue?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalValue_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export type EkuboPosition_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  earningRate?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  earningRate_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lastUpdateTime?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lastUpdateTime_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  pointsEarned?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  pointsEarned_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  poolAddress?: InputMaybe<Scalars['String']['input']>;
  poolAddress_contains?: InputMaybe<Scalars['String']['input']>;
  poolAddress_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  poolAddress_not?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  user?: InputMaybe<Scalars['ID']['input']>;
  user_?: InputMaybe<EkuboPosition_User_Filter>;
  user_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  user_not?: InputMaybe<Scalars['ID']['input']>;
  user_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  value?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  value_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export enum EkuboPosition_OrderBy {
  Indexer = '_indexer',
  EarningRate = 'earningRate',
  Id = 'id',
  LastUpdateTime = 'lastUpdateTime',
  PointsEarned = 'pointsEarned',
  Pool = 'pool',
  PoolAddress = 'poolAddress',
  User = 'user',
  Value = 'value'
}

export type InterestBatch = {
  __typename?: 'InterestBatch';
  _indexer: Scalars['String']['output'];
  annualInterestRate: Scalars['BigDecimalU256']['output'];
  annualManagementFee: Scalars['BigDecimalU256']['output'];
  batchManager: Scalars['String']['output'];
  coll: Scalars['BigDecimalU256']['output'];
  collateral: Collateral;
  debt: Scalars['BigDecimalU256']['output'];
  id: Scalars['ID']['output'];
  troves: Array<Trove>;
  updatedAt: Scalars['Int']['output'];
};

export type InterestBatch_Collateral_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  addresses?: InputMaybe<Scalars['ID']['input']>;
  addresses_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  addresses_not?: InputMaybe<Scalars['ID']['input']>;
  addresses_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  collIndex?: InputMaybe<Scalars['Int']['input']>;
  collIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  collIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  collIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  collIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  collIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  collIndex_not?: InputMaybe<Scalars['Int']['input']>;
  collIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  minCollRatio?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  minCollRatio_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export type InterestBatch_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  annualInterestRate?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  annualInterestRate_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  annualManagementFee?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  annualManagementFee_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  batchManager?: InputMaybe<Scalars['String']['input']>;
  batchManager_contains?: InputMaybe<Scalars['String']['input']>;
  batchManager_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  batchManager_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  batchManager_not?: InputMaybe<Scalars['String']['input']>;
  batchManager_not_contains?: InputMaybe<Scalars['String']['input']>;
  batchManager_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  batchManager_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  coll?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  coll_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  collateral?: InputMaybe<Scalars['ID']['input']>;
  collateral_?: InputMaybe<InterestBatch_Collateral_Filter>;
  collateral_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  collateral_not?: InputMaybe<Scalars['ID']['input']>;
  collateral_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  debt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  debt_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  updatedAt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_gt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_gte?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  updatedAt_lt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_lte?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_not?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export enum InterestBatch_OrderBy {
  Indexer = '_indexer',
  AnnualInterestRate = 'annualInterestRate',
  AnnualManagementFee = 'annualManagementFee',
  BatchManager = 'batchManager',
  Coll = 'coll',
  Collateral = 'collateral',
  Debt = 'debt',
  Id = 'id',
  UpdatedAt = 'updatedAt'
}

export type InterestRateBracket = {
  __typename?: 'InterestRateBracket';
  _indexer: Scalars['String']['output'];
  collateral: Collateral;
  id: Scalars['ID']['output'];
  pendingDebtTimesOneYearD36: Scalars['BigDecimalU256']['output'];
  rate: Scalars['BigDecimalU256']['output'];
  sumDebtTimesRateD36: Scalars['BigDecimalU256']['output'];
  totalDebt: Scalars['BigDecimalU256']['output'];
  updatedAt: Scalars['Int']['output'];
};

export type InterestRateBracket_Collateral_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  addresses?: InputMaybe<Scalars['ID']['input']>;
  addresses_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  addresses_not?: InputMaybe<Scalars['ID']['input']>;
  addresses_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  collIndex?: InputMaybe<Scalars['Int']['input']>;
  collIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  collIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  collIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  collIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  collIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  collIndex_not?: InputMaybe<Scalars['Int']['input']>;
  collIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  minCollRatio?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  minCollRatio_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export type InterestRateBracket_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  collateral?: InputMaybe<Scalars['ID']['input']>;
  collateral_?: InputMaybe<InterestRateBracket_Collateral_Filter>;
  collateral_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  collateral_not?: InputMaybe<Scalars['ID']['input']>;
  collateral_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  pendingDebtTimesOneYearD36?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pendingDebtTimesOneYearD36_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pendingDebtTimesOneYearD36_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pendingDebtTimesOneYearD36_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  pendingDebtTimesOneYearD36_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pendingDebtTimesOneYearD36_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pendingDebtTimesOneYearD36_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pendingDebtTimesOneYearD36_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  rate?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  rate_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  rate_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  rate_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  rate_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  rate_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  rate_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  rate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  sumDebtTimesRateD36?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  sumDebtTimesRateD36_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  sumDebtTimesRateD36_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  sumDebtTimesRateD36_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  sumDebtTimesRateD36_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  sumDebtTimesRateD36_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  sumDebtTimesRateD36_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  sumDebtTimesRateD36_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalDebt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalDebt_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalDebt_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalDebt_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalDebt_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalDebt_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalDebt_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalDebt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  updatedAt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_gt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_gte?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  updatedAt_lt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_lte?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_not?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export enum InterestRateBracket_OrderBy {
  Indexer = '_indexer',
  Collateral = 'collateral',
  Id = 'id',
  PendingDebtTimesOneYearD36 = 'pendingDebtTimesOneYearD36',
  Rate = 'rate',
  SumDebtTimesRateD36 = 'sumDebtTimesRateD36',
  TotalDebt = 'totalDebt',
  UpdatedAt = 'updatedAt'
}

export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  _checkpoint?: Maybe<_Checkpoint>;
  _checkpoints: Array<_Checkpoint>;
  _metadata?: Maybe<_Metadata>;
  _metadatas: Array<_Metadata>;
  borrowerinfo?: Maybe<BorrowerInfo>;
  borrowerinfos: Array<BorrowerInfo>;
  collateral?: Maybe<Collateral>;
  collateraladdresses: Array<CollateralAddresses>;
  collaterals: Array<Collateral>;
  ekuboposition?: Maybe<EkuboPosition>;
  ekubopositions: Array<EkuboPosition>;
  interestbatch?: Maybe<InterestBatch>;
  interestbatches: Array<InterestBatch>;
  interestratebracket?: Maybe<InterestRateBracket>;
  interestratebrackets: Array<InterestRateBracket>;
  stabilitypoolposition?: Maybe<StabilityPoolPosition>;
  stabilitypoolpositions: Array<StabilityPoolPosition>;
  trove?: Maybe<Trove>;
  trovemanagereventsemitter?: Maybe<TroveManagerEventsEmitter>;
  trovemanagereventsemitters: Array<TroveManagerEventsEmitter>;
  trovenft?: Maybe<TroveNft>;
  trovenfts: Array<TroveNft>;
  troves: Array<Trove>;
  user?: Maybe<User>;
  users: Array<User>;
  vesuposition?: Maybe<VesuPosition>;
  vesupositions: Array<VesuPosition>;
};


export type Query_CheckpointArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type Query_CheckpointsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<_Checkpoint_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<_Checkpoint_Filter>;
};


export type Query_MetadataArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type Query_MetadatasArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<_Metadata_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<_Metadata_Filter>;
};


export type QueryBorrowerinfoArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBorrowerinfosArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<BorrowerInfo_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<BorrowerInfo_Filter>;
};


export type QueryCollateralArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCollateraladdressesArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<CollateralAddresses_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<CollateralAddresses_Filter>;
};


export type QueryCollateralsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Collateral_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Collateral_Filter>;
};


export type QueryEkubopositionArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEkubopositionsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<EkuboPosition_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<EkuboPosition_Filter>;
};


export type QueryInterestbatchArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryInterestbatchesArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<InterestBatch_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<InterestBatch_Filter>;
};


export type QueryInterestratebracketArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryInterestratebracketsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<InterestRateBracket_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<InterestRateBracket_Filter>;
};


export type QueryStabilitypoolpositionArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStabilitypoolpositionsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<StabilityPoolPosition_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<StabilityPoolPosition_Filter>;
};


export type QueryTroveArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTrovemanagereventsemitterArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTrovemanagereventsemittersArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<TroveManagerEventsEmitter_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TroveManagerEventsEmitter_Filter>;
};


export type QueryTrovenftArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTrovenftsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<TroveNft_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TroveNft_Filter>;
};


export type QueryTrovesArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<Trove_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<Trove_Filter>;
};


export type QueryUserArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUsersArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<User_Filter>;
};


export type QueryVesupositionArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  indexer?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVesupositionsArgs = {
  block?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<VesuPosition_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<VesuPosition_Filter>;
};

export type StabilityPoolPosition = {
  __typename?: 'StabilityPoolPosition';
  _indexer: Scalars['String']['output'];
  earningRate: Scalars['BigDecimalU256']['output'];
  id: Scalars['ID']['output'];
  lastUpdateTime: Scalars['Int']['output'];
  pointsEarned: Scalars['BigDecimalU256']['output'];
  poolAddress: Scalars['String']['output'];
  stashedColl: Scalars['BigDecimalU256']['output'];
  user: User;
  value: Scalars['BigDecimalU256']['output'];
};

export type StabilityPoolPosition_User_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lastUpdateTime?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lastUpdateTime_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalPoints?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalPoints_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalRate?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalRate_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalValue?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalValue_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export type StabilityPoolPosition_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  earningRate?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  earningRate_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lastUpdateTime?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lastUpdateTime_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  pointsEarned?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  pointsEarned_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  poolAddress?: InputMaybe<Scalars['String']['input']>;
  poolAddress_contains?: InputMaybe<Scalars['String']['input']>;
  poolAddress_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  poolAddress_not?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  poolAddress_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stashedColl?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stashedColl_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stashedColl_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stashedColl_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  stashedColl_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stashedColl_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stashedColl_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stashedColl_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  user?: InputMaybe<Scalars['ID']['input']>;
  user_?: InputMaybe<StabilityPoolPosition_User_Filter>;
  user_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  user_not?: InputMaybe<Scalars['ID']['input']>;
  user_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  value?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  value_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export enum StabilityPoolPosition_OrderBy {
  Indexer = '_indexer',
  EarningRate = 'earningRate',
  Id = 'id',
  LastUpdateTime = 'lastUpdateTime',
  PointsEarned = 'pointsEarned',
  PoolAddress = 'poolAddress',
  StashedColl = 'stashedColl',
  User = 'user',
  Value = 'value'
}

export type Trove = {
  __typename?: 'Trove';
  _indexer: Scalars['String']['output'];
  borrower: Scalars['String']['output'];
  closedAt?: Maybe<Scalars['Int']['output']>;
  collateral: Collateral;
  createdAt: Scalars['Int']['output'];
  debt: Scalars['BigDecimalU256']['output'];
  deposit: Scalars['BigDecimalU256']['output'];
  id: Scalars['ID']['output'];
  interestBatch?: Maybe<InterestBatch>;
  interestRate: Scalars['BigDecimalU256']['output'];
  lastUserActionAt: Scalars['Int']['output'];
  liquidationTx?: Maybe<Scalars['String']['output']>;
  mightBeLeveraged: Scalars['Boolean']['output'];
  previousOwner: Scalars['String']['output'];
  redeemedColl: Scalars['BigDecimalU256']['output'];
  redeemedDebt: Scalars['BigDecimalU256']['output'];
  redemptionCount: Scalars['Int']['output'];
  stake: Scalars['BigDecimalU256']['output'];
  status: Scalars['String']['output'];
  troveId: Scalars['String']['output'];
  updatedAt: Scalars['Int']['output'];
};

export type TroveManagerEventsEmitter = {
  __typename?: 'TroveManagerEventsEmitter';
  _indexer: Scalars['String']['output'];
  collId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type TroveManagerEventsEmitter_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  collId?: InputMaybe<Scalars['String']['input']>;
  collId_contains?: InputMaybe<Scalars['String']['input']>;
  collId_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  collId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  collId_not?: InputMaybe<Scalars['String']['input']>;
  collId_not_contains?: InputMaybe<Scalars['String']['input']>;
  collId_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  collId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export enum TroveManagerEventsEmitter_OrderBy {
  Indexer = '_indexer',
  CollId = 'collId',
  Id = 'id'
}

export type TroveNft = {
  __typename?: 'TroveNFT';
  _indexer: Scalars['String']['output'];
  collId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type TroveNft_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  collId?: InputMaybe<Scalars['String']['input']>;
  collId_contains?: InputMaybe<Scalars['String']['input']>;
  collId_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  collId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  collId_not?: InputMaybe<Scalars['String']['input']>;
  collId_not_contains?: InputMaybe<Scalars['String']['input']>;
  collId_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  collId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export enum TroveNft_OrderBy {
  Indexer = '_indexer',
  CollId = 'collId',
  Id = 'id'
}

export type Trove_Collateral_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  addresses?: InputMaybe<Scalars['ID']['input']>;
  addresses_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  addresses_not?: InputMaybe<Scalars['ID']['input']>;
  addresses_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  collIndex?: InputMaybe<Scalars['Int']['input']>;
  collIndex_gt?: InputMaybe<Scalars['Int']['input']>;
  collIndex_gte?: InputMaybe<Scalars['Int']['input']>;
  collIndex_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  collIndex_lt?: InputMaybe<Scalars['Int']['input']>;
  collIndex_lte?: InputMaybe<Scalars['Int']['input']>;
  collIndex_not?: InputMaybe<Scalars['Int']['input']>;
  collIndex_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  minCollRatio?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  minCollRatio_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  minCollRatio_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export type Trove_InterestBatch_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  annualInterestRate?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  annualInterestRate_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualInterestRate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  annualManagementFee?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  annualManagementFee_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  annualManagementFee_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  batchManager?: InputMaybe<Scalars['String']['input']>;
  batchManager_contains?: InputMaybe<Scalars['String']['input']>;
  batchManager_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  batchManager_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  batchManager_not?: InputMaybe<Scalars['String']['input']>;
  batchManager_not_contains?: InputMaybe<Scalars['String']['input']>;
  batchManager_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  batchManager_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  coll?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  coll_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  coll_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  collateral?: InputMaybe<Scalars['ID']['input']>;
  collateral_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  collateral_not?: InputMaybe<Scalars['ID']['input']>;
  collateral_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  debt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  debt_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  updatedAt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_gt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_gte?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  updatedAt_lt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_lte?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_not?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type Trove_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  borrower?: InputMaybe<Scalars['String']['input']>;
  borrower_contains?: InputMaybe<Scalars['String']['input']>;
  borrower_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  borrower_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  borrower_not?: InputMaybe<Scalars['String']['input']>;
  borrower_not_contains?: InputMaybe<Scalars['String']['input']>;
  borrower_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  borrower_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  closedAt?: InputMaybe<Scalars['Int']['input']>;
  closedAt_gt?: InputMaybe<Scalars['Int']['input']>;
  closedAt_gte?: InputMaybe<Scalars['Int']['input']>;
  closedAt_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  closedAt_lt?: InputMaybe<Scalars['Int']['input']>;
  closedAt_lte?: InputMaybe<Scalars['Int']['input']>;
  closedAt_not?: InputMaybe<Scalars['Int']['input']>;
  closedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  collateral?: InputMaybe<Scalars['ID']['input']>;
  collateral_?: InputMaybe<Trove_Collateral_Filter>;
  collateral_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  collateral_not?: InputMaybe<Scalars['ID']['input']>;
  collateral_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  createdAt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_gt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_gte?: InputMaybe<Scalars['Int']['input']>;
  createdAt_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  createdAt_lt?: InputMaybe<Scalars['Int']['input']>;
  createdAt_lte?: InputMaybe<Scalars['Int']['input']>;
  createdAt_not?: InputMaybe<Scalars['Int']['input']>;
  createdAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  debt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  debt_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  debt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  deposit?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  deposit_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  deposit_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  deposit_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  deposit_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  deposit_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  deposit_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  deposit_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  interestBatch?: InputMaybe<Scalars['ID']['input']>;
  interestBatch_?: InputMaybe<Trove_InterestBatch_Filter>;
  interestBatch_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  interestBatch_not?: InputMaybe<Scalars['ID']['input']>;
  interestBatch_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  interestRate?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  interestRate_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  interestRate_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  interestRate_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  interestRate_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  interestRate_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  interestRate_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  interestRate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  lastUserActionAt?: InputMaybe<Scalars['Int']['input']>;
  lastUserActionAt_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUserActionAt_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUserActionAt_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lastUserActionAt_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUserActionAt_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUserActionAt_not?: InputMaybe<Scalars['Int']['input']>;
  lastUserActionAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  liquidationTx?: InputMaybe<Scalars['String']['input']>;
  liquidationTx_contains?: InputMaybe<Scalars['String']['input']>;
  liquidationTx_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  liquidationTx_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  liquidationTx_not?: InputMaybe<Scalars['String']['input']>;
  liquidationTx_not_contains?: InputMaybe<Scalars['String']['input']>;
  liquidationTx_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  liquidationTx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  mightBeLeveraged?: InputMaybe<Scalars['Boolean']['input']>;
  mightBeLeveraged_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  mightBeLeveraged_not?: InputMaybe<Scalars['Boolean']['input']>;
  mightBeLeveraged_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  previousOwner?: InputMaybe<Scalars['String']['input']>;
  previousOwner_contains?: InputMaybe<Scalars['String']['input']>;
  previousOwner_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  previousOwner_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  previousOwner_not?: InputMaybe<Scalars['String']['input']>;
  previousOwner_not_contains?: InputMaybe<Scalars['String']['input']>;
  previousOwner_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  previousOwner_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  redeemedColl?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedColl_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedColl_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedColl_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  redeemedColl_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedColl_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedColl_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedColl_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  redeemedDebt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedDebt_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedDebt_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedDebt_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  redeemedDebt_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedDebt_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedDebt_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  redeemedDebt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  redemptionCount?: InputMaybe<Scalars['Int']['input']>;
  redemptionCount_gt?: InputMaybe<Scalars['Int']['input']>;
  redemptionCount_gte?: InputMaybe<Scalars['Int']['input']>;
  redemptionCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  redemptionCount_lt?: InputMaybe<Scalars['Int']['input']>;
  redemptionCount_lte?: InputMaybe<Scalars['Int']['input']>;
  redemptionCount_not?: InputMaybe<Scalars['Int']['input']>;
  redemptionCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  stake?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stake_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stake_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stake_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  stake_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stake_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stake_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  stake_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  status?: InputMaybe<Scalars['String']['input']>;
  status_contains?: InputMaybe<Scalars['String']['input']>;
  status_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  status_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status_not?: InputMaybe<Scalars['String']['input']>;
  status_not_contains?: InputMaybe<Scalars['String']['input']>;
  status_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  status_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveId?: InputMaybe<Scalars['String']['input']>;
  troveId_contains?: InputMaybe<Scalars['String']['input']>;
  troveId_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  troveId_not?: InputMaybe<Scalars['String']['input']>;
  troveId_not_contains?: InputMaybe<Scalars['String']['input']>;
  troveId_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  troveId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_gt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_gte?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  updatedAt_lt?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_lte?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_not?: InputMaybe<Scalars['Int']['input']>;
  updatedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export enum Trove_OrderBy {
  Indexer = '_indexer',
  Borrower = 'borrower',
  ClosedAt = 'closedAt',
  Collateral = 'collateral',
  CreatedAt = 'createdAt',
  Debt = 'debt',
  Deposit = 'deposit',
  Id = 'id',
  InterestBatch = 'interestBatch',
  InterestRate = 'interestRate',
  LastUserActionAt = 'lastUserActionAt',
  LiquidationTx = 'liquidationTx',
  MightBeLeveraged = 'mightBeLeveraged',
  PreviousOwner = 'previousOwner',
  RedeemedColl = 'redeemedColl',
  RedeemedDebt = 'redeemedDebt',
  RedemptionCount = 'redemptionCount',
  Stake = 'stake',
  Status = 'status',
  TroveId = 'troveId',
  UpdatedAt = 'updatedAt'
}

export type User = {
  __typename?: 'User';
  _indexer: Scalars['String']['output'];
  ekuboPositions: Array<EkuboPosition>;
  id: Scalars['ID']['output'];
  lastUpdateTime: Scalars['Int']['output'];
  stabilityPoolPositions: Array<StabilityPoolPosition>;
  totalPoints: Scalars['BigDecimalU256']['output'];
  totalRate: Scalars['BigDecimalU256']['output'];
  totalValue: Scalars['BigDecimalU256']['output'];
  vesuPositions: Array<VesuPosition>;
};

export type User_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lastUpdateTime?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lastUpdateTime_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalPoints?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalPoints_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalRate?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalRate_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalValue?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalValue_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export enum User_OrderBy {
  Indexer = '_indexer',
  Id = 'id',
  LastUpdateTime = 'lastUpdateTime',
  TotalPoints = 'totalPoints',
  TotalRate = 'totalRate',
  TotalValue = 'totalValue'
}

export type VesuPosition = {
  __typename?: 'VesuPosition';
  _indexer: Scalars['String']['output'];
  earningRate: Scalars['BigDecimalU256']['output'];
  id: Scalars['ID']['output'];
  lastUpdateTime: Scalars['Int']['output'];
  market: Scalars['String']['output'];
  pointsEarned: Scalars['BigDecimalU256']['output'];
  positionType: Scalars['String']['output'];
  user: User;
  value: Scalars['BigDecimalU256']['output'];
};

export type VesuPosition_User_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lastUpdateTime?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lastUpdateTime_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  totalPoints?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalPoints_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalPoints_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalRate?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalRate_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalRate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalValue?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  totalValue_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  totalValue_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export type VesuPosition_Filter = {
  _indexer?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  _indexer_not?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  _indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  earningRate?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  earningRate_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  earningRate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lastUpdateTime?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lastUpdateTime_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTime_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  market?: InputMaybe<Scalars['String']['input']>;
  market_contains?: InputMaybe<Scalars['String']['input']>;
  market_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  market_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  market_not?: InputMaybe<Scalars['String']['input']>;
  market_not_contains?: InputMaybe<Scalars['String']['input']>;
  market_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  market_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  pointsEarned?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  pointsEarned_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  pointsEarned_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  positionType?: InputMaybe<Scalars['String']['input']>;
  positionType_contains?: InputMaybe<Scalars['String']['input']>;
  positionType_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  positionType_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  positionType_not?: InputMaybe<Scalars['String']['input']>;
  positionType_not_contains?: InputMaybe<Scalars['String']['input']>;
  positionType_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  positionType_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  user?: InputMaybe<Scalars['ID']['input']>;
  user_?: InputMaybe<VesuPosition_User_Filter>;
  user_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  user_not?: InputMaybe<Scalars['ID']['input']>;
  user_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  value?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_gt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_gte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
  value_lt?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_lte?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_not?: InputMaybe<Scalars['BigDecimalU256']['input']>;
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigDecimalU256']['input']>>>;
};

export enum VesuPosition_OrderBy {
  Indexer = '_indexer',
  EarningRate = 'earningRate',
  Id = 'id',
  LastUpdateTime = 'lastUpdateTime',
  Market = 'market',
  PointsEarned = 'pointsEarned',
  PositionType = 'positionType',
  User = 'user',
  Value = 'value'
}

/** Contract and Block where its event is found. */
export type _Checkpoint = {
  __typename?: '_Checkpoint';
  block_number: Scalars['Int']['output'];
  contract_address: Scalars['String']['output'];
  /** id computed as last 5 bytes of sha256(contract+block) */
  id: Scalars['ID']['output'];
  indexer: Scalars['String']['output'];
};

export type _Checkpoint_Filter = {
  block_number?: InputMaybe<Scalars['Int']['input']>;
  block_number_gt?: InputMaybe<Scalars['Int']['input']>;
  block_number_gte?: InputMaybe<Scalars['Int']['input']>;
  block_number_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  block_number_lt?: InputMaybe<Scalars['Int']['input']>;
  block_number_lte?: InputMaybe<Scalars['Int']['input']>;
  block_number_not?: InputMaybe<Scalars['Int']['input']>;
  block_number_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  contract_address?: InputMaybe<Scalars['String']['input']>;
  contract_address_contains?: InputMaybe<Scalars['String']['input']>;
  contract_address_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  contract_address_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contract_address_not?: InputMaybe<Scalars['String']['input']>;
  contract_address_not_contains?: InputMaybe<Scalars['String']['input']>;
  contract_address_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  contract_address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  indexer_contains?: InputMaybe<Scalars['String']['input']>;
  indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  indexer_not?: InputMaybe<Scalars['String']['input']>;
  indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum _Checkpoint_OrderBy {
  BlockNumber = 'block_number',
  ContractAddress = 'contract_address',
  Id = 'id',
  Indexer = 'indexer'
}

/** Core metadata values used internally by Checkpoint */
export type _Metadata = {
  __typename?: '_Metadata';
  /** example: last_indexed_block */
  id: Scalars['ID']['output'];
  indexer: Scalars['String']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

export type _Metadata_Filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  indexer?: InputMaybe<Scalars['String']['input']>;
  indexer_contains?: InputMaybe<Scalars['String']['input']>;
  indexer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  indexer_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  indexer_not?: InputMaybe<Scalars['String']['input']>;
  indexer_not_contains?: InputMaybe<Scalars['String']['input']>;
  indexer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  indexer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  value?: InputMaybe<Scalars['String']['input']>;
  value_contains?: InputMaybe<Scalars['String']['input']>;
  value_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  value_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  value_not?: InputMaybe<Scalars['String']['input']>;
  value_not_contains?: InputMaybe<Scalars['String']['input']>;
  value_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum _Metadata_OrderBy {
  Id = 'id',
  Indexer = 'indexer',
  Value = 'value'
}

export type TrovesAsBorrowerQueryVariables = Exact<{
  account: Scalars['String']['input'];
}>;


export type TrovesAsBorrowerQuery = { __typename?: 'Query', troves: Array<{ __typename?: 'Trove', id: string, troveId: string, borrower: string, debt: any, deposit: any, interestRate: any, redemptionCount: number, redeemedColl: any, redeemedDebt: any, status: string, closedAt?: number | null, createdAt: number, updatedAt: number, mightBeLeveraged: boolean, previousOwner: string, collateral: { __typename?: 'Collateral', id: string } }> };

export type TrovesAsPreviousOwnerQueryVariables = Exact<{
  account: Scalars['String']['input'];
}>;


export type TrovesAsPreviousOwnerQuery = { __typename?: 'Query', troves: Array<{ __typename?: 'Trove', id: string, troveId: string, borrower: string, debt: any, deposit: any, interestRate: any, redemptionCount: number, redeemedColl: any, redeemedDebt: any, status: string, closedAt?: number | null, createdAt: number, updatedAt: number, mightBeLeveraged: boolean, previousOwner: string, liquidationTx?: string | null, collateral: { __typename?: 'Collateral', id: string } }> };

export type TroveByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TroveByIdQuery = { __typename?: 'Query', trove?: { __typename?: 'Trove', id: string, borrower: string, closedAt?: number | null, createdAt: number, mightBeLeveraged: boolean, status: string, previousOwner: string, redemptionCount: number, redeemedColl: any, redeemedDebt: any, liquidationTx?: string | null } | null };

export type NextOwnerIndexesByBorrowerQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type NextOwnerIndexesByBorrowerQuery = { __typename?: 'Query', borrowerinfo?: { __typename?: 'BorrowerInfo', nextOwnerIndexes: Array<number> } | null };

export type AllInterestRateBracketsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllInterestRateBracketsQuery = { __typename?: 'Query', interestratebrackets: Array<{ __typename?: 'InterestRateBracket', rate: any, totalDebt: any, sumDebtTimesRateD36: any, pendingDebtTimesOneYearD36: any, updatedAt: number, collateral: { __typename?: 'Collateral', collIndex: number } }> };


export const TrovesAsBorrowerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TrovesAsBorrower"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"account"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"troves"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"borrower"},"value":{"kind":"Variable","name":{"kind":"Name","value":"account"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"status_in"},"value":{"kind":"ListValue","values":[{"kind":"StringValue","value":"active","block":false},{"kind":"StringValue","value":"redeemed","block":false}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"updatedAt"}},{"kind":"Argument","name":{"kind":"Name","value":"orderDirection"},"value":{"kind":"EnumValue","value":"desc"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"troveId"}},{"kind":"Field","name":{"kind":"Name","value":"borrower"}},{"kind":"Field","name":{"kind":"Name","value":"debt"}},{"kind":"Field","name":{"kind":"Name","value":"deposit"}},{"kind":"Field","name":{"kind":"Name","value":"interestRate"}},{"kind":"Field","name":{"kind":"Name","value":"redemptionCount"}},{"kind":"Field","name":{"kind":"Name","value":"redeemedColl"}},{"kind":"Field","name":{"kind":"Name","value":"redeemedDebt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"collateral"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"mightBeLeveraged"}},{"kind":"Field","name":{"kind":"Name","value":"previousOwner"}}]}}]}}]} as unknown as DocumentNode<TrovesAsBorrowerQuery, TrovesAsBorrowerQueryVariables>;
export const TrovesAsPreviousOwnerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TrovesAsPreviousOwner"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"account"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"troves"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"previousOwner"},"value":{"kind":"Variable","name":{"kind":"Name","value":"account"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"StringValue","value":"liquidated","block":false}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"updatedAt"}},{"kind":"Argument","name":{"kind":"Name","value":"orderDirection"},"value":{"kind":"EnumValue","value":"desc"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"troveId"}},{"kind":"Field","name":{"kind":"Name","value":"borrower"}},{"kind":"Field","name":{"kind":"Name","value":"debt"}},{"kind":"Field","name":{"kind":"Name","value":"deposit"}},{"kind":"Field","name":{"kind":"Name","value":"interestRate"}},{"kind":"Field","name":{"kind":"Name","value":"redemptionCount"}},{"kind":"Field","name":{"kind":"Name","value":"redeemedColl"}},{"kind":"Field","name":{"kind":"Name","value":"redeemedDebt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"collateral"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"mightBeLeveraged"}},{"kind":"Field","name":{"kind":"Name","value":"previousOwner"}},{"kind":"Field","name":{"kind":"Name","value":"liquidationTx"}}]}}]}}]} as unknown as DocumentNode<TrovesAsPreviousOwnerQuery, TrovesAsPreviousOwnerQueryVariables>;
export const TroveByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TroveById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"borrower"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"mightBeLeveraged"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOwner"}},{"kind":"Field","name":{"kind":"Name","value":"redemptionCount"}},{"kind":"Field","name":{"kind":"Name","value":"redeemedColl"}},{"kind":"Field","name":{"kind":"Name","value":"redeemedDebt"}},{"kind":"Field","name":{"kind":"Name","value":"liquidationTx"}}]}}]}}]} as unknown as DocumentNode<TroveByIdQuery, TroveByIdQueryVariables>;
export const NextOwnerIndexesByBorrowerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NextOwnerIndexesByBorrower"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"borrowerinfo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nextOwnerIndexes"}}]}}]}}]} as unknown as DocumentNode<NextOwnerIndexesByBorrowerQuery, NextOwnerIndexesByBorrowerQueryVariables>;
export const AllInterestRateBracketsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllInterestRateBrackets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"interestratebrackets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"totalDebt_gt"},"value":{"kind":"IntValue","value":"0"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"rate"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rate"}},{"kind":"Field","name":{"kind":"Name","value":"totalDebt"}},{"kind":"Field","name":{"kind":"Name","value":"sumDebtTimesRateD36"}},{"kind":"Field","name":{"kind":"Name","value":"pendingDebtTimesOneYearD36"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"collateral"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collIndex"}}]}}]}}]}}]} as unknown as DocumentNode<AllInterestRateBracketsQuery, AllInterestRateBracketsQueryVariables>;