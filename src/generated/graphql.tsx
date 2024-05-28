import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AdvanceCollectionFilters = {
  __typename?: 'AdvanceCollectionFilters';
  collection?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  traits?: Maybe<Scalars['String']>;
};

export type AdvanceCollectionFiltersList = {
  __typename?: 'AdvanceCollectionFiltersList';
  nodes?: Maybe<Array<Maybe<AdvanceCollectionFilters>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type Collection = {
  __typename?: 'Collection';
  bannerUrl?: Maybe<Scalars['String']>;
  collectionId?: Maybe<Scalars['String']>;
  creator?: Maybe<Scalars['String']>;
  creatorEmail?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  discord?: Maybe<Scalars['String']>;
  disputedMessage?: Maybe<Scalars['String']>;
  endpoint?: Maybe<Scalars['String']>;
  floorPrice?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['String']>;
  isCurated?: Maybe<Scalars['Boolean']>;
  isDerivative?: Maybe<Scalars['Boolean']>;
  isNsfw?: Maybe<Scalars['Boolean']>;
  mints?: Maybe<Array<Maybe<Scalars['String']>>>;
  name?: Maybe<Scalars['String']>;
  publishedEpoch?: Maybe<Scalars['Int']>;
  soloImage?: Maybe<Scalars['String']>;
  soloUsername?: Maybe<Scalars['String']>;
  soloVerified?: Maybe<Scalars['Boolean']>;
  thumbnail?: Maybe<Scalars['String']>;
  twitter?: Maybe<Scalars['String']>;
  verifeyed?: Maybe<Scalars['Boolean']>;
  volumeLast24h?: Maybe<Scalars['Int']>;
  volumeLastUpdatedAt?: Maybe<Scalars['Int']>;
  volumePast7days?: Maybe<Scalars['Int']>;
  volumePast24h?: Maybe<Scalars['Int']>;
  volumeTotal?: Maybe<Scalars['Int']>;
  walletAddressList?: Maybe<Array<Maybe<Scalars['String']>>>;
  website?: Maybe<Scalars['String']>;
};

export type CollectionList = {
  __typename?: 'CollectionList';
  nodes?: Maybe<Array<Maybe<Collection>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type MintList = {
  __typename?: 'MintList';
  nodes?: Maybe<Array<Maybe<MintMetadata>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type MintMetadata = {
  __typename?: 'MintMetadata';
  collection?: Maybe<Scalars['String']>;
  howrareRank?: Maybe<Scalars['Int']>;
  lastSeenSignature?: Maybe<Scalars['String']>;
  mint?: Maybe<Scalars['String']>;
  moonRank?: Maybe<Scalars['Int']>;
  tags?: Maybe<Scalars['String']>;
};

export type Offer = {
  __typename?: 'Offer';
  addEpoch?: Maybe<Scalars['Int']>;
  bump?: Maybe<Scalars['Int']>;
  collection?: Maybe<Scalars['String']>;
  contract?: Maybe<Scalars['String']>;
  creators?: Maybe<Array<Maybe<Scalars['String']>>>;
  downvotesCount?: Maybe<Scalars['Int']>;
  flagCount?: Maybe<Scalars['Int']>;
  flagged?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  interval?: Maybe<Scalars['Int']>;
  isNsfw?: Maybe<Scalars['Boolean']>;
  is_nft?: Maybe<Scalars['Boolean']>;
  metadata?: Maybe<Scalars['String']>;
  mint?: Maybe<Scalars['String']>;
  nextClockTick?: Maybe<Scalars['Int']>;
  offerName?: Maybe<Scalars['String']>;
  owner?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Float']>;
  priceStep?: Maybe<Scalars['Float']>;
  pubkey?: Maybe<Scalars['String']>;
  reservedPrice?: Maybe<Scalars['Float']>;
  solo?: Maybe<Scalars['Boolean']>;
  soloImage?: Maybe<Scalars['String']>;
  soloUsername?: Maybe<Scalars['String']>;
  soloVerified?: Maybe<Scalars['Boolean']>;
  startingPrice?: Maybe<Scalars['Float']>;
  startingTimestamp?: Maybe<Scalars['Int']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  tallyVotesCount?: Maybe<Scalars['Int']>;
  token?: Maybe<Scalars['String']>;
  upvotesCount?: Maybe<Scalars['Int']>;
  uri?: Maybe<Scalars['String']>;
  verifeyed?: Maybe<Scalars['Boolean']>;
};

export type OfferList = {
  __typename?: 'OfferList';
  nodes?: Maybe<Array<Maybe<Offer>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type Project = {
  __typename?: 'Project';
  AssetsUrl?: Maybe<Scalars['String']>;
  BannerUrl?: Maybe<Scalars['String']>;
  CandyMachineConfig?: Maybe<Scalars['String']>;
  CandyMachineKey?: Maybe<Scalars['String']>;
  CarterUrl?: Maybe<Scalars['String']>;
  Category?: Maybe<Scalars['String']>;
  CollectionId?: Maybe<Scalars['String']>;
  Creator?: Maybe<Scalars['String']>;
  Description?: Maybe<Scalars['String']>;
  Folder?: Maybe<Scalars['String']>;
  HeroSpot?: Maybe<Scalars['Int']>;
  IsEndorsed?: Maybe<Scalars['Boolean']>;
  IsFeatured?: Maybe<Scalars['Boolean']>;
  ItemsAvailable?: Maybe<Scalars['Int']>;
  ItemsRedeemed?: Maybe<Scalars['Int']>;
  MaxWhitelists?: Maybe<Scalars['Int']>;
  Name?: Maybe<Scalars['String']>;
  OwnerWalletKey?: Maybe<Scalars['String']>;
  PresaleDate?: Maybe<Scalars['String']>;
  ProjectState?: Maybe<Scalars['Int']>;
  RequestId?: Maybe<Scalars['String']>;
  Revenue?: Maybe<Scalars['Float']>;
  ThumbnailUrl?: Maybe<Scalars['String']>;
  Uuid?: Maybe<Scalars['String']>;
  WalletKey?: Maybe<Scalars['String']>;
  WhitePaperUrl?: Maybe<Scalars['String']>;
  WhitelistTokenDistributed?: Maybe<Scalars['Int']>;
  Whitelists?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type ProjectList = {
  __typename?: 'ProjectList';
  nodes?: Maybe<Array<Maybe<Project>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type Request = {
  __typename?: 'Request';
  banner_public_url?: Maybe<Scalars['String']>;
  banner_url?: Maybe<Scalars['String']>;
  collection_id?: Maybe<Scalars['String']>;
  collection_tag_list?: Maybe<Array<Maybe<Scalars['String']>>>;
  created_at?: Maybe<Scalars['Int']>;
  creator?: Maybe<Scalars['String']>;
  creator_email?: Maybe<Scalars['String']>;
  creator_notes?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  discord?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['String']>;
  is_preapproval?: Maybe<Scalars['Boolean']>;
  is_preapproved?: Maybe<Scalars['Boolean']>;
  is_user_admin?: Maybe<Scalars['Boolean']>;
  mint_list_url?: Maybe<Array<Maybe<Scalars['String']>>>;
  mint_price?: Maybe<Scalars['Float']>;
  mint_time?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  preapproved?: Maybe<Scalars['Boolean']>;
  rejection_note?: Maybe<Scalars['String']>;
  replace_mint_list?: Maybe<Scalars['Boolean']>;
  request_type?: Maybe<Scalars['String']>;
  special_tag_list?: Maybe<Array<Maybe<Scalars['String']>>>;
  stage?: Maybe<Scalars['String']>;
  supply?: Maybe<Scalars['Int']>;
  thumbnail_public_url?: Maybe<Scalars['String']>;
  thumbnail_url?: Maybe<Scalars['String']>;
  twitter?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['Int']>;
  verifeyed?: Maybe<Scalars['Boolean']>;
  wallet_address_list?: Maybe<Array<Maybe<Scalars['String']>>>;
  website?: Maybe<Scalars['String']>;
};

export type RequestList = {
  __typename?: 'RequestList';
  nodes?: Maybe<Array<Maybe<Request>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type RootQuery = {
  __typename?: 'RootQuery';
  collectionFilters?: Maybe<AdvanceCollectionFiltersList>;
  collections?: Maybe<CollectionList>;
  mints?: Maybe<MintList>;
  offers?: Maybe<OfferList>;
  projects?: Maybe<ProjectList>;
  requests?: Maybe<RequestList>;
  transactions?: Maybe<TransactionList>;
};


export type RootQueryCollectionFiltersArgs = {
  collection?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  keys?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  traits?: InputMaybe<Scalars['String']>;
};


export type RootQueryCollectionsArgs = {
  bannerUrl?: InputMaybe<Scalars['String']>;
  collectionId?: InputMaybe<Scalars['String']>;
  creator?: InputMaybe<Scalars['String']>;
  creatorEmail?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  discord?: InputMaybe<Scalars['String']>;
  disputedMessage?: InputMaybe<Scalars['String']>;
  endpoint?: InputMaybe<Scalars['String']>;
  floorPrice?: InputMaybe<Scalars['Float']>;
  id?: InputMaybe<Scalars['String']>;
  isCurated?: InputMaybe<Scalars['Boolean']>;
  isDerivative?: InputMaybe<Scalars['Boolean']>;
  isNsfw?: InputMaybe<Scalars['Boolean']>;
  keys?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  limit?: InputMaybe<Scalars['Int']>;
  mints?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  name?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  publishedEpoch?: InputMaybe<Scalars['Int']>;
  soloImage?: InputMaybe<Scalars['String']>;
  soloUsername?: InputMaybe<Scalars['String']>;
  soloVerified?: InputMaybe<Scalars['Boolean']>;
  thumbnail?: InputMaybe<Scalars['String']>;
  twitter?: InputMaybe<Scalars['String']>;
  verifeyed?: InputMaybe<Scalars['Boolean']>;
  volumeLast24h?: InputMaybe<Scalars['Int']>;
  volumeLastUpdatedAt?: InputMaybe<Scalars['Int']>;
  volumePast7days?: InputMaybe<Scalars['Int']>;
  volumePast24h?: InputMaybe<Scalars['Int']>;
  volumeTotal?: InputMaybe<Scalars['Int']>;
  walletAddressList?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  website?: InputMaybe<Scalars['String']>;
};


export type RootQueryMintsArgs = {
  collection?: InputMaybe<Scalars['String']>;
  howrareRank?: InputMaybe<Scalars['Int']>;
  keys?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  lastSeenSignature?: InputMaybe<Scalars['String']>;
  limit?: InputMaybe<Scalars['Int']>;
  mint?: InputMaybe<Scalars['String']>;
  moonRank?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Scalars['String']>;
};


export type RootQueryOffersArgs = {
  addEpoch?: InputMaybe<Scalars['Int']>;
  bump?: InputMaybe<Scalars['Int']>;
  collection?: InputMaybe<Scalars['String']>;
  contract?: InputMaybe<Scalars['String']>;
  creators?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  downvotesCount?: InputMaybe<Scalars['Int']>;
  flagCount?: InputMaybe<Scalars['Int']>;
  flagged?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  interval?: InputMaybe<Scalars['Int']>;
  isNsfw?: InputMaybe<Scalars['Boolean']>;
  is_nft?: InputMaybe<Scalars['Boolean']>;
  keys?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  limit?: InputMaybe<Scalars['Int']>;
  metadata?: InputMaybe<Scalars['String']>;
  mint?: InputMaybe<Scalars['String']>;
  nextClockTick?: InputMaybe<Scalars['Int']>;
  offerName?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  owner?: InputMaybe<Scalars['String']>;
  price?: InputMaybe<Scalars['Float']>;
  priceStep?: InputMaybe<Scalars['Float']>;
  pubkey?: InputMaybe<Scalars['String']>;
  reservedPrice?: InputMaybe<Scalars['Float']>;
  solo?: InputMaybe<Scalars['Boolean']>;
  soloImage?: InputMaybe<Scalars['String']>;
  soloUsername?: InputMaybe<Scalars['String']>;
  soloVerified?: InputMaybe<Scalars['Boolean']>;
  startingPrice?: InputMaybe<Scalars['Float']>;
  startingTimestamp?: InputMaybe<Scalars['Int']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  tallyVotesCount?: InputMaybe<Scalars['Int']>;
  token?: InputMaybe<Scalars['String']>;
  upvotesCount?: InputMaybe<Scalars['Int']>;
  uri?: InputMaybe<Scalars['String']>;
  verifeyed?: InputMaybe<Scalars['Boolean']>;
};


export type RootQueryProjectsArgs = {
  AssetsUrl?: InputMaybe<Scalars['String']>;
  BannerUrl?: InputMaybe<Scalars['String']>;
  CandyMachineConfig?: InputMaybe<Scalars['String']>;
  CandyMachineKey?: InputMaybe<Scalars['String']>;
  CarterUrl?: InputMaybe<Scalars['String']>;
  Category?: InputMaybe<Scalars['String']>;
  CollectionId?: InputMaybe<Scalars['String']>;
  Creator?: InputMaybe<Scalars['String']>;
  Description?: InputMaybe<Scalars['String']>;
  Folder?: InputMaybe<Scalars['String']>;
  HeroSpot?: InputMaybe<Scalars['Int']>;
  IsEndorsed?: InputMaybe<Scalars['Boolean']>;
  IsFeatured?: InputMaybe<Scalars['Boolean']>;
  ItemsAvailable?: InputMaybe<Scalars['Int']>;
  ItemsRedeemed?: InputMaybe<Scalars['Int']>;
  MaxWhitelists?: InputMaybe<Scalars['Int']>;
  Name?: InputMaybe<Scalars['String']>;
  OwnerWalletKey?: InputMaybe<Scalars['String']>;
  PresaleDate?: InputMaybe<Scalars['String']>;
  ProjectState?: InputMaybe<Scalars['Int']>;
  RequestId?: InputMaybe<Scalars['String']>;
  Revenue?: InputMaybe<Scalars['Float']>;
  ThumbnailUrl?: InputMaybe<Scalars['String']>;
  Uuid?: InputMaybe<Scalars['String']>;
  WalletKey?: InputMaybe<Scalars['String']>;
  WhitePaperUrl?: InputMaybe<Scalars['String']>;
  WhitelistTokenDistributed?: InputMaybe<Scalars['Int']>;
  Whitelists?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  keys?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
};


export type RootQueryRequestsArgs = {
  banner_public_url?: InputMaybe<Scalars['String']>;
  banner_url?: InputMaybe<Scalars['String']>;
  collection_id?: InputMaybe<Scalars['String']>;
  collection_tag_list?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  created_at?: InputMaybe<Scalars['Int']>;
  creator?: InputMaybe<Scalars['String']>;
  creator_email?: InputMaybe<Scalars['String']>;
  creator_notes?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  discord?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  is_preapproval?: InputMaybe<Scalars['Boolean']>;
  is_preapproved?: InputMaybe<Scalars['Boolean']>;
  is_user_admin?: InputMaybe<Scalars['Boolean']>;
  keys?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  limit?: InputMaybe<Scalars['Int']>;
  mint_list_url?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  mint_price?: InputMaybe<Scalars['Float']>;
  mint_time?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  preapproved?: InputMaybe<Scalars['Boolean']>;
  rejection_note?: InputMaybe<Scalars['String']>;
  replace_mint_list?: InputMaybe<Scalars['Boolean']>;
  request_type?: InputMaybe<Scalars['String']>;
  special_tag_list?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  stage?: InputMaybe<Scalars['String']>;
  supply?: InputMaybe<Scalars['Int']>;
  thumbnail_public_url?: InputMaybe<Scalars['String']>;
  thumbnail_url?: InputMaybe<Scalars['String']>;
  twitter?: InputMaybe<Scalars['String']>;
  updated_at?: InputMaybe<Scalars['Int']>;
  verifeyed?: InputMaybe<Scalars['Boolean']>;
  wallet_address_list?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  website?: InputMaybe<Scalars['String']>;
};


export type RootQueryTransactionsArgs = {
  bump?: InputMaybe<Scalars['Int']>;
  bumpAuthority?: InputMaybe<Scalars['Int']>;
  buyer?: InputMaybe<Scalars['String']>;
  collection?: InputMaybe<Scalars['String']>;
  contract?: InputMaybe<Scalars['String']>;
  epoch?: InputMaybe<Scalars['Int']>;
  estimatedPrice?: InputMaybe<Scalars['Float']>;
  id?: InputMaybe<Scalars['String']>;
  interval?: InputMaybe<Scalars['Int']>;
  keys?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  limit?: InputMaybe<Scalars['Int']>;
  mint?: InputMaybe<Scalars['String']>;
  offer?: InputMaybe<Scalars['String']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Scalars['String']>;
  owner?: InputMaybe<Scalars['String']>;
  price?: InputMaybe<Scalars['Float']>;
  priceStep?: InputMaybe<Scalars['String']>;
  reservedPrice?: InputMaybe<Scalars['String']>;
  salesTaxRecepient?: InputMaybe<Scalars['String']>;
  seller?: InputMaybe<Scalars['String']>;
  startingPrice?: InputMaybe<Scalars['String']>;
  startingTimestamp?: InputMaybe<Scalars['Int']>;
  tags?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<Scalars['String']>;
};

export type Transaction = {
  __typename?: 'Transaction';
  bump?: Maybe<Scalars['Int']>;
  bumpAuthority?: Maybe<Scalars['Int']>;
  buyer?: Maybe<Scalars['String']>;
  collection?: Maybe<Scalars['String']>;
  contract?: Maybe<Scalars['String']>;
  epoch?: Maybe<Scalars['Int']>;
  estimatedPrice?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['String']>;
  interval?: Maybe<Scalars['Int']>;
  mint?: Maybe<Scalars['String']>;
  offer?: Maybe<Scalars['String']>;
  owner?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['Float']>;
  priceStep?: Maybe<Scalars['String']>;
  reservedPrice?: Maybe<Scalars['String']>;
  salesTaxRecepient?: Maybe<Scalars['String']>;
  seller?: Maybe<Scalars['String']>;
  startingPrice?: Maybe<Scalars['String']>;
  startingTimestamp?: Maybe<Scalars['Int']>;
  tags?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type TransactionList = {
  __typename?: 'TransactionList';
  nodes?: Maybe<Array<Maybe<Transaction>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type CollectionFiltersQueryVariables = Exact<{
  collection?: InputMaybe<Scalars['String']>;
}>;


export type CollectionFiltersQuery = { __typename?: 'RootQuery', collectionFilters?: { __typename?: 'AdvanceCollectionFiltersList', totalCount?: number | null, nodes?: Array<{ __typename?: 'AdvanceCollectionFilters', traits?: string | null } | null> | null } | null };

export type ExploreAllCollectionsQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
}>;


export type ExploreAllCollectionsQuery = { __typename?: 'RootQuery', collections?: { __typename?: 'CollectionList', totalCount?: number | null, nodes?: Array<{ __typename?: 'Collection', name?: string | null, verifeyed?: boolean | null, thumbnail?: string | null, isNsfw?: boolean | null, collectionId?: string | null } | null> | null } | null };

export type TopVerifeyedCollectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type TopVerifeyedCollectionsQuery = { __typename?: 'RootQuery', collections?: { __typename?: 'CollectionList', totalCount?: number | null, nodes?: Array<{ __typename?: 'Collection', name?: string | null, verifeyed?: boolean | null, thumbnail?: string | null, isNsfw?: boolean | null } | null> | null } | null };

export type LatestCollectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type LatestCollectionsQuery = { __typename?: 'RootQuery', collections?: { __typename?: 'CollectionList', nodes?: Array<{ __typename?: 'Collection', name?: string | null, verifeyed?: boolean | null, thumbnail?: string | null, isNsfw?: boolean | null } | null> | null } | null };

export type TrendingCollectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type TrendingCollectionsQuery = { __typename?: 'RootQuery', collections?: { __typename?: 'CollectionList', nodes?: Array<{ __typename?: 'Collection', name?: string | null, verifeyed?: boolean | null, thumbnail?: string | null, isNsfw?: boolean | null } | null> | null } | null };

export type WalletSellActivitiesQueryVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
}>;


export type WalletSellActivitiesQuery = { __typename?: 'RootQuery', transactions?: { __typename?: 'TransactionList', totalCount?: number | null, nodes?: Array<{ __typename?: 'Transaction', collection?: string | null, mint?: string | null, price?: number | null, type?: string | null, buyer?: string | null, seller?: string | null, id?: string | null, epoch?: number | null, contract?: string | null, tags?: string | null } | null> | null } | null };

export type WalletBuyActivitiesQueryVariables = Exact<{
  id?: InputMaybe<Scalars['String']>;
}>;


export type WalletBuyActivitiesQuery = { __typename?: 'RootQuery', transactions?: { __typename?: 'TransactionList', totalCount?: number | null, nodes?: Array<{ __typename?: 'Transaction', collection?: string | null, mint?: string | null, price?: number | null, type?: string | null, buyer?: string | null, seller?: string | null, id?: string | null, epoch?: number | null, contract?: string | null, tags?: string | null } | null> | null } | null };


export const CollectionFiltersDocument = gql`
    query collectionFilters($collection: String) {
  collectionFilters(collection: $collection) {
    totalCount
    nodes {
      traits
    }
  }
}
    `;

/**
 * __useCollectionFiltersQuery__
 *
 * To run a query within a React component, call `useCollectionFiltersQuery` and pass it any options that fit your needs.
 * When your component renders, `useCollectionFiltersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCollectionFiltersQuery({
 *   variables: {
 *      collection: // value for 'collection'
 *   },
 * });
 */
export function useCollectionFiltersQuery(baseOptions?: Apollo.QueryHookOptions<CollectionFiltersQuery, CollectionFiltersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CollectionFiltersQuery, CollectionFiltersQueryVariables>(CollectionFiltersDocument, options);
      }
export function useCollectionFiltersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CollectionFiltersQuery, CollectionFiltersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CollectionFiltersQuery, CollectionFiltersQueryVariables>(CollectionFiltersDocument, options);
        }
export type CollectionFiltersQueryHookResult = ReturnType<typeof useCollectionFiltersQuery>;
export type CollectionFiltersLazyQueryHookResult = ReturnType<typeof useCollectionFiltersLazyQuery>;
export type CollectionFiltersQueryResult = Apollo.QueryResult<CollectionFiltersQuery, CollectionFiltersQueryVariables>;
export const ExploreAllCollectionsDocument = gql`
    query ExploreAllCollections($offset: Int) {
  collections(offset: $offset, limit: 20) {
    totalCount
    nodes {
      name
      verifeyed
      thumbnail
      isNsfw
      collectionId
    }
  }
}
    `;

/**
 * __useExploreAllCollectionsQuery__
 *
 * To run a query within a React component, call `useExploreAllCollectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useExploreAllCollectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExploreAllCollectionsQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useExploreAllCollectionsQuery(baseOptions?: Apollo.QueryHookOptions<ExploreAllCollectionsQuery, ExploreAllCollectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ExploreAllCollectionsQuery, ExploreAllCollectionsQueryVariables>(ExploreAllCollectionsDocument, options);
      }
export function useExploreAllCollectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ExploreAllCollectionsQuery, ExploreAllCollectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ExploreAllCollectionsQuery, ExploreAllCollectionsQueryVariables>(ExploreAllCollectionsDocument, options);
        }
export type ExploreAllCollectionsQueryHookResult = ReturnType<typeof useExploreAllCollectionsQuery>;
export type ExploreAllCollectionsLazyQueryHookResult = ReturnType<typeof useExploreAllCollectionsLazyQuery>;
export type ExploreAllCollectionsQueryResult = Apollo.QueryResult<ExploreAllCollectionsQuery, ExploreAllCollectionsQueryVariables>;
export const TopVerifeyedCollectionsDocument = gql`
    query TopVerifeyedCollections {
  collections(limit: 15, isCurated: true) {
    totalCount
    nodes {
      name
      verifeyed
      thumbnail
      isNsfw
    }
  }
}
    `;

/**
 * __useTopVerifeyedCollectionsQuery__
 *
 * To run a query within a React component, call `useTopVerifeyedCollectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTopVerifeyedCollectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTopVerifeyedCollectionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTopVerifeyedCollectionsQuery(baseOptions?: Apollo.QueryHookOptions<TopVerifeyedCollectionsQuery, TopVerifeyedCollectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TopVerifeyedCollectionsQuery, TopVerifeyedCollectionsQueryVariables>(TopVerifeyedCollectionsDocument, options);
      }
export function useTopVerifeyedCollectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TopVerifeyedCollectionsQuery, TopVerifeyedCollectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TopVerifeyedCollectionsQuery, TopVerifeyedCollectionsQueryVariables>(TopVerifeyedCollectionsDocument, options);
        }
export type TopVerifeyedCollectionsQueryHookResult = ReturnType<typeof useTopVerifeyedCollectionsQuery>;
export type TopVerifeyedCollectionsLazyQueryHookResult = ReturnType<typeof useTopVerifeyedCollectionsLazyQuery>;
export type TopVerifeyedCollectionsQueryResult = Apollo.QueryResult<TopVerifeyedCollectionsQuery, TopVerifeyedCollectionsQueryVariables>;
export const LatestCollectionsDocument = gql`
    query LatestCollections {
  collections(limit: 10, offset: 10, verifeyed: true) {
    nodes {
      name
      verifeyed
      thumbnail
      isNsfw
    }
  }
}
    `;

/**
 * __useLatestCollectionsQuery__
 *
 * To run a query within a React component, call `useLatestCollectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useLatestCollectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestCollectionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useLatestCollectionsQuery(baseOptions?: Apollo.QueryHookOptions<LatestCollectionsQuery, LatestCollectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LatestCollectionsQuery, LatestCollectionsQueryVariables>(LatestCollectionsDocument, options);
      }
export function useLatestCollectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LatestCollectionsQuery, LatestCollectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LatestCollectionsQuery, LatestCollectionsQueryVariables>(LatestCollectionsDocument, options);
        }
export type LatestCollectionsQueryHookResult = ReturnType<typeof useLatestCollectionsQuery>;
export type LatestCollectionsLazyQueryHookResult = ReturnType<typeof useLatestCollectionsLazyQuery>;
export type LatestCollectionsQueryResult = Apollo.QueryResult<LatestCollectionsQuery, LatestCollectionsQueryVariables>;
export const TrendingCollectionsDocument = gql`
    query TrendingCollections {
  collections(limit: 10, orderBy: "-volumePast24h") {
    nodes {
      name
      verifeyed
      thumbnail
      isNsfw
    }
  }
}
    `;

/**
 * __useTrendingCollectionsQuery__
 *
 * To run a query within a React component, call `useTrendingCollectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTrendingCollectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTrendingCollectionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTrendingCollectionsQuery(baseOptions?: Apollo.QueryHookOptions<TrendingCollectionsQuery, TrendingCollectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TrendingCollectionsQuery, TrendingCollectionsQueryVariables>(TrendingCollectionsDocument, options);
      }
export function useTrendingCollectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TrendingCollectionsQuery, TrendingCollectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TrendingCollectionsQuery, TrendingCollectionsQueryVariables>(TrendingCollectionsDocument, options);
        }
export type TrendingCollectionsQueryHookResult = ReturnType<typeof useTrendingCollectionsQuery>;
export type TrendingCollectionsLazyQueryHookResult = ReturnType<typeof useTrendingCollectionsLazyQuery>;
export type TrendingCollectionsQueryResult = Apollo.QueryResult<TrendingCollectionsQuery, TrendingCollectionsQueryVariables>;
export const WalletSellActivitiesDocument = gql`
    query WalletSellActivities($id: String) {
  transactions(limit: 10, offset: 1, seller: $id, type: "SALE") {
    totalCount
    nodes {
      collection
      mint
      price
      type
      buyer
      seller
      id
      epoch
      contract
      tags
    }
  }
}
    `;

/**
 * __useWalletSellActivitiesQuery__
 *
 * To run a query within a React component, call `useWalletSellActivitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useWalletSellActivitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWalletSellActivitiesQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useWalletSellActivitiesQuery(baseOptions?: Apollo.QueryHookOptions<WalletSellActivitiesQuery, WalletSellActivitiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WalletSellActivitiesQuery, WalletSellActivitiesQueryVariables>(WalletSellActivitiesDocument, options);
      }
export function useWalletSellActivitiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WalletSellActivitiesQuery, WalletSellActivitiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WalletSellActivitiesQuery, WalletSellActivitiesQueryVariables>(WalletSellActivitiesDocument, options);
        }
export type WalletSellActivitiesQueryHookResult = ReturnType<typeof useWalletSellActivitiesQuery>;
export type WalletSellActivitiesLazyQueryHookResult = ReturnType<typeof useWalletSellActivitiesLazyQuery>;
export type WalletSellActivitiesQueryResult = Apollo.QueryResult<WalletSellActivitiesQuery, WalletSellActivitiesQueryVariables>;
export const WalletBuyActivitiesDocument = gql`
    query WalletBuyActivities($id: String) {
  transactions(limit: 10, offset: 1, buyer: $id, type: "BUY") {
    totalCount
    nodes {
      collection
      mint
      price
      type
      buyer
      seller
      id
      epoch
      contract
      tags
    }
  }
}
    `;

/**
 * __useWalletBuyActivitiesQuery__
 *
 * To run a query within a React component, call `useWalletBuyActivitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useWalletBuyActivitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWalletBuyActivitiesQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useWalletBuyActivitiesQuery(baseOptions?: Apollo.QueryHookOptions<WalletBuyActivitiesQuery, WalletBuyActivitiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WalletBuyActivitiesQuery, WalletBuyActivitiesQueryVariables>(WalletBuyActivitiesDocument, options);
      }
export function useWalletBuyActivitiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WalletBuyActivitiesQuery, WalletBuyActivitiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WalletBuyActivitiesQuery, WalletBuyActivitiesQueryVariables>(WalletBuyActivitiesDocument, options);
        }
export type WalletBuyActivitiesQueryHookResult = ReturnType<typeof useWalletBuyActivitiesQuery>;
export type WalletBuyActivitiesLazyQueryHookResult = ReturnType<typeof useWalletBuyActivitiesLazyQuery>;
export type WalletBuyActivitiesQueryResult = Apollo.QueryResult<WalletBuyActivitiesQuery, WalletBuyActivitiesQueryVariables>;