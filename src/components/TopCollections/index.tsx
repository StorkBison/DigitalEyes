// @ts-ignore-next-line
import React from "react"
import { useCollections } from "../../contexts/collections"

import { CollectionCard } from "../CollectionCard"

import {
  useTooltipState,
  Tooltip,
  TooltipArrow,
  TooltipReference,
} from "reakit/Tooltip"
import { InformationCircleIcon } from "@heroicons/react/outline"
import { useTopVerifeyedCollectionsQuery } from "../../generated/graphql"
import { ICollection } from "../../types"

export const TopCollections = () => {
  const { topCollections } = useCollections()
  const tooltipInfo = useTooltipState()

  const {
    data: newCollection,
    refetch,
    error,
    loading,
  } = useTopVerifeyedCollectionsQuery()

  //@ts-ignore
  const collectionData = React.useMemo<ICollection[]>(() => {
    if (newCollection?.collections?.nodes) {
      // @ts-ignore
      const result = newCollection?.collections?.nodes.map((x) => x)
      const uniqueRes: any = []
      const distinctRes: any = []
      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          //@ts-ignore
          if (!uniqueRes[result[i]?.name]) {
            distinctRes.push(result[i])
            //@ts-ignore
            uniqueRes[result[i]?.name] = "random"
          }
          if (distinctRes.length === 10) {
            return distinctRes
          }
        }
      }
      return distinctRes
    }
    return []
  }, [newCollection])

  // console.log("curated", collectionData)

  return collectionData.length > 0 ? (
    // <div>
    //   <Carousel
    //     cluster={topCollections}
    //     text={"Top Verifeyed Collections"}
    //      tooltipText={"Updated weekly based on Market Cap"}
    //     />
    // </div>
    <div className="relative max-w-7xl mx-auto px-8 mb-24">
      <div className="flex justify-start mb-10">
        <h2 style={{ display: "none" }}>Top Verified Solana FT Collections</h2>
        <p className="text-white text-xl md:text-2xl lg:text-3xl font-semibold">
          Top Verifeyed Collections
        </p>

        <div className="cursor-pointer">
          <TooltipReference {...tooltipInfo}>
            <span className="text-gray-400 self-end">
              <InformationCircleIcon className="h-5 w-5 m-2 opacity-60" />
            </span>
          </TooltipReference>
          <Tooltip {...tooltipInfo}>
            <div className="bg-black text-xxs md:text-xs p-2 text-white rounded-md">
              <TooltipArrow {...tooltipInfo} />
              Updated weekly based on Market Cap
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="max-w-7xl sm:mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
        {collectionData.map((collection: ICollection, index: number) => (
          <CollectionCard key={index} collection={collection} />
        ))}
      </div>
    </div>
  ) : null
}
