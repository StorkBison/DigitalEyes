import { gql } from "@apollo/client"

// const { wallet } = useWallet()
//@ts-ignore
// const key = wallet?.publicKey.toString()

export const QUERY_SELL_ACTIVITIES = gql`
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
`

export const QUERY_BUY_ACTIVITIES = gql`
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
`

export const QUERY_COLLECTIONS = gql`
  query CollectionsQuery($keys: [String]) {
    collections(keys: $keys) {
      nodes {
        name
        thumbnail
        verifeyed
        floorPrice
      }
      totalCount
    }
  }
`

export const QUERY_MINTS = gql`
  query MintsQuery($keys: [String]) {
    mints(keys: $keys) {
      nodes {
        collection
        mint
        tags
      }
      totalCount
    }
  }
`

export const QUERY_OFFERS = gql`
  query OffersQuery($owner: String) {
    offers(owner: $owner) {
      nodes {
        contract
        collection
        metadata
        offerName
        price
        owner
        mint
        pubkey
        tags
        id
      }
      totalCount
    }
  }
`

export const QUERY_DIRECT_SALE_OFFERS = gql`
  query OffersQuery($owner: String, $contract: String) {
    offers(owner: $owner, contract: $contract) {
      nodes {
        contract
        collection
        metadata
        offerName
        price
        owner
        mint
        pubkey
        tags
        id
      }
      totalCount
    }
  }
`
