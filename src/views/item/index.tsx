import { RefreshIcon } from "@heroicons/react/outline";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { fetchMetadata, fetchMetadataWithoutContract } from "../../actions/metadata";
import { LoadingWidget } from "../../components/loadingWidget";
import { NftDetails } from "../../components/NftDetails";
import { Page } from "../../components/Page";
import { UNVERIFEYED_COLLECTION_OPTION } from "../../constants/collections";
import * as ROUTES from "../../constants/routes";
import bs58 from "bs58";
import {
  BASE_URL_COLLECTIONS_RETRIEVER,
  BASE_URL_OFFERS_RETRIEVER,
  COLLECTIONS_RETRIEVER_QUERY_PARAM,
  GET_SOLO_USER_NO_AUTH,
  GET_SOLO_USER_NO_AUTH_QUERY_PARAM,
  GO_DE_GQL_BACKEND_URL,
} from "../../constants/urls"
import { useCollections } from "../../contexts/collections"
import { useConnection, useConnectionConfig } from "../../contexts/connection"
import { fetchActiveAccountOffers } from "../../contracts/escrow"
import { useWallet } from "../../contexts/wallet"
import { ActiveOffer, EscrowInfo, GraphQLOffer, Metadata } from "../../types"
import {
  findCollection,
  getAllEscrowContracts,
  getEscrowFromCollectionName,
  formatToHyphen,
} from "../../utils"
import {
  EscrowLayout,
  ESCROW_ACCOUNT_DATA_LAYOUT,
  SaleInfoLayout,
  SALE_INFO_ACCOUNT_DATA_LAYOUT,
  DutchAuctionInfoLayout,
  DUTCH_AUCTION_ACCOUNT_DATA_LAYOUT,
} from "../../utils/layout";
import { ErrorView } from "../error";
import { DIRECT_SELL_CONTRACT_ID, DUTCH_AUCTION_CONTRACT_ID } from "../../constants/contract_id";
import { fetchActiveDirectSellOffers } from "../../contracts/direct-sell";
import { fetchActiveDutchAuctionOffers } from "../../contracts/dutch-auction";
import { useAccountByMint } from "../../hooks/useAccountByMint";


export const ItemView = () => {
  const { wallet } = useWallet();
  let publicKey = wallet?.publicKey

  const connection = useConnection()
  const { endpoint } = useConnectionConfig()
  const [offer, setOffer] = useState<ActiveOffer>()
  const [nft, setNft] = useState<any>()
  const [customContract, setCustomContract] = useState<any>()
  const [isToken, setIsToken] = useState(false)
  const [isTokenListed, setIsTokenListed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { collection, mint } = useParams<any>()
  const escrows = getAllEscrowContracts(endpoint)
  const {
    collections,
    topCollections,
    isLoading: isCollectionsLoading,
  } = useCollections()
  const history = useHistory()
  const [error, setError] = useState(false)
  const [statusOnchain, setStatusOnchain] = useState("")

  const [isTokenAccountAcquired, setIsTokenAccountAcquired] = useState(false);


  const refreshItem = async () => {
    setIsLoading(true)
    setIsRefreshing(true)
    const salesInfo = await fetchActiveDirectSellOffers(
      connection,
      undefined,
      mint
    )

    if (salesInfo.length > 0) {
      setStatusOnchain("listed")
      setIsRefreshing(false)

    } else {
      const accounts = await fetchActiveAccountOffers(
        connection,
        escrows,
        undefined,
        mint
      )
      if (accounts.length > 0) {
        setStatusOnchain("escrow")
      } else {

        const auctionInfos = await fetchActiveDutchAuctionOffers(
          connection,
          undefined,
          mint
        );

        if(auctionInfos.length > 0){
          console.log("dutch");

          setStatusOnchain("dutch")
          setIsRefreshing(false)

        }else{
        setStatusOnchain("unlisted")

      }
    }

    setIsLoading(false)
  }
}

  const currentCollection = findCollection(
    [...collections, ...topCollections],
    collection
  )

  const goBackToCollection = (nft: any) => {
    let collectionNameFromNFT = nft.collection
    let collectionMeta =
      !!collectionNameFromNFT && JSON.parse(collectionNameFromNFT)
    const collectionName = nft.collectionName
      ? nft.collectionName
      : !!collectionMeta
      ? collectionMeta.name
      : "unverifeyed"

    if (!!collectionName) {
      history.push(`${ROUTES.COLLECTIONS}/${formatToHyphen(collectionName)}`)
    } else {
      history.push(
        `${ROUTES.COLLECTIONS}/${UNVERIFEYED_COLLECTION_OPTION.name}`
      )
    }
  }

  const search = window.location.search
  const params = new URLSearchParams(search)
  const pk = params.get("pk")

  const setNftDataFromChain = async () => {

    const nft: any = {}
    nft.mint = mint.toString()
    // TODO: think we need to make an individual api call

    let collection
    try {
      const collectionPromise = await fetch(
        `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint.toString()}`
      )
      collection = await collectionPromise.json()
    } catch (error) {
      setError(true)
    }

    nft.collectionName =
      !!collection && collection !== [] ? collection?.name : ""
    nft.collection = !!collection && collection
    nft.isVerifeyed = !!collection && collection !== []
    nft.disputedMessage =
      !!collection && collection !== [] ? collection?.disputedMessage : ""

    const contract = getEscrowFromCollectionName(endpoint, collection?.name)

    try {
      nft.metadata = await fetchMetadata(
        connection,
        new PublicKey(mint.toString()),
        contract as EscrowInfo
      )
    } catch (e) {
      setError(true)
    }
    setNft(nft);
  };

  useEffect(() => {
    if (isTokenAccountAcquired && !isRefreshing) return
    
    // this allows custom contracts to continue using escrow program for royalties. e.g. crypto idolz
    const collectionName =
      typeof collection === "string" ? collection : collection?.name
    const contract = getEscrowFromCollectionName(endpoint, collectionName)
    if (contract) {
      setCustomContract(contract)
    }

    if (!connection) return
    const getTokenAccount = async () => {
      const tokenAmount = await connection.getTokenSupply(
        new PublicKey(mint)
      )

      if (tokenAmount?.value?.uiAmount! > 1) {
        const contract = getEscrowFromCollectionName(endpoint, "global")
        setIsToken(true)
        setCustomContract(contract)
      }
    }

    setIsTokenAccountAcquired(true)
    getTokenAccount()
  }, [connection, mint, isRefreshing])

  useEffect(() => {
    if (nft) {
      let collectionNameFromNFT = nft.collection
      let collectionMeta =
        collectionNameFromNFT != "" && JSON.parse(collectionNameFromNFT)
      const collectionName = nft.collectionName
        ? nft.collectionName
        : !!collectionMeta
        ? collectionMeta.name
        : "unverifeyed"
      const contract = getEscrowFromCollectionName(endpoint, collectionName)
      if (contract) {
        setCustomContract(contract)
      }
    }
  }, [nft, isRefreshing])


  const offerPromise = async (mint:string)=>{

    let res = await fetch(GO_DE_GQL_BACKEND_URL,{
         method : 'POST',
         body: JSON.stringify(  {  query:`{
                         offers(mint: "${mint}") {
                           nodes {
                              addEpoch
                              bump
                              collection
                              contract
                              creators
                              downvotesCount
                              id
                              interval
                              is_nft
                              metadata
                              mint
                              nextClockTick
                              offerName
                              owner
                              price
                              priceStep
                              pubkey
                              reservedPrice
                              startingPrice
                              startingTimestamp
                              tags
                              token
                              upvotesCount
                              uri
                              verifeyed
                           }
                         }
                       }`,
                     variables:{}})

       })
       .then(res => res.json())

         return res.data.offers.nodes[0]
       }

  useEffect(() => {

    ;(async () => {
      const publicKey = wallet?.publicKey;
      const pubkeyString = publicKey?.toString();

      try {
        setIsLoading(true)
        const collectionName = collection
        if (mint && !isCollectionsLoading) {
          let offerInfo = {} as GraphQLOffer
          try {
            offerInfo = await offerPromise(mint)
          } catch (error) {
            console.log("offerPromise err: " + error);
            setError(true)
          }
          if (
            !!offerInfo &&
            offerInfo.contract === DIRECT_SELL_CONTRACT_ID
          ) {
            const initializerPubkey = offerInfo.owner
            const offer = {} as ActiveOffer
            offer.mint = offerInfo.mint
            offer.owner = offerInfo.owner
            offer.price = offerInfo.price / LAMPORTS_PER_SOL
            offer.contract = DIRECT_SELL_CONTRACT_ID
            offer.saleInfo = offerInfo.pubkey
            offer.initializerPubkey = initializerPubkey

            let collection
            try {
              const collectionPromise = await fetch(
                `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint.toString()}`
              )
              collection = await collectionPromise.json()
            } catch (error) {
              setError(true)
            }

            offer.collectionName =
              !!collection && collection !== [] ? collection?.name : ""
            offer.collection = !!collection && collection
            offer.isVerifeyed = !!collection && collection !== []
            offer.disputedMessage =
              !!collection && collection !== []
                ? collection?.disputedMessage
                : ""

            if (!!collection && collection.length) {
              const collectionJsonSolo =
                JSON.parse(collection).collectionId.split("#")
              if (collectionJsonSolo[0] == "solo") {
                try {
                  const artistInfo = await fetch(
                    `${GET_SOLO_USER_NO_AUTH}?${GET_SOLO_USER_NO_AUTH_QUERY_PARAM}=${collectionJsonSolo[2]}`
                  ).then((res) => res.json())
                  if (artistInfo.username) {
                    offer.artistUser = artistInfo.username
                    offer.artistVerified = artistInfo.verified
                  }
                } catch (error) {
                  console.log(error)
                }
              }
            }

            if (offerInfo.metadata) {
              offer.metadata = JSON.parse(offerInfo.metadata) as Metadata
            } else {
              try {
                offer.metadata = await fetchMetadataWithoutContract(
                  connection,
                  new PublicKey(mint.toString())
                )
              } catch (e) {
                setError(true)
              }
            }

            setIsTokenListed(true)
            setStatusOnchain("listed")
            setOffer(offer)
            setIsLoading(false)
          } else if ( !!offerInfo && offerInfo.contract == DUTCH_AUCTION_CONTRACT_ID ){
            const auctionInfos = await fetchActiveDutchAuctionOffers(connection, undefined, mint);
            if (!auctionInfos.length) {
              setNftDataFromChain();
            } else {
              const decoded = DUTCH_AUCTION_ACCOUNT_DATA_LAYOUT.decode(
                auctionInfos[0].account.data.slice(8)
              ) as DutchAuctionInfoLayout;
              const offer = {} as ActiveOffer;
              offer.mint = decoded.mintPubkey.toString();
              offer.contract = DUTCH_AUCTION_CONTRACT_ID;
              offer.saleInfo = auctionInfos[0].pubkey.toString();
              offer.startingPrice = decoded.startingPrice.toString();
              offer.reservedPrice = decoded.reservedPrice.toString();
              offer.startingTs = decoded.startingTs.toString();
              offer.priceStep = decoded.priceStep.toString();
              offer.interval = decoded.interval.toString();
              console.log("intervals :", Math.floor((Math.floor(Date.now()/1000) - offer.startingTs)/offer.interval));
              const priceDecremented = offer.startingPrice - (Math.floor((Math.floor(Date.now()/1000) - offer.startingTs)/offer.interval)*offer.priceStep);
              offer.endingTs = parseInt(offer.startingTs) + (((parseInt(offer.startingPrice) - parseInt(offer.reservedPrice))/parseInt(offer.priceStep))*parseInt(offer.interval))
              offer.price = (priceDecremented > offer.reservedPrice ? priceDecremented : offer.reservedPrice)/ LAMPORTS_PER_SOL;
              offer.owner = offerInfo.owner;

              // TODO determine price dynamically
              /* decoded.startingPrice
               * decoded.reservedPrice
               * decoded.priceStep
               * decoded.interval
               */
              let collection;
              try {
                const collectionPromise = await fetch(
                  `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint.toString()}`
                );
                collection = await collectionPromise.json();
              } catch (error) {
                setError(true);
              }

              offer.collectionName = !!collection && collection !== [] ? collection?.name : "";
              offer.collection = !!collection && collection;
              offer.isVerifeyed = !!collection && collection !== [];
              offer.disputedMessage =
                !!collection && collection !== [] ? collection?.disputedMessage : "";

              if (offerInfo.metadata) {
                offer.metadata = JSON.parse(offerInfo.metadata) as Metadata
              } else {
                try {
                  offer.metadata = await fetchMetadataWithoutContract(
                    connection,
                    new PublicKey(mint.toString())
                  );
                } catch (e) {
                  setError(true);
                }
              } 

              setOffer(offer);
              setStatusOnchain("listed");
              setIsLoading(false);


            }
          } else if ( !!offerInfo && offerInfo.contract) {

            const accounts = await fetchActiveAccountOffers(
              connection,
              escrows,
              undefined,
              mint
            )
            let collection
            let account = accounts[0]
            if (pk && accounts.length > 1) {
              const accountMatchesPK = accounts.find((account) => {
                if (!account) return
                return account.pubkey.toString() === pk
              })

              account = accountMatchesPK || account
            }

            if (accounts.length > 0) {
              setStatusOnchain("escrow")
            } else {
              setStatusOnchain("unlisted")
            }

            if (!account) {
              await setNftDataFromChain()
              setIsLoading(false)
              return
            }
            const decodedEscrowState = ESCROW_ACCOUNT_DATA_LAYOUT.decode(
              account.account.data
            ) as EscrowLayout
            const mintKey = new PublicKey(decodedEscrowState.mintPubkey)
            const offer = {} as ActiveOffer
            offer.owner = offerInfo.owner
            offer.mint = mintKey.toString()
            offer.price =
              new BN(decodedEscrowState.expectedAmount, 10, "le").toNumber() /
              LAMPORTS_PER_SOL
            offer.escrowPubkeyStr = account.pubkey.toString()

            try {
              const collectionPromise = await fetch(
                `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mintKey.toString()}`
              )
              collection = await collectionPromise.json()
            } catch (error) {
              setError(true)
            }

            offer.collectionName =
              !!collection && collection !== [] ? collection?.name : ""
            offer.collection = !!collection && collection
            offer.isVerifeyed = !!collection && collection !== []
            offer.disputedMessage =
              !!collection && collection !== []
                ? collection?.disputedMessage
                : ""

            const contract = getEscrowFromCollectionName(
              endpoint,
              collection?.name
            )

            if (!!collection && collection.length) {
              const collectionJsonSolo =
                JSON.parse(collection).collectionId.split("#")
              if (collectionJsonSolo[0] == "solo") {
                try {
                  const artistInfo = await fetch(
                    `${GET_SOLO_USER_NO_AUTH}?${GET_SOLO_USER_NO_AUTH_QUERY_PARAM}=${collectionJsonSolo[2]}`
                  ).then((res) => res.json())
                  if (artistInfo.username) {
                    offer.artistUser = artistInfo.username
                    offer.artistVerified = artistInfo.verified
                  }
                } catch (error) {
                  console.log(error)
                }
              }
            }

            if (offerInfo.metadata) {
              offer.metadata = JSON.parse(offerInfo.metadata) as Metadata
            } else {
              try {
                offer.metadata = await fetchMetadata(
                  connection,
                  new PublicKey(mintKey.toString()),
                  contract as EscrowInfo
                )
              } catch (e) {
                console.log(e)
              }
            }

            setIsTokenListed(true)
            setOffer(offer)
            setIsLoading(false)
          } else  {

            const nft: any = {}
            nft.mint = mint.toString()
            // TODO: think we need to make an individual api call

            let collection

            try {
              const collectionPromise = await fetch(
                `${BASE_URL_COLLECTIONS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${mint.toString()}`
              )

              collection = await collectionPromise.json()
            } catch (error) {
              console.log("could not fetch collection", error)
            }

            nft.collectionName =
              !!collection && collection !== [] ? collection?.name : ""
            nft.collection = !!collection && collection
            nft.isVerifeyed = !!collection && collection !== []
            nft.disputedMessage =
              !!collection && collection !== []
                ? collection?.disputedMessage
                : ""

            try {
              if (!!collection && collection.length) {
                const contract = getEscrowFromCollectionName(
                  endpoint,
                  JSON.parse(collection)?.name
                )
                const collectionJsonSolo =
                  JSON.parse(collection).collectionId.split("#")
                if (collectionJsonSolo[0] == "solo") {
                  try {
                    const artistInfo = await fetch(
                      `${GET_SOLO_USER_NO_AUTH}?${GET_SOLO_USER_NO_AUTH_QUERY_PARAM}=${collectionJsonSolo[2]}`
                    ).then((res) => res.json())
                    if (artistInfo.username) {
                      nft.artistUser = artistInfo.username
                      nft.artistVerified = artistInfo.verified
                    }
                  } catch (error) {
                    console.log(error)
                  }
                }

                if (contract) {
                  try {
                    if (contract) {
                      nft.metadata = await fetchMetadata(
                        connection,
                        new PublicKey(mint.toString()),
                        contract as EscrowInfo
                      )
                    }
                  } catch (e) {
                    console.log("could not fetch metadata", e);
                  }
                }
              }
            } catch (e) {
              console.log("solo collection fetch failed", e)
            }

            setNft(nft)
            await setNftDataFromChain()
            setIsTokenListed(false)
            setIsLoading(false)
          }

        }
      } catch (err) {
        console.log(err);

        setIsLoading(false)
      }
    })()
  }, [connection, endpoint, mint, collections, isRefreshing])

  useEffect(() => {
    if (statusOnchain === "unlisted") {
      setNftDataFromChain()
    }
  }, [statusOnchain])

  useEffect(() => {
    if (wallet?.publicKey == publicKey) return
    publicKey = wallet?.publicKey
    console.log("wallet change detected, refreshing");

    setIsLoading(true)
    refreshItem()
  }, [wallet?.publicKey])

  const nftData = statusOnchain
    ? offer && (statusOnchain == "listed" || statusOnchain == "escrow" || statusOnchain == "dutch")
      ? offer
      : nft
    : offer
    ? offer
    : nft
  const isListed = statusOnchain
    ? offer && (statusOnchain == "listed" || statusOnchain == "escrow" || statusOnchain == "dutch")
      ? true
      : false
    : offer
    ? true
    : false
  const pageTitle = nftData
    ? `${nftData?.metadata?.name} | DigitalEyes`
    : "Item | DigitalEyes"
  if (error) {
    return <ErrorView />
  }

  // TODO: fix loading=false before nftData loaded
  return (
    <Page className="md:max-w-7xl mx-auto sm:px-6 lg:px-8" title={pageTitle}>
      <div className="flex items-center justify-center sm:pt-4 sm:px-4 sm:block sm:p-0">
        {isLoading || isCollectionsLoading ? (
          <div className="flex justify-center">
            <div className="w-48">
              <LoadingWidget />
            </div>
          </div>
        ) : nftData ? (
          <NftDetails
            isVerified={currentCollection?.verifeyed}
            nftData={nftData}
            customContract={customContract}
            cancelAction={() => goBackToCollection(nftData)}
            buttonText={`Buy for ${nftData.price} SOL`}
            dialogTitle={"Buy some art"}
            cancelText={`Back to ${collection ? collection : "unverifeyed"}`}
            isListed={isListed}
            disputedMessage={nftData.disputedMessage}
            refreshItem={refreshItem}
            statusOnchain={statusOnchain}
            isToken={isToken}
            isTokenListed={isTokenListed}
            isDerivative={currentCollection?.isDerivative}
          ></NftDetails>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-2xl font-bold text-white sm:tracking-tight pt-12">
              Something went wrong.
            </div>
            <p className="text-base text-white sm:tracking-tight pb-12 mt-5">
              Please try again or double check the item url.
            </p>
            <button className="hover:text-white mx-2" onClick={refreshItem}>
              <span className="text-white self-start inline-flex items-center text-xs btn">
                <RefreshIcon className="h-4 w-4 mr-1" /> Refresh
              </span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-48">
              <LoadingWidget />
            </div>
          </div>
        )}
      </div>
    </Page>
  )
}
