import React, { useEffect, useState, Fragment, useCallback } from 'react'
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { useTabState } from 'reakit/Tab'

import { useWallet } from "../../contexts/wallet"
import { useConnection, useConnectionConfig } from "../../contexts/connection"

// icons imports
import { RefreshIcon, SearchIcon } from "@heroicons/react/outline"

// reused components imports
import WalletSearch from '../../components/WalletSearch'
import { LoadingWidget } from '../../components/loadingWidget'
import { ConnectMessage } from "../../components/ConnectMessage"
import { DomainCard } from '../../components/DomainCard'
import { DomainName } from '../../utils/name-service'
import {
    DomainNameAndAuction,
    useDomainListing,
  } from "../../contexts/domainListings"
function OwnedDomainTab(props:any) {
  const connection = useConnection()
  const { connected, wallet } = useWallet()
  const [unclaimedDomains, setUnclaimedDomains] = useState<(DomainNameAndAuction | undefined)[]>()
  // wallet loading state
  const [isLoading, setIsLoading] = useState(false)
  const { getListedDomains, userHasBids, isUserWinner } = useDomainListing()
  const [isLoadingDomains, setIsLoadingDomains] = useState(false)
  const [listedBonfidaDomains, setListedBonfidaDomains] = useState<DomainNameAndAuction[]>()
  
  useEffect(() => {
    if (wallet?.publicKey && !listedBonfidaDomains) {
      ;(async () => {
        setIsLoadingDomains(true)
        const listedDomains = await getListedDomains(
          connection,
          wallet.publicKey as PublicKey
        )
        setListedBonfidaDomains(listedDomains as DomainName[])
        setIsLoadingDomains(false)
      })()
    }
  }, [wallet?.publicKey, listedBonfidaDomains])
    
  useEffect(() => {
    if (wallet?.publicKey && connection && listedBonfidaDomains) {
      ; (async () => {
        const userUnclaimedDomains = await getUnclaimedDomains()

        if (userUnclaimedDomains) {
          const domains:any = await Promise.all(userUnclaimedDomains)
          setUnclaimedDomains(domains?.filter((domain:any) => domain))
        }
      })()
    }
  }, [listedBonfidaDomains, wallet?.publicKey, connection])

  const userListedDomains = listedBonfidaDomains?.filter((domain: any) => {
    const time =
        parseInt(domain?.auctionData?.endedAt?.toString() as string) -
        new Date().getTime() / 1000

    if (
        domain?.domainOwner?.toString() === wallet?.publicKey?.toString() &&
        time > 0
    ) {
        return domain
    }
})

  const getUnclaimedDomains = async () => {
      if (!wallet || !listedBonfidaDomains) return
      const winningDomains: any = listedBonfidaDomains?.map(async (domain:any) => {
        if (domain?.domainOwner?.toString() !== wallet?.publicKey?.toString()) {
          const hasBid: any = await userHasBids(connection, wallet, domain)
          const isWinning = await isUserWinner(connection, wallet, domain)
          return hasBid && isWinning
        }
      })
  
      const hasWonDomainsList = await Promise.all(winningDomains)
  
      return listedBonfidaDomains?.map(async (domain :any, idx: any) => {
        const inUsersWallet = wallet?.domainNames?.find(
          (localDomain) => localDomain?.name === domain.name
        )
  
        const userIsWinner = hasWonDomainsList[idx]
  
        const time =
          parseInt(domain?.auctionData?.endedAt?.toString() as string) -
          new Date().getTime() / 1000
  
        if (!inUsersWallet && time < 0) {
          if (userIsWinner) {
            return domain
          } else if (
            domain.domainOwner?.toString() === wallet?.publicKey?.toString()
          ) {
            return domain
          } else {
            return undefined
          }
        }
      })
    }

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
                          options={wallet?.domainNames
                            ?.sort()
                            .map((domain: any) => {
                              return {
                                value: domain?.name,
                                label: domain?.name,
                              }
                            })}
                          placeholder="Search Domains by Name"
                          placeholderPrefix="Sorting by"
                          isLoading={isLoadingDomains}
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
                    {/* <h1 className="h1">Your Domains</h1> */}
                    {connected ? (
                      <>
                        {isLoadingDomains ? (
                          <div className="flex justify-center pt-20">
                            <div className="w-48">
                              <LoadingWidget />
                            </div>
                          </div>
                        ) : (
                          <>
                            {wallet?.domainNames || props?.unclaimedDomains ? (
                              <>
                                <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                                  {wallet?.domainNames?.map((domain) => {
                                    if (
                                      props?.domainFilter &&
                                      props?.domainFilter !== domain?.name
                                    )
                                      return
                                    return (
                                      <DomainCard
                                        connection={connection}
                                        key={domain?.name}
                                        domain={domain as DomainName}
                                      />
                                    )
                                  })}

                                  {props?.unclaimedDomains?.map((domain:any) => (
                                    <DomainCard
                                      connection={connection}
                                      key={domain?.name}
                                      domain={domain as DomainName}
                                    />
                                  ))}
                                </ul>
                              </>
                            ) : (
                              <h1 className="text-2xl font-bold text-center text-white sm:tracking-tight py-6">
                                You don't have any Domains{" "}
                              </h1>
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

export default OwnedDomainTab
