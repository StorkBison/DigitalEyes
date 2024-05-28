import { gql } from "@apollo/client"

export const QUERY_EXPLORE_ALL_COLLECTIONS = gql`
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
`
