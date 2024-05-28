import React from "react"
// @ts-ignore-next-line
import { ICollection } from "../../types"
import { CollectionCard } from "../../components/CollectionCard"
import { useLatestCollectionsQuery } from "../../generated/graphql"

export const LatestCollections = () => {
  // const { collections } = useCollections()
  // const collectionsWithEpoch = collections.filter(
  //   (collection) => !!collection.publishedEpoch && collection.publishedEpoch > 0
  // )

  const {
    data: latestCollections,
    refetch,
    error,
    loading,
  } = useLatestCollectionsQuery()

  //@ts-ignore
  const collectionData = React.useMemo<ICollection[]>(() => {
    if (latestCollections?.collections?.nodes) {
      // @ts-ignore
      const result = latestCollections?.collections?.nodes.map((x) => x)
      return result
    }
    return []
  }, [latestCollections])

  return collectionData.length > 0 ? (
    <div className="relative max-w-7xl mx-auto px-8 mb-24">
      <h2 style={{ display: "none" }}>Latest Solana FT Collections</h2>
      <p className="text-xl md:text-2xl lg:text-3xl font-semibold mb-10 text-white">
        Latest Collections
      </p>
      <div className="max-w-7xl sm:mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
        {collectionData.map((collection, index: number) => (
          <CollectionCard key={index} collection={collection} />
        ))}
      </div>
    </div>
  ) : null
}
