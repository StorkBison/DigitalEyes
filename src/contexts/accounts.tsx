import React, { useCallback, useContext, useEffect, useState } from "react"
import { useConnection, useConnectionConfig } from "../contexts/connection"
import { useWallet } from "../contexts/wallet"
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js"
import { AccountLayout, MintInfo, MintLayout, u64 } from "@solana/spl-token"
import { TokenAccount } from "../models"
import { chunks, getAllEscrowContracts } from "../utils/utils"
import { EventEmitter } from "../utils/eventEmitter"
import { programIds, WRAPPED_SOL_MINT } from "../utils"
import { fetchActiveAccountOffers } from "../contracts/escrow"
import {
  ESCROW_ACCOUNT_DATA_LAYOUT,
  EscrowLayout,
  SALE_INFO_ACCOUNT_DATA_LAYOUT,
  SaleInfoLayout,
} from "../utils/layout"
import { fetchActiveDirectSellOffers } from "../contracts/direct-sell"
import {
  COLLECTIONS_RETRIEVER_QUERY_PARAM,
  BASE_URL_OFFERS_RETRIEVER,
  GO_DE_GQL_BACKEND_URL,
} from "../constants/urls"
import { DIRECT_SELL_CONTRACT_ID, DUTCH_AUCTION_CONTRACT_ID } from "../constants/contract_id"
import { GraphQLOffer } from "../types"

const AccountsContext = React.createContext<any>(null)

const pendingCalls = new Map<string, Promise<ParsedAccountBase>>()
const genericCache = new Map<string, ParsedAccountBase>()
const pendingMintCalls = new Map<string, Promise<MintInfo>>()
const mintCache = new Map<string, MintInfo>()

export interface ParsedAccountBase {
  pubkey: PublicKey
  account: AccountInfo<Buffer>
  info: any // TODO: change to unkown
}

export type AccountParser = (
  pubkey: PublicKey,
  data: AccountInfo<Buffer>
) => ParsedAccountBase | undefined

export interface ParsedAccount<T> extends ParsedAccountBase {
  info: T
}

const getMintInfo = async (connection: Connection, pubKey: PublicKey) => {
  const info = await connection.getAccountInfo(pubKey)
  if (info === null) {
    throw new Error("Failed to find mint account")
  }

  const data = Buffer.from(info.data)

  return deserializeMint(data)
}

export const MintParser = (pubKey: PublicKey, info: AccountInfo<Buffer>) => {
  const buffer = Buffer.from(info.data)

  const data = deserializeMint(buffer)

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: data,
  } as ParsedAccountBase

  return details
}

export const TokenAccountParser = (
  pubKey: PublicKey,
  info: AccountInfo<Buffer>
) => {
  // Sometimes a wrapped sol account gets closed, goes to 0 length,
  // triggers an update over wss which triggers this guy to get called
  // since your UI already logged that pubkey as a token account. Check for length.
  if (info.data.length > 0) {
    const buffer = Buffer.from(info.data)
    const data = deserializeAccount(buffer)

    const details = {
      pubkey: pubKey,
      account: {
        ...info,
      },
      info: data,
    } as TokenAccount

    return details
  }
}

export const GenericAccountParser = (
  pubKey: PublicKey,
  info: AccountInfo<Buffer>
) => {
  const buffer = Buffer.from(info.data)

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: buffer,
  } as ParsedAccountBase

  return details
}

export const keyToAccountParser = new Map<string, AccountParser>()

export const cache = {
  emitter: new EventEmitter(),
  query: async (
    connection: Connection,
    pubKey: string | PublicKey,
    parser?: AccountParser
  ) => {
    let id: PublicKey
    if (typeof pubKey === "string") {
      id = new PublicKey(pubKey)
    } else {
      id = pubKey
    }

    const address = id.toBase58()

    let account = genericCache.get(address)
    if (account) {
      return account
    }

    let query = pendingCalls.get(address)
    if (query) {
      return query
    }

    // TODO: refactor to use multiple accounts query with flush like behavior
    query = connection.getAccountInfo(id).then((data) => {
      if (!data) {
        throw new Error("Account not found")
      }

      return cache.add(id, data, parser)
    }) as Promise<TokenAccount>
    pendingCalls.set(address, query as any)

    return query
  },
  add: (
    id: PublicKey | string,
    obj: AccountInfo<Buffer>,
    parser?: AccountParser,
    isActive?: boolean | undefined | ((parsed: any) => boolean)
  ) => {
    const address = typeof id === "string" ? id : id?.toBase58()
    const deserialize = parser ? parser : keyToAccountParser.get(address)
    if (!deserialize) {
      throw new Error(
        "Deserializer needs to be registered or passed as a parameter"
      )
    }

    cache.registerParser(id, deserialize)
    pendingCalls.delete(address)
    const account = deserialize(new PublicKey(address), obj)
    if (!account) {
      return
    }

    if (isActive === undefined) isActive = true
    else if (isActive instanceof Function) isActive = isActive(account)

    const isNew = !genericCache.has(address)

    genericCache.set(address, account)
    cache.emitter.raiseCacheUpdated(address, isNew, deserialize, isActive)
    return account
  },
  get: (pubKey: string | PublicKey) => {
    let key: string
    if (typeof pubKey !== "string") {
      key = pubKey.toBase58()
    } else {
      key = pubKey
    }

    return genericCache.get(key)
  },
  delete: (pubKey: string | PublicKey) => {
    let key: string
    if (typeof pubKey !== "string") {
      key = pubKey.toBase58()
    } else {
      key = pubKey
    }

    if (genericCache.get(key)) {
      genericCache.delete(key)
      cache.emitter.raiseCacheDeleted(key)
      return true
    }
    return false
  },

  byParser: (parser: AccountParser) => {
    const result: string[] = []
    for (const id of keyToAccountParser.keys()) {
      if (keyToAccountParser.get(id) === parser) {
        result.push(id)
      }
    }

    return result
  },
  registerParser: (pubkey: PublicKey | string, parser: AccountParser) => {
    if (pubkey) {
      const address = typeof pubkey === "string" ? pubkey : pubkey?.toBase58()
      keyToAccountParser.set(address, parser)
    }

    return pubkey
  },
  queryMint: async (connection: Connection, pubKey: string | PublicKey) => {
    let id: PublicKey
    if (typeof pubKey === "string") {
      id = new PublicKey(pubKey)
    } else {
      id = pubKey
    }

    const address = id.toBase58()
    let mint = mintCache.get(address)
    if (mint) {
      return mint
    }

    let query = pendingMintCalls.get(address)
    if (query) {
      return query
    }

    query = getMintInfo(connection, id).then((data) => {
      pendingMintCalls.delete(address)

      mintCache.set(address, data)
      return data
    }) as Promise<MintInfo>
    pendingMintCalls.set(address, query as any)

    return query
  },
  getMint: (pubKey: string | PublicKey) => {
    let key: string
    if (typeof pubKey !== "string") {
      key = pubKey.toBase58()
    } else {
      key = pubKey
    }

    return mintCache.get(key)
  },
  addMint: (pubKey: PublicKey, obj: AccountInfo<Buffer>) => {
    const mint = deserializeMint(obj.data)
    const id = pubKey.toBase58()
    mintCache.set(id, mint)
    return mint
  },
}

export const useAccountsContext = () => {
  const context = useContext(AccountsContext)

  return context
}

function wrapNativeAccount(
  pubkey: PublicKey,
  account?: AccountInfo<Buffer>
): TokenAccount | undefined {
  if (!account) {
    return undefined
  }

  return {
    pubkey: pubkey,
    account,
    info: {
      address: pubkey,
      mint: WRAPPED_SOL_MINT,
      owner: pubkey,
      amount: new u64(account.lamports),
      delegate: null,
      delegatedAmount: new u64(0),
      isInitialized: true,
      isFrozen: false,
      isNative: true,
      rentExemptReserve: null,
      closeAuthority: null,
    },
  }
}

export const getCachedAccount = (
  predicate: (account: TokenAccount) => boolean
) => {
  for (const account of genericCache.values()) {
    if (predicate(account)) {
      return account as TokenAccount
    }
  }
}

const UseNativeAccount = () => {
  const connection = useConnection()
  const { wallet } = useWallet()

  const [nativeAccount, setNativeAccount] = useState<AccountInfo<Buffer>>()

  const updateCache = useCallback(
    (account) => {
      if (wallet && wallet.publicKey) {
        const wrapped = wrapNativeAccount(wallet.publicKey, account)
        if (wrapped !== undefined && wallet) {
          const id = wallet.publicKey?.toBase58()
          cache.registerParser(id, TokenAccountParser)
          genericCache.set(id, wrapped as TokenAccount)
          cache.emitter.raiseCacheUpdated(id, false, TokenAccountParser, true)
        }
      }
    },
    [wallet]
  )

  useEffect(() => {
    let subId = 0
    const updateAccount = (account: AccountInfo<Buffer> | null) => {
      if (account) {
        updateCache(account)
        setNativeAccount(account)
      }
    }

    ;(async () => {
      if (!connection || !wallet?.publicKey) {
        return
      }

      const account = await connection.getAccountInfo(wallet.publicKey)
      updateAccount(account)

      subId = connection.onAccountChange(wallet.publicKey, updateAccount)
    })()

    return () => {
      if (subId) {
        connection.removeAccountChangeListener(subId)
      }
    }
  }, [setNativeAccount, wallet, wallet?.publicKey, connection, updateCache])

  return { nativeAccount }
}

const PRECACHED_OWNERS = new Set<string>()
const precacheUserTokenAccounts = async (
  connection: Connection,
  owner?: PublicKey
) => {
  if (!owner) {
    return
  }

  // used for filtering account updates over websocket
  PRECACHED_OWNERS.add(owner.toBase58())

  // user accounts are updated via ws subscription
  const accounts = await connection.getTokenAccountsByOwner(owner, {
    programId: programIds().token,
  })
  accounts.value.forEach((info) => {
    cache.add(info.pubkey.toBase58(), info.account, TokenAccountParser)
  })
}

export function AccountsProvider({ children = null as any }) {
  const connection = useConnection()
  const { wallet, connected } = useWallet()
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([])
  const [userAccounts, setUserAccounts] = useState<TokenAccount[]>([])
  const [listedMintsFromEscrow, setListedMintsFromEscrow] = useState<string[]>(
    []
  )
  const [mintsInWalletUnlisted, setMintsInWalletUnlisted] = useState<string[]>(
    []
  )
  const [listedMintsFromDirectSell, setListedMintsFromDirectSell] = useState<
    string[]
  >([])
  const [listedMintsFromDutch, setListedMintsFromDutch] = useState<
    string[]
  >([])
  const { nativeAccount } = UseNativeAccount()
  const { endpoint } = useConnectionConfig()
  const escrows = getAllEscrowContracts(endpoint)
  const selectUserAccounts = useCallback(() => {
    return cache
      .byParser(TokenAccountParser)
      .map((id) => cache.get(id))
      .filter(
        (a) => a && a.info.owner.toBase58() === wallet?.publicKey?.toBase58()
      )
      .map((a) => a as TokenAccount)
  }, [wallet])

  useEffect(() => {
    const accounts = selectUserAccounts().filter(
      (a) => a !== undefined
    ) as TokenAccount[]

    if (accounts.length == useAccountsContext.length) {
      if (accounts.length == 0) return
      let equal = true
      for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].pubkey.toBase58() != userAccounts[i].pubkey.toBase58()) {
          equal = false
          break
        }
      }

      if (equal) return
    }
    setUserAccounts(accounts)
  }, [nativeAccount, wallet, tokenAccounts, selectUserAccounts])

  useEffect(() => {
    // checks if the current item is present in active listed items from wallet, if so changed the btn
    ;(async () => {
      const activeListingsFromWallet: React.SetStateAction<string[]> = []
      if (wallet?.publicKey) {
        let res = await fetch(GO_DE_GQL_BACKEND_URL,{
          method : 'POST',
          body: JSON.stringify({
            query:`{
              offers(owner: "${wallet.publicKey?.toString()}") {
                nodes {
                  contract
                  mint
                }
              }
            }`,
            variables:{}})
        })
        .then(res => res.json())
 
        
        res.data.offers.nodes.forEach((offer:GraphQLOffer) => {
          for (let i = 0; i < escrows.length; i++) {
            if (offer.contract == escrows[i].escrowProgram) {
              activeListingsFromWallet.push(offer.mint)
            } 
          }
        })


        // const activeListingForWallet = await fetchActiveAccountOffers(
        //   connection,
        //   escrows,
        //   wallet.publicKey?.toString()
        // )
        // for (let index = 0; index < activeListingForWallet.length; index++) {
        //   const account = activeListingForWallet[index]
        //   if (!account) return
        //   const decodedEscrowState = ESCROW_ACCOUNT_DATA_LAYOUT.decode(
        //     account.account.data
        //   ) as EscrowLayout
        //   const mint = new PublicKey(decodedEscrowState.mintPubkey)
        //   activeListingsFromWallet.push(mint.toString())
        // }
        setListedMintsFromEscrow(activeListingsFromWallet)
      }
    })()
  }, [connected])

const publicKey=wallet?.publicKey
const pubkeyString = publicKey?.toString()

useEffect(() => {
  ;(async () => {
    const unlistedMintsFromWallet: string[] = []
    const listedMintsFromDirectSell: string[] = []
    const listedMintsFromDutch: string[] = []
    const userAccountsFiltered = await userAccounts.filter((account) => {
      return account.info.amount.toNumber() > 0
    })
    
    await Promise.all(
      userAccountsFiltered.map(async (account) => {
        try {
          let res = await fetch(GO_DE_GQL_BACKEND_URL,{
            method : 'POST',
            body: JSON.stringify({
              query:`{
                offers(mint: "${account.info.mint.toString()}") {
                  nodes {
                    contract
                  }
                }
              }`,
              variables:{}})
          })
          .then(res => res.json())
    
          if (res.data.offers.nodes.length > 0) {
            const offerInfo = res.data.offers.nodes[0]
            console.log("offerInfo: " + offerInfo)

            // const offerPromise = await fetch(
            //   `${BASE_URL_OFFERS_RETRIEVER}?${COLLECTIONS_RETRIEVER_QUERY_PARAM}=${account.info.mint.toString()}`
            // )
            // const offerInfo = await offerPromise.json()
            // const saleInfos = await fetchActiveDirectSellOffers(
            //   connection,
            //   undefined,
            //   account.info.mint.toString()
            // )

            // console.log( offerInfo );
            if (
              offerInfo.contract &&
              offerInfo.contract == DIRECT_SELL_CONTRACT_ID
            ) {
              // const decodedSaleInfo = SALE_INFO_ACCOUNT_DATA_LAYOUT.decode(
              //     saleInfos[0].account.data.slice(8)
              //   ) as SaleInfoLayout;
              // if( decodedSaleInfo ) {
              // console.log( decodedSaleInfo );
              listedMintsFromDirectSell.push(account.info.mint.toString())
            } else if(
              offerInfo.contract &&
              offerInfo.contract == DUTCH_AUCTION_CONTRACT_ID &&
              offerInfo.owner == pubkeyString
            ) {
              listedMintsFromDutch.push(account.info.mint.toString())
            }
          } else {
            unlistedMintsFromWallet.push(account.info.mint.toString())
          }
        } catch {
          unlistedMintsFromWallet.push(account.info.mint.toString())
        }
      })
    )

    setMintsInWalletUnlisted(unlistedMintsFromWallet)
    setListedMintsFromDirectSell(listedMintsFromDirectSell)
    setListedMintsFromDutch(listedMintsFromDutch)
  })()
}, [connected, userAccounts])

  useEffect(() => {
    const subs: number[] = []
    cache.emitter.onCache((args) => {
      if (args.isNew && args.isActive) {
        let id = args.id
        let deserialize = args.parser
        if (connection) {
          try {
            connection.onAccountChange(new PublicKey(id), (info) => {
              cache.add(id, info, deserialize)
            })
          } catch (err) {
            console.log(err)
          }
        }
      }
    })

    return () => {
      if (connection) {
        subs.forEach((id) => connection.removeAccountChangeListener(id))
      }
    }
  }, [connection])

  useEffect(() => {
    if (!connection || !publicKey) {
      setTokenAccounts([])
    } else {
      precacheUserTokenAccounts(connection, publicKey).then(() => {
        setTokenAccounts(selectUserAccounts())
      })

      // This can return different types of accounts: token-account, mint, multisig
      // TODO: web3.js expose ability to filter.
      // this should use only filter syntax to only get accounts that are owned by user
      const tokenSubID = connection.onProgramAccountChange(
        programIds().token,
        (info) => {
          // TODO: fix type in web3.js
          const id = info.accountId as unknown as string
          // TODO: do we need a better way to identify layout (maybe a enum identifing type?)
          if (info.accountInfo.data.length === AccountLayout.span) {
            const data = deserializeAccount(info.accountInfo.data)

            if (PRECACHED_OWNERS.has(data.owner.toBase58())) {
              cache.add(id, info.accountInfo, TokenAccountParser)
              setTokenAccounts(selectUserAccounts())
            }
          }
        },
        "confirmed"
      )

      return () => {
        connection.removeProgramAccountChangeListener(tokenSubID)
      }
    }
  }, [connection, connected, publicKey, selectUserAccounts])

  return (
    <AccountsContext.Provider
      value={{
        userAccounts,
        nativeAccount,
        listedMintsFromEscrow,
        mintsInWalletUnlisted,
        listedMintsFromDirectSell,
        listedMintsFromDutch,
        setListedMintsFromDirectSell,
        setListedMintsFromDutch,
        setListedMintsFromEscrow,
        setMintsInWalletUnlisted,
      }}
    >
      {children}
    </AccountsContext.Provider>
  )
}

export function useNativeAccount() {
  const context = useContext(AccountsContext)
  return {
    account: context.nativeAccount as AccountInfo<Buffer>,
  }
}

export const getMultipleAccounts = async (
  connection: any,
  keys: string[],
  commitment: string
) => {
  const result = await Promise.all(
    chunks(keys, 99).map((chunk) =>
      getMultipleAccountsCore(connection, chunk, commitment)
    )
  )

  const array = result
    .map(
      (a) =>
        a.array.map((acc) => {
          if (!acc) {
            return undefined
          }

          const { data, ...rest } = acc
          const obj = {
            ...rest,
            data: Buffer.from(data[0], "base64"),
          } as AccountInfo<Buffer>
          return obj
        }) as AccountInfo<Buffer>[]
    )
    .flat()
  return { keys, array }
}

const getMultipleAccountsCore = async (
  connection: any,
  keys: string[],
  commitment: string
) => {
  const args = connection._buildArgs([keys], commitment, "base64")

  const unsafeRes = await connection._rpcRequest("getMultipleAccounts", args)
  if (unsafeRes.error) {
    throw new Error(
      "failed to get info about account " + unsafeRes.error.message
    )
  }

  if (unsafeRes.result.value) {
    const array = unsafeRes.result.value as AccountInfo<string[]>[]
    return { keys, array }
  }

  // TODO: fix
  throw new Error()
}

export function useMint(key?: string | PublicKey) {
  const connection = useConnection()
  const [mint, setMint] = useState<MintInfo>()

  const id = typeof key === "string" ? key : key?.toBase58()

  useEffect(() => {
    if (!id) {
      return
    }

    cache
      .query(connection, id, MintParser)
      .then((acc) => setMint(acc.info as any))
      .catch((err) => console.log(err))

    const dispose = cache.emitter.onCache((e) => {
      const event = e
      if (event.id === id) {
        cache
          .query(connection, id, MintParser)
          .then((mint) => setMint(mint.info as any))
      }
    })
    return () => {
      dispose()
    }
  }, [connection, id])

  return mint
}

export function useAccount(pubKey?: PublicKey) {
  const connection = useConnection()
  const [account, setAccount] = useState<TokenAccount>()

  const key = pubKey?.toBase58()
  useEffect(() => {
    const query = async () => {
      try {
        if (!key) {
          return
        }

        const acc = await cache
          .query(connection, key, TokenAccountParser)
          .catch((err) => console.log(err))
        if (acc) {
          setAccount(acc)
        }
      } catch (err) {
        console.error(err)
      }
    }

    query()

    const dispose = cache.emitter.onCache((e) => {
      const event = e
      if (event.id === key) {
        query()
      }
    })
    return () => {
      dispose()
    }
  }, [connection, key])

  return account
}

// TODO: expose in spl package
export const deserializeAccount = (data: Buffer) => {
  const accountInfo = AccountLayout.decode(data)
  accountInfo.mint = new PublicKey(accountInfo.mint)
  accountInfo.owner = new PublicKey(accountInfo.owner)
  accountInfo.amount = u64.fromBuffer(accountInfo.amount)

  if (accountInfo.delegateOption === 0) {
    accountInfo.delegate = null
    accountInfo.delegatedAmount = new u64(0)
  } else {
    accountInfo.delegate = new PublicKey(accountInfo.delegate)
    accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount)
  }

  accountInfo.isInitialized = accountInfo.state !== 0
  accountInfo.isFrozen = accountInfo.state === 2

  if (accountInfo.isNativeOption === 1) {
    accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative)
    accountInfo.isNative = true
  } else {
    accountInfo.rentExemptReserve = null
    accountInfo.isNative = false
  }

  if (accountInfo.closeAuthorityOption === 0) {
    accountInfo.closeAuthority = null
  } else {
    accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority)
  }

  return accountInfo
}

// TODO: expose in spl package
export const deserializeMint = (data: Buffer) => {
  if (data.length !== MintLayout.span) {
    throw new Error("Not a valid Mint")
  }

  const mintInfo = MintLayout.decode(data)

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority)
  }

  mintInfo.supply = u64.fromBuffer(mintInfo.supply)
  mintInfo.isInitialized = mintInfo.isInitialized !== 0

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority)
  }

  return mintInfo as MintInfo
}
