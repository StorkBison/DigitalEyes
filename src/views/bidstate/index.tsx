import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { useCallback, useEffect, useState } from "react"
import { fetchMetadata } from "../../actions/metadata"
import { ConnectMessage } from "../../components/ConnectMessage"
import { LoadingWidget } from "../../components/loadingWidget"
import { NftCard } from "../../components/NftCard"
import { Page } from "../../components/Page"
import { RefreshIcon } from "@heroicons/react/outline"
import { kFormatter, shortenAddress } from "../../utils"

import {
  BASE_URL_COLLECTIONS_RETRIEVER,
  COLLECTIONS_RETRIEVER_QUERY_PARAM,
  BASE_URL_OFFERS_RETRIEVER,
} from "../../constants/urls"
import { useConnection, useConnectionConfig } from "../../contexts/connection"
import { useWallet } from "../../contexts/wallet"
import { useUserAccounts } from "../../hooks"
import { ActiveOffer, EscrowInfo } from "../../types"
import { getEscrowFromCollectionName } from "../../utils"
import { useTabState, Tab, TabList, TabPanel } from "reakit/Tab"
import { forceCheck } from "react-lazyload"
import { StyledSelect } from "../../components/StyledSelect"
import { getDomainList } from "../../utils/getDomainList"
import {
  DomainNameAndAuction,
  useDomainListing,
} from "../../contexts/domainListings"
import { DomainName } from "../../utils/name-service"
import { DomainCard } from "../../components/DomainCard"

import { SideBar } from "../../components/SideBar"
import "react-pro-sidebar/dist/css/styles.css"
import "../../components/SideBar/style.css"

import { PageHeader } from "../../components/PageHeader"
import "../../components/PageHeader/style.css"
import BidStateTable from "../../components/BidTable"
import "../../components/BidTable/style.css"


  export const BidState = () => {
  const connection = useConnection()
  const { connected, wallet } = useWallet()
  const { getListedDomains, userHasBids, isUserWinner } = useDomainListing()
  const [listedBonfidaDomains, setListedBonfidaDomains] =
    useState<DomainNameAndAuction[]>()
  const { endpoint } = useConnectionConfig()
  const {
    listedMintsFromEscrow,
    mintsInWalletUnlisted,
    listedMintsFromDirectSell,
  } = useUserAccounts()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUnlisted, setIsLoadingUnlisted] = useState(false)
  const [isLoadingListed, setIsLoadingListed] = useState(false)
  const [isLoadingEscrow, setIsLoadingEscrow] = useState(false)
  const [isLoadingDomains, setIsLoadingDomains] = useState(false)
  const [unlistedNfts, setUnlistedNfts] = useState<ActiveOffer[]>([])
  const [listedNftsEscrow, setListedNftsEscrow] = useState<ActiveOffer[]>([])
  const [listedNfts, setListedNfts] = useState<ActiveOffer[]>([])
  const [unclaimedDomains, setUnclaimedDomains] =
    useState<(DomainNameAndAuction | undefined)[]>()
  const [activeDomainBids, setActiveDomainBids] =
    useState<(DomainNameAndAuction | undefined)[]>()
  const [collectionsInWallet, setCollectionsInWallet] = useState(
    () => new Set()
  )
  const [collectionFilter, setCollectionFilter] = useState("")
  const tab = useTabState()

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

  const getListedNftsEscrow = useCallback(async () => {
    setIsLoadingEscrow(true)
    const collectionsListedWallet: any = []
    const listedNftsFromWallet: (ActiveOffer | undefined)[] = await Promise.all(
      listedMintsFromEscrow.map(async (mint: string) => {
        let offerInfo
        try {
          const offerPromise = await fetch(
            `${BASE_URL_OFFERS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint}`
          )
          offerInfo = await offerPromise.json()
        } catch (error) {
          console.log("darn")
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
          if (!collectionsListedWallet.includes(collection?.name)) {
            collectionsListedWallet.push(collection?.name)
          }
        }

        if (Object.keys(offerInfo).length > 0) {
          const activeOffer: ActiveOffer = {
            metadata: offerInfo.metadata,
            mint: mint,
            price: kFormatter((offerInfo.price as number) / LAMPORTS_PER_SOL),
            escrowPubkeyStr: offerInfo.pk,
            contract: offerInfo.contract,
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
    const listedNftsFromWalletFiltered = listedNftsFromWallet.filter(
      Boolean
    ) as ActiveOffer[]
    // console.log( unlistedNftsFromWalletFiltered );
    setListedNftsEscrow(listedNftsFromWalletFiltered)
    setCollectionsInWallet(
      new Set([...collectionsInWallet, ...collectionsListedWallet])
    )
    setIsLoadingEscrow(false)
  }, [listedMintsFromEscrow])

  const getListedNfts = useCallback(async () => {
    setIsLoadingListed(true)
    const listedNftsFromDirect: (ActiveOffer | undefined)[] = await Promise.all(
      listedMintsFromDirectSell.map(async (mint: string) => {
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

        if (Object.keys(offerInfo).length > 0) {
          const activeOffer: ActiveOffer = {
            metadata: offerInfo.metadata,
            mint: mint,
            price: kFormatter((offerInfo.price as number) / LAMPORTS_PER_SOL),
            escrowPubkeyStr: offerInfo.pk,
            contract: offerInfo.contract,
            owner: offerInfo.owner,
            collectionName: !!collection && collection !== [] ? collection?.name : "",
            isListed: false,
            isVerifeyed:
              !!collection && collection !== [] ? collection?.name : "",
          }
          return activeOffer
        }
      })
    )
    // This filter is needed as fetchMetadata is null if a NFT has been listed; we want to remove this.
    const listedNftsFromDirectFiltered = listedNftsFromDirect.filter(
      Boolean
    ) as ActiveOffer[]
    // console.log( unlistedNftsFromWalletFiltered );
    setListedNfts(listedNftsFromDirectFiltered)
    setIsLoadingListed(false)
  }, [listedMintsFromDirectSell])

  const getUnlistedNfts = useCallback(async () => {
    setIsLoadingUnlisted(true)
    const collectionsUnListedWallet: any = []
    const listedAccountsDecoded: (ActiveOffer | undefined)[] =
      await Promise.all(
        mintsInWalletUnlisted.map(async (mint: string) => {
          const offer = {} as ActiveOffer

          let collection = null
          try {
            const collectionPromise = await fetch(
              `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint.toString()}`
            )
            collection = JSON.parse(await collectionPromise.json())
          } catch (error) {
            // TODO: treat this error; perhaps show a error toastr
          }

          const contract = getEscrowFromCollectionName(endpoint, "")
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

          if (!metadata) return

          offer.mint = mint.toString()
          offer.price = 0
          // offer.escrowPubkeyStr = account.pubkey.toString();
          offer.metadata = metadata
          offer.isListed = true
          offer.collectionName =
            !!collection && collection !== [] ? collection?.name : ""
          offer.isVerifeyed = !!collection && collection !== []
          if (offer.collectionName) {
            collectionsUnListedWallet.push(offer.collectionName)
          }
          return offer
        })
      )

    const listedAccountsDecodedFiltered = listedAccountsDecoded.filter(
      Boolean
    ) as ActiveOffer[]
    setUnlistedNfts(listedAccountsDecodedFiltered)
    setCollectionsInWallet(
      new Set([...collectionsInWallet, ...collectionsUnListedWallet])
    )
    setIsLoadingUnlisted(false)
  }, [mintsInWalletUnlisted])

  const refreshWalletItems = async () => {
    setIsLoading(true)
    await getListedNfts()
    await getListedNftsEscrow()
    await getUnlistedNfts()
    setIsLoading(false)
  }

  useEffect(() => {
    getUnlistedNfts()
  }, [mintsInWalletUnlisted])

  useEffect(() => {
    getListedNfts()
  }, [listedMintsFromDirectSell])

  useEffect(() => {
    getListedNftsEscrow()
  }, [listedMintsFromEscrow])

  useEffect(() => {
    forceCheck()
  }, [tab])

  const getUnclaimedDomains = async () => {
    if (!wallet || !listedBonfidaDomains) return
    const winningDomains = listedBonfidaDomains?.map(async (domain) => {
      if (domain?.domainOwner?.toString() !== wallet?.publicKey?.toString()) {
        const hasBid = await userHasBids(connection, wallet, domain)
        const isWinning = await isUserWinner(
          connection,
          wallet,
          domain
        )
        return hasBid && isWinning
      }
    })

    const hasWonDomainsList = await Promise.all(winningDomains)

    return listedBonfidaDomains?.map(async (domain, idx) => {
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

  const userListedDomains = listedBonfidaDomains?.filter((domain) => {
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

  const userDomainBids = async () => {
    if (!wallet) return
    return listedBonfidaDomains?.map(async (domain) =>
      domain
        ? (await userHasBids(connection, wallet, domain))
          ? domain
          : undefined
        : undefined
    )
  }

  const [OfferState, SetOfferState] = useState('');

  useEffect(() => {
    if (wallet?.publicKey && connection && listedBonfidaDomains) {
      ;(async () => {
        const domainsWithBids = await userDomainBids()

        if (domainsWithBids) {
          const domians = await Promise.all(domainsWithBids)
          setActiveDomainBids(domians.filter((domain) => domain))
        }
      })()
    }
  }, [listedBonfidaDomains, wallet?.publicKey, connection])

  useEffect(() => {
    if (wallet?.publicKey && connection && listedBonfidaDomains) {
      ;(async () => {
        const userUnclaimedDomains = await getUnclaimedDomains()

        if (userUnclaimedDomains) {
          const domains = await Promise.all(userUnclaimedDomains)
          setUnclaimedDomains(domains.filter((domain) => domain))
        }
      })()
    }
  }, [listedBonfidaDomains, wallet?.publicKey, connection])

  return (
    <Page title="Your Wallet | DigitalEyes">
      <div style = {{display: "flex"}}>
        <SideBar setOfferState= {SetOfferState}/>
        <div style = {{color: "white!important", padding: 20}}>
          
          <BidStateTable />
          <PageHeader OfferState={OfferState}/>
        </div>
      </div>
    </Page>
  )
}

