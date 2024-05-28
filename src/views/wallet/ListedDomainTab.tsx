import React, { useEffect, useState, Fragment, useCallback } from 'react'
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { useTabState } from 'reakit/Tab'

import { useWallet } from "../../contexts/wallet"
import { useConnection, useConnectionConfig } from "../../contexts/connection"
import { useUserAccounts } from '../../hooks'
import { getEscrowFromCollectionName } from "../../utils"
import { fetchMetadata } from "../../actions/metadata"
import { kFormatter } from "../../utils"

// interfaces
import { ActiveOffer, EscrowInfo } from "../../types"

// apollo graphql imports
import { useLazyQuery } from "@apollo/client"
import { QUERY_MINTS, QUERY_COLLECTIONS } from "./query"

// icons imports
import { RefreshIcon, SearchIcon } from "@heroicons/react/outline"

// reused components imports
import WalletSearch from '../../components/WalletSearch'
import { LoadingWidget } from '../../components/loadingWidget'
import { NftCard } from "../../components/NftCard"
import { ConnectMessage } from "../../components/ConnectMessage"
import { CollectionThumbnail } from '../../components/CollectionThumbnail'
import { DomainCard } from '../../components/DomainCard'
import { DomainName } from '../../utils/name-service'

function ListedDomainTab(props: any) {
    const connection = useConnection()
    const { connected, wallet } = useWallet()

    //wallet loading state
    const [isLoading, setIsLoading] = useState(false)

    return (
        <Fragment>
            <div className="flex justify-start items-center my-1">
                <div className="w-24">
                    <button
                        className="w-full py-2 font-medium text-white uppercase hover:text-gray-500 hover:border-gray-500 sm:text-sm flex items-center space-x-2"
                    //   onClick={() => refreshWalletItems()}
                    >
                        <span className="text-md">Refresh</span>
                        <RefreshIcon
                            className={
                                isLoading ? "w-5 h-5 animate-spin" : "w-5 h-5"
                            }
                            aria-hidden="true"
                        />
                    </button>
                </div>
                <div className="flex justify-start w-8/12 mx-4">
                    <div className="flex items-center h-11 w-full text-md md:text-base  bg-gray-900 mx-4 lg:mx-auto rounded-md">
                        <SearchIcon className="w-4 h-4 ml-2" aria-hidden="true" />
                        <div className="w-full">
                            <WalletSearch
                                options={props?.userListedDomains
                                    ?.sort()
                                    .map((domain: any) => {
                                        return {
                                            value: domain?.name,
                                            label: domain?.name,
                                        }
                                    })}
                                placeholder="Search Domains by Name"
                                placeholderPrefix="Sorting by"
                                isLoading={props?.isLoadingDomains}
                                onChange={(option: any) => {
                                    if (option) {
                                        props?.setDomainFilter(option.value)
                                    } else {
                                        props?.setDomainFilter("")
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-16 sm:pt-12 mb-10">
                <div className="relative text-center">
                    {connected ? (
                        <>
                            {props?.isLoadingDomains ? (
                                <div className="flex justify-center pt-20">
                                    <div className="w-48">
                                        <LoadingWidget />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {props?.userListedDomains ? (
                                        <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                                            {props?.userListedDomains?.map((domain: any) => (
                                                <DomainCard
                                                    connection={connection}
                                                    key={domain?.name}
                                                    domain={domain as DomainName}
                                                />
                                            ))}
                                        </ul>
                                    ) : (
                                        <>
                                            <p className="text-base text-center text-white sm:tracking-tight pt-6">
                                                You don't have any Domainss listed from your
                                                wallet.
                                </p>
                                            <p className="text-base text-center text-white sm:tracking-tight pb-6">
                                                If this seems like a mistake try refreshing
                                                below.
                                </p>
                                            {/* <p className="flex justify-center">
                                  <button onClick={() => refreshWalletItems()}>
                                    <span className="text-white inline-flex items-center">
                                      <RefreshIcon className="h-4 w-4 mr-1" />{" "}
                                      Refresh
                                    </span>
                                  </button>
                                </p> */}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <ConnectMessage />
                    )}
                </div>
            </div>
        </Fragment>
    )
}

export default ListedDomainTab
