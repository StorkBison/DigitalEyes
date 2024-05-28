import React, { useEffect, useState, Fragment, useCallback } from 'react'
import { useWallet } from "../../contexts/wallet"
import { useUserAccounts } from '../../hooks'
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"

import { useConnection, useConnectionConfig } from "../../contexts/connection"
import { getEscrowFromCollectionName } from "../../utils"
import { fetchMetadata } from "../../actions/metadata"
import { kFormatter, shortenAddress } from "../../utils"
import { getDomainList } from "../../utils/getDomainList"

// icons imports
import { RefreshIcon } from "@heroicons/react/outline"

import {
    BASE_URL_COLLECTIONS_RETRIEVER,
    COLLECTIONS_RETRIEVER_QUERY_PARAM,
    BASE_URL_OFFERS_RETRIEVER,
} from "../../constants/urls"

// interfaces
import { ActiveOffer, EscrowInfo } from "../../types"

// reused components imports
import { LoadingWidget } from '../../components/loadingWidget'
import { NftCard } from "../../components/NftCard"
import { ConnectMessage } from "../../components/ConnectMessage"

function LiveDutchAuctionTab(props: any) {
    const connection = useConnection()
    const { connected, wallet } = useWallet()
    const { endpoint } = useConnectionConfig()
    const { listedMintsFromDutch, } = useUserAccounts()

    const [listedNftsDutch, setListedNftsDutch] = useState<ActiveOffer[]>([])
    const [isLoadingDutch, setIsLoadingDutch] = useState(false)
    
  useEffect(() => {
    getListedNftsDutch()
  }, [listedMintsFromDutch])

    const getListedNftsDutch = useCallback(async () => {
        setIsLoadingDutch(true)
        const listedNftsFromDutch: (ActiveOffer | undefined)[] = await Promise.all(
          listedMintsFromDutch.map(async (mint: string) => {
            let offerInfo
            try {
              const offerPromise = await fetch(
                `${BASE_URL_OFFERS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
              )
              offerInfo = await offerPromise.json()
            } catch (error) {
              console.log("something went wrong with offerPromise")
            }
    
            let collection = null
            try {
              const collectionPromise = await fetch(
                `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
              )
              collection = JSON.parse(await collectionPromise.json())
            } catch (error) {
              // TODO: treat this error; perhaps show a error toastr
            }
    
            let contract = undefined
            if (collection) {
              contract = getEscrowFromCollectionName(endpoint, collection?.name)
            }
    
            let metadata = null
            try {
              metadata = await fetchMetadata(
                connection,
                new PublicKey(mint),
                contract as EscrowInfo
              )
            } catch (error) {
              // TODO: treat this error; perhaps show a error toastr
            }
    
            if (Object.keys(offerInfo).length > 0) {
              const activeOffer: ActiveOffer = {
                metadata: metadata,
                mint: mint,
                price: kFormatter((offerInfo.price as number) / LAMPORTS_PER_SOL),
                escrowPubkeyStr: offerInfo.pk,
                contract: offerInfo.contract,
                owner: offerInfo.owner,
                collectionName:
                  !!collection && collection !== [] ? collection?.name : "",
                isListed: false,
                isVerifeyed:
                  !!collection && collection !== [] ? collection?.name : "",
              }
    
              return activeOffer
            }
          })
        )
        // This filter is needed as fetchMetadata is null if a NFT has been listed; we want to remove this.
        const listedNftsFromDutchFilteredMetadata = listedNftsFromDutch.filter(
          Boolean
        ) as ActiveOffer[]
        //@ts-ignore
        const listedNftsFromDutchFiltered =
          listedNftsFromDutchFilteredMetadata.filter(
            //@ts-ignore
            (offer) => offer.owner == wallet?.publicKey.toString()
          )
    
        setListedNftsDutch(listedNftsFromDutchFiltered)
        setIsLoadingDutch(false)
      }, [listedMintsFromDutch])

    return(
        <Fragment>
            <div className="pt-16 sm:pt-12 mb-10">
                  <div className="relative text-center">
                    <h1 className="h1">Your Live Auctions</h1>
                    <p className="wallet-key text-gray-400 mt-2 capitalize mx-auto w-5/6 text-sm leading-loose">
                      {wallet?.domainNames
                        ? getDomainList(wallet?.domainNames)
                        : wallet?.publicKey
                        ? `${shortenAddress(wallet?.publicKey.toString())}`
                        : ""}
                    </p>
                  </div>
                </div>
                {connected ? (
                  <>
                    {isLoadingDutch || props?.isLoadingEscrow || props?.isLoadingDomains ? (
                      <div className="flex justify-center pt-20">
                        <div className="w-48">
                          <LoadingWidget />
                        </div>
                      </div>
                    ) : (
                      <>
                        {listedNftsDutch.length || props?.userListedDomains ? (
                          <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                            {listedNftsDutch.map(
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
                        ) : (
                          <>
                            <p className="text-base text-center text-white sm:tracking-tight pt-6">
                              You don't have any NFTs on auction in your wallet.
                            </p>
                            <p className="text-base text-center text-white sm:tracking-tight pb-6">
                              If this seems like a mistake try refreshing below.
                            </p>
                            <p className="flex justify-center">
                              <button onClick={() => {}}>
                                <span className="text-white inline-flex items-center">
                                  <RefreshIcon className="h-4 w-4 mr-1" />{" "}
                                  Refresh
                                </span>
                              </button>
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <ConnectMessage />
                )}
        </Fragment>
    )
}
export default LiveDutchAuctionTab