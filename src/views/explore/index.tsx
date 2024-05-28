import React from "react"
import { useCallback, useEffect, useState, useRef } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { Link, useHistory } from "react-router-dom"
import { LoadingWidget } from "../../components/loadingWidget"
import { Page } from "../../components/Page"
import { Collection, ICollection } from "../../types"
import { useCollections } from "../../contexts/collections"
import { useConnection, useConnectionConfig } from "../../contexts/connection"
import { CollectionCard } from "../../components/CollectionCard"
import { useExploreAllCollectionsQuery } from "../../generated/graphql"

export const ExploreView = () => {
  const { collections, isLoading: isCollectionsLoading } = useCollections()
  const [isLoading, setIsLoading] = useState(false)
  const [isCollectionWithOffers, setIsCollectionWithOffers] = useState(true)
  const [error, setError] = useState(false)
  const history = useHistory()
  const [offset, setOffset] = useState(20)
  const [allCollections, setAllCollections] = useState<ICollection[]>([])
  const { data, loading, refetch } = useExploreAllCollectionsQuery({
    variables: { offset: offset },
  })

  useEffect(() => {
    refetch()
  }, [offset])

  //@ts-ignore
  React.useMemo<ICollection[]>(() => {
    if (data?.collections?.nodes) {
      // @ts-ignore
      const result = data?.collections?.nodes.map((x) => x)
      // @ts-ignore
      setAllCollections([...allCollections].concat(result))
      // return result
    }
    // setAllCollections(allCollections)
  }, [data])

  const fetchNext = () => {
    if (data?.collections?.nodes?.length === 20) {
      setOffset(offset + 20)
    }
  }

  return (
    <Page>
      <div className="max-w-7xl mx-auto pt-10 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-16 sm:pt-12 mb-10">
            <div className="relative text-center">
              <h1 className="h1">Explore All Collections</h1>
            </div>
          </div>
        </div>

        <div>
          <InfiniteScroll
            dataLength={allCollections.length} //This is important field to render the next data
            next={fetchNext}
            hasMore={true}
            loader={
              <div className="flex justify-center">
                <div className="w-48">
                  <LoadingWidget />
                </div>
              </div>
            }
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
            // below props only if you need pull down functionality
            // refreshFunction={() => setOffset(1)}
            // pullDownToRefresh
            // pullDownToRefreshThreshold={50}
            // pullDownToRefreshContent={
            //   <h3 style={{ textAlign: "center" }}>
            //     &#8595; Pull down to refresh
            //   </h3>
            // }
            // releaseToRefreshContent={
            //   <h3 style={{ textAlign: "center" }}>
            //     &#8593; Release to refresh
            //   </h3>
            // }
          >
            <div className="max-w-7xl px-0 sm:px-4 lg:px-0 mx-6 sm:mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-8 mb-2 md:mb-4">
              {allCollections.map((collection: ICollection, index: number) => (
                <CollectionCard collection={collection} />
              ))}
            </div>
          </InfiniteScroll>

          {/* {allCollections.map((collection: ICollection, index: number) => (
              <CollectionCard collection={collection} />
            ))} */}
        </div>
      </div>
    </Page>
  )
}
