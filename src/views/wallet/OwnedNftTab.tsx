import React, { useEffect, useState, Fragment, useCallback } from "react"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { Link, useHistory } from "react-router-dom"
import * as ROUTES from "../../constants/routes"
import { useWallet } from "../../contexts/wallet"
import { useConnectionConfig } from "../../contexts/connection"
import { useUserAccounts } from "../../hooks"
import { kFormatter,formatToHyphen } from "../../utils"

// interfaces
import { ActiveOffer } from "../../types"

// apollo graphql imports
import { useLazyQuery } from "@apollo/client"
import { QUERY_MINTS, QUERY_COLLECTIONS } from "./query"

// icons imports
import { RefreshIcon, SearchIcon } from "@heroicons/react/outline"

// reused components imports
import WalletSearch from "../../components/WalletSearch"
import { LoadingWidget } from "../../components/loadingWidget"
import { NftCard } from "../../components/NftCard"
import { ConnectMessage } from "../../components/ConnectMessage"
import { CollectionThumbnailWallet as CollectionThumbnail } from '../../components/CollectionThumbnailWallet'
import { StyledSelect } from "../../components/StyledSelect";

// styles import
import "./style.css"
import "font-awesome/css/font-awesome.min.css"

export function OwnedNftTab(props: any) {
  const { connected, wallet } = useWallet()
  const { endpoint } = useConnectionConfig()

  const { mintsInWalletUnlisted } = useUserAccounts()

  // wallet loading state
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUnlisted, setIsLoadingUnlisted] = useState(false)

  // for nfts in wallet
  const [unlistedNfts, setUnlistedNfts]: any = useState(new Map())
  const [sortedUnlisted, setSortedUnlisted] = useState(new Object)

  // for filtering and sorting
  const [filterTerm, setFilterTerm] = useState("")
  const [sortBy, setSortBy] = useState("0")

  //collection related states
  const [collectionsInUnlistedWallet, setCollectionsInUnlistedWallet]: any =
    useState(() => new Set([]))

  const [getCollection, { error: collectionError }] = useLazyQuery(QUERY_COLLECTIONS, { fetchPolicy: 'cache-and-network'});
  let collectionLock = false

  const getMintsCollection = async (collectionsName: [string]) => {
    let items:any
    if (collectionsName.length > 0) {
      while (collectionLock) {
        await new Promise(f => setTimeout(f, 100));
      }

      collectionLock = true
      console.log("get collection: ", collectionsName)
      const promise = getCollection({variables: { keys: collectionsName }})
      promise.then(
        (result) => {
          console.log("prev", result.previousData)
          console.log("current", result.data)
          const results = result.data?.collections
          if (results) {
            items = results
          }
        }
      )

      await promise
      collectionLock = false
      if (collectionError) {
        console.log(collectionError)
      }
    }
    console.log("finish get collection: ",  collectionsName)
    return items
  }
  const darkTheme = {
    menu: (provided: any) => ({
      ...provided,
      boxShadow: "0px 4px 20px 0px #0000001A",
      borderRadius: "6px",
      marginTop:"5px",
      padding:"10px",
      backgroundColor: "#171717",



    }),
    option: (provided: any, state: any) => ({
      ...provided,
      paddingLeft: "24px",
      backgroundColor: "#171717",
      borderRadius: "6px",
      color: "var(--color-main-secondary)",
      "&:hover": {
        backgroundColor: "#666666",
        color: "#000",
      },
    }),
    input: (provided: any, state: any) => ({
      ...provided,
      margin: "0",
      boxSizing: "border-box",
      paddingRight: "0",
      color: "#fff",
      cursor:"text"
    })
  };
  //  graphQl  calls
  const [
    getMintDetails,
    { loading: loadingMints, error: mintsError, data: mintsData },
  ] = useLazyQuery(QUERY_MINTS, { fetchPolicy: 'cache-and-network'})

  useEffect(() => {
    if (mintsInWalletUnlisted.length > 0) getUnlistedNfts()
  }, [mintsInWalletUnlisted]) // , mintsData, collectionData

  const refreshWalletUnlisted = async () => {
    setIsLoading(true)
    await getUnlistedNfts()
    setIsLoading(false)
  }

  const getUnlistedNfts = async () => {
    setIsLoadingUnlisted(true)
    const promise = getMintDetails({ variables: { keys: mintsInWalletUnlisted } })
    promise.then((result) => {
      (async (result) => {
        let collectionsUnListedWallet: any = []
        let offerSortedByCollection: any = new Map()
        let listedAccountsDecoded: (ActiveOffer | undefined)[] = []
        let collectionsCache: any = new Map()

        const mintsDetails = result.data?.mints?.nodes

        if (mintsDetails) {
          collectionsUnListedWallet = mintsDetails?.map((mint:any) => {
            return mint.collection
          })
          collectionsUnListedWallet = [... new Set(collectionsUnListedWallet)]
          await (async () => {
            let collections: any

            try {
              collections = await getMintsCollection(collectionsUnListedWallet)
            } catch (error) {
              // TODO: treat this error; perhaps show a error toastr
              console.log(error)
            }

            console.log("collections:", collections)
            if (collections) {
              for (let i = 0; i < collections?.nodes.length; i++) {
                collectionsCache.set(collections?.nodes[i].name, collections?.nodes[i])
              }
            }
          })()

          listedAccountsDecoded =
            await Promise.all(
              mintsDetails?.map(async (mint: any) => {
                let metadata = JSON.parse(mint.tags)
                if (!metadata) return

                const offer = {} as ActiveOffer | any
                let collection: any

                if (mint?.collection) {
                  collection = collectionsCache.get(mint.collection)
                }

                offer.mint = mint?.mint?.toString()
                offer.price = 0
                offer.metadata = metadata
                offer.isListed = true
                offer.is_nft = true
                offer.collectionName =
                  mint?.collection && mint?.collection !== ""
                    ? mint?.collection
                    : "UnVerifeyed"
                offer.collection = collection
                offer.isVerifeyed = mint?.collection && mint?.collection !== ""
                const value = offerSortedByCollection.get(offer.collectionName)
                  ? offerSortedByCollection.get(offer.collectionName)
                  : { meta: {}, offers: [] }
                offerSortedByCollection.set(offer.collectionName, {
                  meta: { ...value?.meta, thumbnail: offer?.collection?.thumbnail, floor: offer?.collection?.floorPrice ? offer?.collection?.floorPrice : 0, totalFloor: 0 },
                  offers: [...value?.offers, offer]
                })
              })
            )

          setUnlistedNfts(offerSortedByCollection)
          console.log("getUnlistedNfts", offerSortedByCollection)
        }

        setCollectionsInUnlistedWallet(
          new Set([...collectionsUnListedWallet, ...collectionsInUnlistedWallet])
        )

        setIsLoadingUnlisted(false)
      })(result)
    })
  }

  // available ways to sort wallet items
  const sortingTypes = [
    { label: "Sort By Collection : A-Z", value: "0" },
    { label: "Sort By Collection : Z-A", value: "1" },
    // { label: "Sort By Floor Price : High-Low", value: "2" },
    // { label: "Sort By Floor Price : Low-High", value: "3" },
  ]

  // function to sort an object alphabetically A-Z
  const sortAscending = (arr: any[]) => {
    const sortedArray: any[] = arr.sort(([key1, value1], [key2, value2]) =>
      key1.localeCompare(key2)
    )
    return sortedArray
  }

  // function to sort an object alphabetically Z-A
  const sortDescending = (arr: any[]) => {
    const sortedArray: any[] = arr.sort(([key1, value1], [key2, value2]) =>
      key2.localeCompare(key1)
    )
    return sortedArray
  }
  const sortUnlistedNfts: any = () => {
    // convert map to array
    const unsortedArr = Array.from(unlistedNfts)
    //choose sorting order
    const sortedNftsArr =
      sortBy === "0" ? sortAscending(unsortedArr) : sortDescending(unsortedArr)
    // convert to object
    let obj = sortedNftsArr.reduce((obj, [key, value]) => {
      value.meta.totalFloor = value.meta.floor * value.offers.length
      obj[key] = value
      return obj
    }, {})
    console.log("sortUnlistedNfts", obj)
    return obj
  }

  useEffect(() => {
    console.log("sortUnlistedNfts")
    setSortedUnlisted(sortUnlistedNfts())
  }, [sortBy, unlistedNfts])

  return (
    <Fragment>
      {collectionsInUnlistedWallet && (
        <div className="flex justify-center items-center my-1">
          <div className="w-24 text-right">
            <button
              className="w-full py-2 font-medium text-white uppercase hover:text-gray-500 hover:border-gray-500 sm:text-sm flex items-center space-x-2"
              onClick={() => refreshWalletUnlisted()}
            >
              <span className="text-md xs:hidden lg:block">Refresh</span>
              <RefreshIcon
                className={isLoading ? "w-5 h-5 animate-spin" : "w-5 h-5"}
                aria-hidden="true"
              />
            </button>
          </div>
          <div className="flex justify-start w-8/12 mx-4">
            <div className="flex items-center h-11 w-full text-md md:text-base  bg-gray-900  lg:mx-auto rounded-md">
              <SearchIcon className="w-4 h-4 ml-4" aria-hidden="true" />
              <div className="w-full">
                <WalletSearch
                  options={Array.from(collectionsInUnlistedWallet)
                    .sort()
                    .map((value: any) => {
                      return { value, label: value }
                    })}
                  placeholder="Search Collections by Name"
                  placeholderPrefix="Sorting by"
                  isLoading={isLoadingUnlisted}
                  onChange={(option: any) => {
                    if (option) setFilterTerm(option.value)
                    else setFilterTerm("")
                  }}
                />
              </div>
            </div>
          </div>
          <div className="w-3/12  ml-3 border-gray-700 border-1 rounded-md">
          <StyledSelect
            options={sortingTypes}
            isLoading={isLoading}
            onChange={(selected: any) => setSortBy(selected.value)}
            placeholder="Sort by..."
            placeholderPrefix="Sorting by"
            value={sortBy}
            styles={darkTheme}
          />

          </div>
        </div>
      )}
      {connected ? (
        <div className="mx-auto my-12 3xl:w-7/12">
          {isLoadingUnlisted ||
            loadingMints ? (
            <div className="flex justify-center pt-20">
              <div className="w-48">
                <LoadingWidget />
              </div>
            </div>
          ) : (
            <Fragment>
              {Object.entries(sortedUnlisted)?.map(
                ([collectionName, collectionNfts]: any, idx: number) => {
                  if (filterTerm && filterTerm !== collectionName) {
                    return
                  }
                  return (
                    <Fragment key={idx}>
                      <div className="my-4 flex items-center justify-start">
                        {collectionName !== "UnVerifeyed" && (
                          <CollectionThumbnail
                            className=" rounded-sm h-10 w-10 mr-5"
                            name={collectionName}
                            thumbnail={collectionNfts?.meta?.thumbnail}
                          // width="50"
                          />
                        )}

                        <Link to={`${ROUTES.COLLECTIONS}/${formatToHyphen(collectionName)}`} className="relative text-white text-md" >
                            {collectionName}
                        </Link>
                        <span className="py-2 px-5 bg-gray-600 rounded-md ml-5 cursor-default">
                          <span className="flex items-center text-sm">
                            <span className="relative text-white">
                              Floor :{" "}
                              {collectionName !== "UnVerifeyed"
                                ? `◎ ${collectionNfts?.meta
                                  ? kFormatter(
                                    (+collectionNfts?.meta?.floor as number) /
                                    LAMPORTS_PER_SOL
                                  )
                                  : ""
                                }`
                                : "N/A"}
                            </span>
                          </span>
                        </span>
                        <span className="py-2 px-5 bg-gray-600 rounded-md ml-5 cursor-default">
                          <span className="flex items-center text-sm">
                            <span className="relative text-white">
                              Total Floor Value :{" "}
                              {collectionName !== "UnVerifeyed"
                                ? `◎ ${collectionNfts?.meta
                                  ? kFormatter(
                                    ((collectionNfts?.meta?.totalFloor) as number) /
                                    LAMPORTS_PER_SOL
                                  )
                                  : ""
                                }`
                                : "N/A"}
                            </span>
                          </span>
                        </span>
                      </div>
                      <hr className="border-1 my-6  bg-gray-100" />
                      <>
                        <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-5 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                          {collectionNfts?.offers?.map(
                            (nft: ActiveOffer, index: any) => {
                              return (
                                <NftCard
                                  key={index}
                                  offer={nft}
                                  wallet={true}
                                />
                              )
                            }
                          )}
                        </ul>
                        {/* <hr className="border-0 mb-4 h-1 bg-gray-100" /> */}
                      </>
                    </Fragment>
                  )
                }
              )}
            </Fragment>
          )}
        </div>
      ) : (
        <ConnectMessage />
      )}
    </Fragment>
  )
}
