import { gql } from "@apollo/client"

export const QUERY_COLLECTION_FILTERS = gql`
  query collectionFilters($collection: String) {
    collectionFilters(collection: $collection) {
      totalCount
      nodes {
        traits
      }
    }
  }
`
