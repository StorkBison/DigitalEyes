import { gql } from "@apollo/client"

// const { wallet } = useWallet()
//@ts-ignore
// const key = wallet?.publicKey.toString()

export const QUERY_TOP_VERIFEYED_COLLECTIONS = gql`
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
`

export const QUERY_TOP_LATEST_COLLECTIONS = gql`
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
`

export const QUERY_TRENDING_COLLECTIONS = gql`
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
`
