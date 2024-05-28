import React, { useEffect, useState, Fragment, useCallback } from 'react'
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { Link, useHistory } from "react-router-dom"
import * as ROUTES from "../../constants/routes"
import { useWallet } from "../../contexts/wallet"
import { useConnection, useConnectionConfig } from "../../contexts/connection"
import { useUserAccounts } from '../../hooks'
import { kFormatter,formatToHyphen } from "../../utils"

import { GO_DE_GQL_BACKEND_URL } from "../../constants/urls"

// interfaces
import { ActiveOffer } from "../../types"

// apollo graphql imports
import { useLazyQuery } from "@apollo/client"
import { QUERY_COLLECTIONS, QUERY_OFFERS } from "./query"

// icons imports
import { RefreshIcon, SearchIcon } from "@heroicons/react/outline"

// reused components imports
import WalletSearch from '../../components/WalletSearch'
import { LoadingWidget } from '../../components/loadingWidget'
import { NftCard } from "../../components/NftCard"
import { ConnectMessage } from "../../components/ConnectMessage"
import { CollectionThumbnailWallet as CollectionThumbnail } from '../../components/CollectionThumbnailWallet'
import { StyledSelect } from "../../components/StyledSelect";

// styles import
import "./style.css"
import "font-awesome/css/font-awesome.min.css"
import { GraphQLOffer } from "../../types"


function ListedNftTab(props: any) {
    const { connected, wallet } = useWallet()

    const { listedMintsFromDirectSell } = useUserAccounts()

    //  graphQl  calls
    // const [getOffersDetails, { loading: loadingDirectSellOffers, error: directSellOffersError, data: directSellOffersData, },] = useLazyQuery(QUERY_OFFERS, { fetchPolicy: 'cache-and-network'})
    const [getCollection, { loading: loadingCollections, error: collectionError, data: collectionData, },] = useLazyQuery(QUERY_COLLECTIONS, { fetchPolicy: 'cache-and-network'})
    let collectionLock = false

    //wallet loading state
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingListed, setIsLoadingListed] = useState(false)

    // listed nfts in wallet
    const [listedNftsEscrow, setListedNftsEscrow] = useState<ActiveOffer[]>([])
    const [listedNfts, setListedNfts] = useState<ActiveOffer[]>([])
    const [sortedListedCollection, setsortedListedCollection]: any = useState(null)

    // for filtering and sorting
    const [filterTerm, setFilterTerm] = useState("")
    const [sortBy, setSortBy] = useState("0")

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
    //collection related states
    const [collectionsInListedWallet, setCollectionsInListedWallet]: any = useState(() => new Set([]))

    useEffect(() => {
        if(listedMintsFromDirectSell) getListedNfts()
    }, [listedMintsFromDirectSell])

    const getOfferCollection = async (collectionsName: [string]) => {
        let items:any
        if (collectionsName.length > 0) {
            while (collectionLock) {
                await new Promise(f => setTimeout(f, 100));
            }

            collectionLock = true
            try {
                console.log("get collection: ", collectionsName)
                const promise = getCollection({variables: { keys: collectionsName }})
                promise.then(
                    (result) => {
                        console.log("prev", result.previousData)
                        console.log("current", result.data)
                        const results = result.data?.collections?.nodes
                        if (results) {
                            items = results
                        }
                    }
                )

                await promise
            } catch (err) {
                console.log(collectionError)
            }
            collectionLock = false
        }
        return items
    }

    const getListedNfts = useCallback(async () => {
        setIsLoadingListed(true)
        let collectionsListedWallet: any = []
        let collectionsCache: any = new Map()
        let allOffers: GraphQLOffer[] = []
        try {
            // const promise = getOffersDetails({ variables: { owner: wallet?.publicKey?.toBase58() }, })
            // promise.then( result => {
            //     console.log("result", result.data)
            //     allOffers = result.data?.offers?.nodes as (GraphQLOffer[])
            // })
            // await promise

            const owner = wallet?.publicKey?.toBase58()
            let result = await fetch(GO_DE_GQL_BACKEND_URL, {method : 'POST', body: JSON.stringify({query: `{offers(owner: "${owner}") {
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
              }}`, variables:{}})}).then(res => res.json())
            allOffers = result.data?.offers?.nodes as (GraphQLOffer[])
        } catch (err) {
            console.log("something went wrong with offerPromise")
        }

        if (allOffers && allOffers !== []) {
            collectionsListedWallet = allOffers?.map((offer:any) => {
                return offer.collection
            })
            collectionsListedWallet = [... new Set(collectionsListedWallet)]
            await (async () => {
                let collections: any

                try {
                    collections = await getOfferCollection(collectionsListedWallet)
                } catch (error) {
                    // TODO: treat this error; perhaps show a error toastr
                    console.log(error)
                }

                console.log("collections:", collections)
                if (collections) {
                    for (let i = 0; i < collections.length; i++) {
                    collectionsCache.set(collections[i].name, collections[i])
                    }
                }
            })()

            console.log("allOffers", allOffers)
            const listedNftsFromDirect: (ActiveOffer | undefined)[] = await Promise.all(
                allOffers?.map(async (offer: any) => {
                    let collection: any

                    if (offer?.collection) {
                        collection = collectionsCache.get(offer.collection)
                    }

                    let metadata = null
                    try {
                        metadata = JSON.parse(offer.metadata)
                    } catch (error) {
                        // TODO: treat this error; perhaps show a error toastr
                    }

                    if (Object.keys(offer).length > 0) {
                        const activeOffer: ActiveOffer = {
                            metadata: metadata,
                            mint: offer?.mint,
                            price: kFormatter((offer.price as number) / LAMPORTS_PER_SOL),
                            escrowPubkeyStr: offer.pubkey,
                            contract: offer.contract,
                            owner: offer.owner,
                            collectionName: offer?.collection && offer?.collection !== "" ? offer?.collection : "UnVerifeyed",
                            collection: collection,
                            isVerifeyed: offer?.collection && offer?.collection !== "",
                            isListed: false,
                            is_nft: true,
                        }

                        return activeOffer
                    }
                })
            )
            // This filter is needed as fetchMetadata is null if a NFT has been listed; we want to remove this.
            console.log("listedNftsFromDirect", listedNftsFromDirect)
            const listedNftsFromDirectFiltered = listedNftsFromDirect.filter(
                Boolean
            ) as ActiveOffer[]
            setCollectionsInListedWallet(
                new Set([...collectionsListedWallet, ...collectionsInListedWallet])
            )
            setListedNfts(listedNftsFromDirectFiltered)
            console.log("getListedNfts", listedNftsFromDirectFiltered)
        }
        setIsLoadingListed(false)
    }, [listedMintsFromDirectSell])

    const refreshWalletListed = async () => {
        setIsLoading(true)
        await getListedNfts()
        setIsLoading(false)
    }
    // available ways to sort wallet items
    const sortingTypes = [
        { label: "Sort By Collection : A-Z", value: "0" },
        { label: "Sort By Collection : Z-A", value: "1" },
        // { label: "Sort By Floor Price : High-Low", value: "2" },
        // { label: "Sort By Floor Price : Low-High", value: "3" },
    ]

    // function to sort an array alphabetically A-Z
    const sortAscending = (arr: any[]) => {
        const sortedArray: any[] = arr.sort((a, b) => a.localeCompare(b))
        return sortedArray
    }

    // function to sort an array alphabetically Z-A
    const sortDescending = (arr: any[]) => {
        const sortedArray: any[] = arr.sort((a, b) => b.localeCompare(a))
        return sortedArray
    }

    const sortListedCollections: any = () => {
        //sort collections alphabetically
        let collections =
            sortBy === "0"
                ? sortAscending(Array.from(collectionsInListedWallet))
                : sortDescending(Array.from(collectionsInListedWallet))

        // change position of unverifeyed to last
        if (collections?.length > 1) {
            collections?.forEach((element: any, index: any) => {
                if (element == "UnVerifeyed") {
                    collections?.splice(index, 1)
                    collections?.push(element)
                }
            })
        }

        // sort each nft according to their collection
        const collectionDetails: any[] = collections?.map((collectionName: any) => {
            let nfts: any[] = []
            let thumbnail: string = ""
            let floorPrice: number | any = 0
            let totalFloorPrice: number | any = 0
            listedNfts?.forEach((nft: any) => {
                if (nft.collectionName == collectionName) {
                    nfts = [...nfts, nft]
                    thumbnail = nft?.collection?.thumbnail
                    floorPrice = nft?.collection != undefined ? kFormatter((+nft?.collection?.floorPrice as number) / LAMPORTS_PER_SOL) : "";
                    totalFloorPrice = nft?.collection != undefined ? floorPrice * nfts.length : 0
                }
            })
            return { collectionName, thumbnail, nfts, floorPrice, totalFloorPrice }
        })
        return collectionDetails
    }
    useEffect(() => {
        setsortedListedCollection(sortListedCollections())
    }, [listedNfts, collectionsInListedWallet, sortBy])

    return (
        <Fragment>
            <div className="flex justify-center items-center my-5">
                <div className="w-24">
                    <button
                        className="w-full py-2 font-medium text-white uppercase hover:text-gray-500 hover:border-gray-500 sm:text-sm flex items-center space-x-2"
                        onClick={() => refreshWalletListed()}
                    >
                        <span className="text-md xs:hidden lg:block">
                            Refresh
                      </span>
                        <RefreshIcon
                            className={
                                isLoading ? "w-5 h-5 animate-spin" : "w-5 h-5"
                            }
                            aria-hidden="true"
                        />
                    </button>
                </div>
                <div className="flex justify-start w-8/12 mx-4">
                    <div className="flex items-center h-11 w-full text-md md:text-base  bg-gray-900  lg:mx-auto rounded-md">
                        <SearchIcon className="w-4 h-4 ml-4" aria-hidden="true" />
                        <div className="w-full">
                            <WalletSearch
                                options={Array.from(collectionsInListedWallet)
                                    .sort()
                                    .map((value: any) => {
                                        return {
                                            value,
                                            label: value,
                                        }
                                    })}
                                placeholder="Search Collections by Name"
                                placeholderPrefix="Sorting by"
                                isLoading={isLoadingListed}
                                onChange={(option: any) => {
                                    if (option) {
                                        setFilterTerm(option.value)
                                    } else {
                                        setFilterTerm("")
                                    }
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

            {connected ? (
                <div className="mx-auto my-12 3xl:w-8/12">
                    {isLoadingListed || props?.isLoadingEscrow ? (
                        <div className="flex justify-center pt-20">
                            <div className="w-48">
                                <LoadingWidget />
                            </div>
                        </div>
                    ) : (
                        <>
                            {sortedListedCollection?.map(
                                (collection: any, idx: number) => (
                                    <Fragment key={idx}>
                                        <div className="my-7 flex items-center justify-start">
                                            {collection?.collectionName !==
                                                "UnVerifeyed" && (
                                                    <CollectionThumbnail
                                                        className=" rounded-sm h-10 w-10 mr-5"
                                                        name={collection?.collectionName}
                                                        thumbnail={collection?.thumbnail}
                                                    />
                                                )}
                                            <Link to={`${ROUTES.COLLECTIONS}/${formatToHyphen(collection?.name)}`} className="relative text-white text-md" >
                                                {collection?.collectionName}
                                            </Link>
                                            <span className="py-2 px-5 bg-gray-600 rounded-md ml-5 cursor-default">
                                                <span className="flex items-center text-sm">
                                                    <span className="relative text-white">
                                                        Floor :{" "}
                                                        {collection?.collectionName !==
                                                            "UnVerifeyed"
                                                            ? `◎ ${collection?.floorPrice}`
                                                            : "N/A"}
                                                    </span>
                                                </span>
                                            </span>
                                            <span className="py-2 px-5 bg-gray-600 rounded-md ml-5 cursor-default">
                                                <span className="flex items-center text-sm">
                                                    <span className="relative text-white">
                                                        Total Floor Value :{" "}
                                                        {collection?.collectionName !==
                                                            "UnVerifeyed"
                                                            ? `◎ ${collection?.totalFloorPrice}`
                                                            : "N/A"}q
                                                    </span>
                                                </span>
                                            </span>
                                        </div>
                                        <hr className="border my-6  bg-gray-100" />
                                        {listedNfts?.length ? (
                                            <>
                                                <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-5 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                                                    {collection?.nfts?.map(
                                                        (nft: ActiveOffer, index: any) => (
                                                            <NftCard
                                                                key={index}
                                                                offer={nft}
                                                                wallet={true}
                                                            />
                                                        )
                                                    )}
                                                </ul>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-base text-center text-white sm:tracking-tight pt-6">
                                                    You don't have any NFTs listed from your
                                                    wallet.
                                  </p>
                                                <p className="text-base text-center text-white sm:tracking-tight pb-6">
                                                    If this seems like a mistake try refreshing
                                                    button above.
                                  </p>
                                            </>
                                        )}
                                    </Fragment>
                                )
                            )}
                            {listedNftsEscrow.length > 0 && (
                                <>
                                    <h3 className="text-xl font-bold text-center text-white sm:tracking-tight py-6">
                                        The following items are listed with escrow
                                        contracts and will not appear in your wallet:
                            </h3>
                                    <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                                        {listedNftsEscrow.map(
                                            (nft: ActiveOffer, index: any) => {
                                                if (
                                                    filterTerm &&
                                                    filterTerm !== nft.collectionName
                                                )
                                                    return
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
                                </>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <ConnectMessage />
            )}
        </Fragment>
    )
}

export default ListedNftTab
