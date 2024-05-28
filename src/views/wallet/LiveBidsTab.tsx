import React, { useEffect, useState, Fragment, useCallback } from 'react'

import { useWallet } from "../../contexts/wallet"
import { useConnection, useConnectionConfig } from "../../contexts/connection"
import {
    DomainNameAndAuction,
    useDomainListing,
  } from "../../contexts/domainListings"

// apollo graphql imports
import { useLazyQuery } from "@apollo/client"
import { QUERY_MINTS, QUERY_COLLECTIONS } from "./query"

// icons imports
import { RefreshIcon, SearchIcon } from "@heroicons/react/outline"

// reused components imports
import WalletSearch from '../../components/WalletSearch'
import { LoadingWidget } from '../../components/loadingWidget'
import { ConnectMessage } from "../../components/ConnectMessage"
import { DomainCard } from '../../components/DomainCard'
import { DomainName } from '../../utils/name-service'

function LiveBidsTab(props:any) {
    const connection = useConnection()
    const { connected, wallet } = useWallet()
    const { getListedDomains, userHasBids, isUserWinner } = useDomainListing()
  
      //wallet loading state
      const [isLoading, setIsLoading] = useState(false)

      const [activeDomainBids, setActiveDomainBids] = useState<(DomainNameAndAuction | undefined)[]>()
     
      useEffect(() => {
        if (wallet?.publicKey && connection && props?.listedBonfidaDomains) {
          ;(async () => {
            const domainsWithBids = await userDomainBids()
    
            if (domainsWithBids) {
              const domians: any = await Promise.all(domainsWithBids)
              setActiveDomainBids(domians?.filter((domain: any) => domain))
            }
          })()
        }
      }, [props?.listedBonfidaDomains, wallet?.publicKey, connection])
      
      const userDomainBids = async () => {
        if (!wallet) return
        return props?.listedBonfidaDomains?.map(async (domain:any) =>
          domain
            ? (await userHasBids(connection, wallet, domain))
              ? domain
              : undefined
            : undefined
        )
      }
    return (
        <Fragment>
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
                        {activeDomainBids ? (
                          <ul className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-1 grid gap-4 md:gap-6 lg:gap-8 pb-6">
                            {activeDomainBids.map((domain) => (
                              <DomainCard
                                connection={connection}
                                key={domain?.name}
                                domain={domain as DomainName}
                              />
                            ))}
                          </ul>
                        ) : (
                          <h1 className="text-2xl font-bold text-center text-white sm:tracking-tight py-6">
                            You don't have any bids{" "}
                          </h1>
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

export default LiveBidsTab
