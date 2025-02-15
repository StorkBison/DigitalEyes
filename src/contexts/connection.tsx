import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { sleep, useLocalStorageState, setProgramIds } from "../utils"
import {
  Account,
  clusterApiUrl,
  Connection,
  Commitment,
  Keypair,
  Transaction,
  TransactionInstruction,
  Blockhash,
  FeeCalculator,
  TransactionSignature,
  SimulatedTransactionResponse,
  RpcResponseAndContext,
  SignatureStatus,
} from "@solana/web3.js"
import { tokenAuthFetchMiddleware } from "@strata-foundation/web3-token-auth"
import * as APIURL from "../constants/urls"

import { Notification } from "../components/Notification"
import { toast } from "react-toastify"
import { WalletAdapter } from "./wallet"
import { WalletSigner } from "./wallet0"
import {
  TokenListProvider,
  ENV as ChainID,
  TokenInfo,
} from "@solana/spl-token-registry"
import { WalletNotConnectedError } from "@solana/wallet-adapter-base"

interface BlockhashAndFeeCalculator {
  blockhash: Blockhash
  feeCalculator: FeeCalculator
}
export type ENV = "mainnet" | "testnet" | "devnet" | "localnet"

export const ENDPOINTS = [
  {
    name: "mainnet" as ENV,
    endpoint: "https://digitaleyes.genesysgo.net/",
    chainID: ChainID.MainnetBeta,
  },
  {
    name: "testnet" as ENV,
    endpoint: clusterApiUrl("testnet"),
    chainID: ChainID.Testnet,
  },
  {
    name: "devnet" as ENV,
    endpoint: clusterApiUrl("devnet"),
    chainID: ChainID.Devnet,
  },
  {
    name: "localnet" as ENV,
    endpoint: "http://127.0.0.1:8899",
    chainID: ChainID.Devnet,
  },
]

const DEFAULT = ENDPOINTS[0].endpoint
const DEFAULT_SLIPPAGE = 0.25

interface ConnectionConfig {
  connection: Connection | undefined
  sendConnection?: Connection | undefined
  endpoint: string
  slippage: number
  setSlippage: (val: number) => void
  env: ENV
  setEndpoint: (val: string) => void
  tokens: TokenInfo[]
  tokenMap: Map<string, TokenInfo>
}

const ConnectionContext = React.createContext<ConnectionConfig>({
  endpoint: DEFAULT,
  setEndpoint: () => {},
  slippage: DEFAULT_SLIPPAGE,
  setSlippage: (val: number) => {},
  connection: undefined,
  sendConnection: undefined,
  env: ENDPOINTS[0].name,
  tokens: [],
  tokenMap: new Map<string, TokenInfo>(),
})

export function ConnectionProvider({ children = undefined as any }) {
  const [endpoint, setEndpoint] = useLocalStorageState(
    "connectionEndpoint",
    ENDPOINTS[0].endpoint
  )

  const [slippage, setSlippage] = useLocalStorageState(
    "slippage",
    DEFAULT_SLIPPAGE.toString()
  )

  const [connection, setConnection] = useState<Connection | undefined>(
    undefined
  )
  const [sendConnection, setSendConnection] = useState<Connection | undefined>(
    undefined
  )

  const chain =
    ENDPOINTS.find((end) => end.endpoint === endpoint) || ENDPOINTS[0]
  const env = chain.name

  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map())

  async function getToken(): Promise<string> {
    // Logic to get an auth token
    const req = await fetch(APIURL.GENESYSGO_AUTH)
    const { access_token }: { access_token: string } = await req.json()
    // console.log("token is", access_token)
    return access_token
  }

  //not sure if the tokenExpiry is measured in milliseconds

  useEffect(() => {
    if (endpoint && !connection && !sendConnection) {
      setConnection(
        new Connection(endpoint)
      )
      setSendConnection(
        new Connection(endpoint)
      )
    }
  }, [endpoint])

  useEffect(() => {
    // fetch token files
    new TokenListProvider().resolve().then((container) => {
      const list = container
        .excludeByTag("nft")
        .filterByChainId(
          ENDPOINTS.find((end) => end.endpoint === endpoint)?.chainID ||
            ChainID.MainnetBeta
        )
        .getList()

      const knownMints = [...list].reduce((map, item) => {
        map.set(item.address, item)
        return map
      }, new Map<string, TokenInfo>())

      setTokenMap(knownMints)
      setTokens(list)
    })
  }, [env])

  // The websocket library solana/web3.js uses closes its websocket connection when the subscription list
  // is empty after opening its first time, preventing subsequent subscriptions from receiving responses.
  // This is a hack to prevent the list from every getting empty
  useEffect(() => {
    let id: number
    if (connection) {
      try {
        id = connection.onAccountChange(Keypair.generate().publicKey, () => {})
      } catch (err) {
        console.log(err)
      }
    }

    return () => {
      if (connection) {
        connection.removeAccountChangeListener(id)
      }
    }
  }, [connection])

  useEffect(() => {
    let id: number
    if (connection) {
      id = connection.onSlotChange(() => null)
    }
    return () => {
      if (connection) {
        connection.removeSlotChangeListener(id)
      }
    }
  }, [connection])

  return (
    <ConnectionContext.Provider
      value={{
        endpoint,
        setEndpoint,
        slippage: parseFloat(slippage),
        setSlippage: (val) => setSlippage(val.toString()),
        connection: connection,
        sendConnection: sendConnection,
        tokens,
        tokenMap,
        env,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  )
}

export function useConnection() {
  return useContext(ConnectionContext).connection as Connection
}

export function useSendConnection() {
  return useContext(ConnectionContext)?.sendConnection
}

export function useConnectionConfig() {
  const context = useContext(ConnectionContext)
  return {
    endpoint: context.endpoint,
    setEndpoint: context.setEndpoint,
    env: context.env,
    tokens: context.tokens,
    tokenMap: context.tokenMap,
  }
}

export function useSlippageConfig() {
  const { slippage, setSlippage } = useContext(ConnectionContext)
  return { slippage, setSlippage }
}

const getErrorForTransaction = async (connection: Connection, txid: string) => {
  // wait for all confirmation before geting transaction
  await connection.confirmTransaction(txid, "max")

  const tx = await connection.getParsedConfirmedTransaction(txid)

  const errors: string[] = []
  if (tx?.meta && tx.meta.logMessages) {
    tx.meta.logMessages.forEach((log) => {
      const regex = /Error: (.*)/gm
      let m
      while ((m = regex.exec(log)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++
        }

        if (m.length > 1) {
          errors.push(m[1])
        }
      }
    })
  }

  return errors
}

export const sendTransaction = async (
  connection: Connection,
  wallet: WalletAdapter,
  instructions: TransactionInstruction[],
  signers: Account[] | Keypair[],
  awaitConfirmation = true
) => {
  if (!wallet?.publicKey) {
    throw new Error("Wallet is not connected")
  }
  console.log("transaction send");

  let transaction = new Transaction()
  instructions.forEach((instruction) => transaction.add(instruction))
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash("max")
  ).blockhash
  transaction.setSigners(
    // fee payied by the wallet owner
    wallet.publicKey,
    ...signers.map((s: { publicKey: any }) => s.publicKey)
  )
  console.log(transaction.recentBlockhash);

  if (signers.length > 0) {
    transaction.partialSign(...signers)
  }
  transaction = await wallet.signTransaction(transaction)
  const rawTransaction = transaction.serialize()
  let options = {
    skipPreflight: true,
    commitment: "confirmed",
  }

  const txid = await connection.sendRawTransaction(rawTransaction, options)
  console.log(txid)

  if (awaitConfirmation) {
    const status = (await connection.confirmTransaction(txid, "max")).value
    console.log(status)
    if (status?.err) {
      const errors = await getErrorForTransaction(connection, txid)
      toast.error(
        <Notification title="Transaction failed..." description={errors} />
      )

      throw new Error(
        `Raw transaction ${txid} failed (${JSON.stringify(status)})`
      )
    } else {
      return txid
    }
  } else {
    return txid
  }
}
export const sendTransactionWithRetry = async (
  connection: Connection,
  wallet: WalletSigner | any,
  instructions: TransactionInstruction[],
  signers: Keypair[],
  commitment: Commitment = "confirmed",
  includesFeePayer: boolean = false,
  block?: BlockhashAndFeeCalculator,
  beforeSend?: () => void
) => {
  if (!wallet.publicKey) throw new WalletNotConnectedError()

  let transaction = new Transaction()
  instructions.forEach((instruction) => transaction.add(instruction))
  console.log(transaction)

  transaction.recentBlockhash = (
    block || (await connection.getRecentBlockhash(commitment))
  ).blockhash
  console.log(transaction.recentBlockhash)

  if (includesFeePayer) {
    transaction.setSigners(...signers.map((s) => s.publicKey))
  } else {
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    )
  }

  if (signers.length > 0) {
    transaction.partialSign(...signers)
  }
  if (!includesFeePayer) {
    //@ts-ignore
    transaction = await wallet.signTransaction(transaction)
  }

  if (beforeSend) {
    beforeSend()
  }

  const { txid, slot } = await sendSignedTransaction({
    connection,
    signedTransaction: transaction,
  })

  return { txid, slot }
}

export const getUnixTs = () => {
  return new Date().getTime() / 1000
}

const DEFAULT_TIMEOUT = 15000

export async function sendSignedTransaction({
  signedTransaction,
  connection,
  timeout = DEFAULT_TIMEOUT,
}: {
  signedTransaction: Transaction
  connection: Connection
  sendingMessage?: string
  sentMessage?: string
  successMessage?: string
  timeout?: number
}): Promise<{ txid: string; slot: number }> {
  const rawTransaction = signedTransaction.serialize()
  const startTime = getUnixTs()
  let slot = 0
  const txid: TransactionSignature = await connection.sendRawTransaction(
    rawTransaction,
    {
      skipPreflight: true,
    }
  )

  alert("yo")

  console.log("Started awaiting confirmation for", txid)

  let done = false
  ;(async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      })
      await sleep(500)
    }
  })()
  try {
    const confirmation = await awaitTransactionSignatureConfirmation(
      txid,
      timeout,
      connection,
      "recent",
      true
    )

    if (!confirmation)
      throw new Error("Timed out awaiting confirmation on transaction")

    if (confirmation.err) {
      console.error(confirmation.err)
      throw new Error("Transaction failed: Custom instruction error")
    }

    slot = confirmation?.slot || 0
  } catch (err: any) {
    console.error("Timeout Error caught", err)
    if (err.timeout) {
      throw new Error("Timed out awaiting confirmation on transaction")
    }
    let simulateResult: SimulatedTransactionResponse | null = null
    try {
      simulateResult = (
        await simulateTransaction(connection, signedTransaction, "single")
      ).value
    } catch (e) {}
    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i]
          if (line.startsWith("Program log: ")) {
            throw new Error(
              "Transaction failed: " + line.slice("Program log: ".length)
            )
          }
        }
      }
      throw new Error(JSON.stringify(simulateResult.err))
    }
    // throw new Error('Transaction failed');
  } finally {
    done = true
  }

  console.log("Latency", txid, getUnixTs() - startTime)
  return { txid, slot }
}

async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  timeout: number,
  connection: Connection,
  commitment: Commitment = "recent",
  queryStatus = false
): Promise<SignatureStatus | null | void> {
  let done = false
  let status: SignatureStatus | null | void = {
    slot: 0,
    confirmations: 0,
    err: null,
  }
  let subId = 0
  status = await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      if (done) {
        return
      }
      done = true
      console.log("Rejecting for timeout...")
      reject({ timeout: true })
    }, timeout)
    try {
      subId = connection.onSignature(
        txid,
        (result, context) => {
          done = true
          status = {
            err: result.err,
            slot: context.slot,
            confirmations: 0,
          }
          if (result.err) {
            console.log("Rejected via websocket", result.err)
            reject(status)
          } else {
            console.log("Resolved via websocket", result)
            resolve(status)
          }
        },
        commitment
      )
    } catch (e) {
      done = true
      console.error("WS error in setup", txid, e)
    }
    while (!done && queryStatus) {
      // eslint-disable-next-line no-loop-func
      ;(async () => {
        try {
          const signatureStatuses = await connection.getSignatureStatuses([
            txid,
          ])
          status = signatureStatuses && signatureStatuses.value[0]
          if (!done) {
            if (!status) {
              console.log("REST null result for", txid, status)
            } else if (status.err) {
              console.log("REST error for", txid, status)
              done = true
              reject(status.err)
            } else if (!status.confirmations) {
              console.log("REST no confirmations for", txid, status)
            } else {
              console.log("REST confirmation for", txid, status)
              done = true
              resolve(status)
            }
          }
        } catch (e) {
          if (!done) {
            console.log("REST connection error: txid", txid, e)
          }
        }
      })()
      await sleep(2000)
    }
  })

  //@ts-ignore
  if (connection._signatureSubscriptions[subId])
    connection.removeSignatureListener(subId)
  done = true
  console.log("Returning status", status)
  return status
}

async function simulateTransaction(
  connection: Connection,
  transaction: Transaction,
  commitment: Commitment
): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
  // @ts-ignore
  transaction.recentBlockhash = await connection._recentBlockhash(
    // @ts-ignore
    connection._disableBlockhashCaching
  )

  const signData = transaction.serializeMessage()
  // @ts-ignore
  const wireTransaction = transaction._serialize(signData)
  const encodedTransaction = wireTransaction.toString("base64")
  const config: any = { encoding: "base64", commitment }
  const args = [encodedTransaction, config]

  // @ts-ignore
  const res = await connection._rpcRequest("simulateTransaction", args)
  if (res.error) {
    throw new Error("failed to simulate transaction: " + res.error.message)
  }
  return res.result
}
