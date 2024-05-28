import * as anchor from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { 
  programs 
} from '@metaplex/js'
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  ConfirmOptions,
} from "@solana/web3.js";
import axios from "axios"
const idl = require('./bid_contract.json')

const buySellProgramId = new PublicKey("DfDkzP6PVpoooumypiK3Rkygg693sJnhnhgnrkXkGMCr")
const PREFIX = "offermaker";
const { metadata: { Metadata } } = programs
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
)
const confirmOption : ConfirmOptions = {
    commitment : 'finalized',
    preflightCommitment : 'finalized',
    skipPreflight : false
}
const BIDDATA_SIZE = 8 + 32 + 32 + 32 + 8 + 1 + 8 + 8;

const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey,
  walletAddress: anchor.web3.PublicKey,
  splTokenMintAddress: anchor.web3.PublicKey
    ) => {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
    { pubkey: walletAddress, isSigner: false, isWritable: false },
    { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new anchor.web3.TransactionInstruction({
    keys,
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
}

const getMetadata = async (
  mint: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
};

const getTokenWallet = async (
  wallet: anchor.web3.PublicKey,
  mint: anchor.web3.PublicKey
    ) => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
};

export async function sendTransaction(
  wallet: any,
  conn: any,
  transaction : Transaction,
  signers : Keypair[],
) {
  console.log("+send Transaction")
    transaction.feePayer = wallet.publicKey
    transaction.recentBlockhash = (await conn.getRecentBlockhash('max')).blockhash;
    transaction.setSigners(wallet.publicKey,...signers.map(s => s.publicKey));
    if(signers.length != 0)
      transaction.partialSign(...signers)
    const signedTransaction = await wallet.signTransaction(transaction);
    let hash = await conn.sendRawTransaction(await signedTransaction.serialize());
    await conn.confirmTransaction(hash);
}
export async function deposit(
  conn: any,
  wallet: any,
  _amount: any,
  ){
  console.log("+ deposit")
  let provider = new anchor.Provider(conn, wallet as any, confirmOption)
  let program = new anchor.Program(idl,buySellProgramId,provider)
  let biddingWallet = await findBiddingWallet(conn, wallet)
  let signers : Keypair[] = []
  let transaction = new Transaction()

  if (biddingWallet === null) {
    let biddingWalletData = Keypair.generate()
    let nonceAccount = Keypair.generate()
  
    signers.push(biddingWalletData)
    signers.push(nonceAccount)
    let [vault, bump] = await PublicKey.findProgramAddress( [ Buffer.from(PREFIX) ], buySellProgramId )
  
    transaction.add(
      program.instruction.initBiddingWallet(
        bump,
        new anchor.BN(_amount * anchor.web3.LAMPORTS_PER_SOL),
        {
          accounts:{
            signer : wallet.publicKey,
            vault : vault,
            biddingWalletData: biddingWalletData.publicKey,
            nonceAccount : nonceAccount.publicKey,
            systemProgram : anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            recentBlockhash: anchor.web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          }
        }
      )
    )
  } else {
  
    transaction.add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: biddingWallet.data.nonceAccount,
        lamports: _amount * anchor.web3.LAMPORTS_PER_SOL,
      })
    )
  }

  await sendTransaction(wallet, conn, transaction, signers)
}

export async function findBiddingWallet(
  conn: any,
  wallet: any,
) {
  let provider = new anchor.Provider(conn, wallet as any, confirmOption)
  let program = new anchor.Program(idl, buySellProgramId, provider)

  let resp = await conn.getProgramAccounts(buySellProgramId,{
    dataSlice: {length: 0, offset: 0},
    filters: [
      {
        dataSize: 72
      },
      {
        memcmp:
        {
          offset: 8,
          bytes: wallet!.publicKey.toBase58()
        }
      },
    ]
  })
  for(let dataAccount of resp){
    let biddingWalletData = await program.account.biddingWalletData.fetch(dataAccount.pubkey)
    console.log(biddingWalletData)
    return {
      address: dataAccount.pubkey,
      data: biddingWalletData,
    }
  }
  return null
}


export async function withdraw(
  conn: any,
  wallet: any,
  _amount: any,
  ){
  console.log("+ withdraw")
  let provider = new anchor.Provider(conn, wallet as any, confirmOption)
  let program = new anchor.Program(idl,buySellProgramId,provider)
  const biddingWallet = await findBiddingWallet(conn, wallet)
  if(biddingWallet == null) {
    return
  }

  let transaction = new Transaction()
  let [vault, bump] = await PublicKey.findProgramAddress( [ Buffer.from(PREFIX) ], buySellProgramId )
console.log(vault.toBase58())
  transaction.add(
    program.instruction.withdrawFromBiddingWallet(
      bump,
      new anchor.BN(_amount * anchor.web3.LAMPORTS_PER_SOL),
      {
        accounts:{
          signer : wallet.publicKey,
          vault : vault,
          biddingWalletData: biddingWallet.address,
          nonceAccount : biddingWallet.data.nonceAccount,
          systemProgram : anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          recentBlockhash: anchor.web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
        }
      }
    )
  )
  await sendTransaction(wallet, conn, transaction,[])
}

export async function makeOffer(
  conn: any,
  wallet: any,
  _bid_amount: any,
  _nft_mint: PublicKey,
  _expire_time: any,
){
	console.log("+ make offer")
	let provider = new anchor.Provider(conn, wallet as any, confirmOption)
  let program = new anchor.Program(idl, buySellProgramId, provider)
  let resp = await conn.getProgramAccounts(buySellProgramId,{
    dataSlice: {length: 0, offset: 0},
    filters: [
      {
        dataSize: BIDDATA_SIZE
      },
      {
        memcmp:
        {
          offset:8,
          bytes: _nft_mint.toBase58()
        }
      },
      {
        memcmp:
        {
          offset:72,
          bytes: wallet.publicKey.toBase58()
        }
      },
    ]
  })
  if(resp.length === 0) {
    const bidData = Keypair.generate()
    const biddingWallet = await findBiddingWallet(conn, wallet)
    if(biddingWallet === null) return false
    let [vault, bump] = await PublicKey.findProgramAddress( [ Buffer.from(PREFIX) ], buySellProgramId )
  
    let transaction = new Transaction()
    let signers : Keypair[] = []
    signers.push(bidData)
    transaction.add(
      program.instruction.makeOffer(
        bump,
        new anchor.BN(_bid_amount * (10 ** 9) ),
        new anchor.BN(_expire_time),
        {
        accounts: {
          signer : wallet.publicKey,
          bidData : bidData.publicKey,
          vault : vault,
          biddingWalletData: biddingWallet!.address,
          nftMint: _nft_mint,
          nonceAccount : biddingWallet!.data.nonceAccount,
          systemProgram : anchor.web3.SystemProgram.programId,
          clock : anchor.web3.SYSVAR_CLOCK_PUBKEY
        }
      })
    )
    await sendTransaction(wallet, conn, transaction, signers)
    return true
  } else {

    let [vault, bump] = await PublicKey.findProgramAddress( [ Buffer.from(PREFIX) ], buySellProgramId )

    let transaction = new Transaction()
    transaction.add(
      program.instruction.amendOffer(
        bump,
        new anchor.BN(_bid_amount * (10 ** 9) ),
        new anchor.BN(_expire_time),
        {
        accounts: {
          owner : wallet.publicKey,
          vault : vault,
          bidData : resp[0].pubkey,
          clock : anchor.web3.SYSVAR_CLOCK_PUBKEY
        }
      })
    )
    await sendTransaction(wallet, conn, transaction, [])
    return true
  }
  
}

export async function amendOffer(
  conn: any,
  wallet: any,
  _bid_amount: any,
  _bid_data: PublicKey,
  _expire_time: any,
){
	console.log("+ amend offer")
	let provider = new anchor.Provider(conn, wallet as any, confirmOption)
  let program = new anchor.Program(idl, buySellProgramId, provider)
  const biddingWallet = await findBiddingWallet(conn, wallet)

  let [vault, bump] = await PublicKey.findProgramAddress( [ Buffer.from(PREFIX) ], buySellProgramId )

  let transaction = new Transaction()
  transaction.add(
    program.instruction.amendOffer(
      bump,
      new anchor.BN(_bid_amount * (10 ** 9) ),
      new anchor.BN(_expire_time),
      {
      accounts: {
        owner : wallet.publicKey,
        vault : vault,
        bidData : _bid_data,
        clock : anchor.web3.SYSVAR_CLOCK_PUBKEY
      }
    })
  )
  await sendTransaction(wallet, conn, transaction, [])
}

export async function cancelOffer(
  conn: any,
  wallet: any,
  bidData: any
	){
	console.log("+ Cancel Offer")
	let provider = new anchor.Provider(conn, wallet as any, confirmOption)
  let program = new anchor.Program(idl, buySellProgramId, provider)

  let transaction = new Transaction()
  transaction.add(
    program.instruction.cancelOffer(
      {
      accounts: {
        owner : wallet.publicKey,
        bidData : bidData,
      }
    })
  )
  await sendTransaction(wallet, conn, transaction, [])
}

export async function rejectOffer(
  conn: any,
  wallet: any,
  bidData: any
	){
	console.log("+ reject Offer")
	let provider = new anchor.Provider(conn, wallet as any, confirmOption)
  let program = new anchor.Program(idl, buySellProgramId, provider)

  let transaction = new Transaction()
  transaction.add(
    program.instruction.rejectOffer(
      {
      accounts: {
        owner : wallet.publicKey,
        bidData : bidData,
      }
    })
  )
  await sendTransaction(wallet, conn, transaction, [])
}


export async function amendOfferBatch(
  conn: any,
  wallet: any,
  datas: any,
  amount: number,
){
	console.log("+ amend offers", datas)
	let provider = new anchor.Provider(conn, wallet as any, confirmOption)
  let program = new anchor.Program(idl, buySellProgramId, provider)

  let [vault, bump] = await PublicKey.findProgramAddress( [ Buffer.from(PREFIX) ], buySellProgramId )

  let transaction = new Transaction()
  for(var i = 0; i < datas.length; i ++) {
    transaction.add(
      program.instruction.amendOffer(
        bump,
        new anchor.BN(amount * (10 ** 9) ),
        new anchor.BN(datas[i].expireTime),
        {
        accounts: {
          owner : wallet.publicKey,
          vault : vault,
          bidData : datas[i].bidData,
          clock : anchor.web3.SYSVAR_CLOCK_PUBKEY
        }
      })
    )
  }
 
  await sendTransaction(wallet, conn, transaction, [])
}

export async function cancelOfferBatch(
  conn: any,
  wallet: any,
  bidDatas: any
	){
	console.log("+ Cancel Offers", bidDatas)
	let provider = new anchor.Provider(conn, wallet as any, confirmOption)
  let program = new anchor.Program(idl, buySellProgramId, provider)

  let transaction = new Transaction()
  for(var i = 0; i < bidDatas.length; i ++)
    transaction.add(
      program.instruction.cancelOffer(
        {
        accounts: {
          owner : wallet.publicKey,
          bidData : bidDatas[i].bidData
        }
      }
      )
    ) 
  await sendTransaction(wallet, conn, transaction, [])
}

export async function rejectOfferBatch(
  conn: any,
  wallet: any,
  bidDatas: any
	){
	console.log("+ reject Offers", bidDatas)
	let provider = new anchor.Provider(conn, wallet as any, confirmOption)
  let program = new anchor.Program(idl, buySellProgramId, provider)

  let transaction = new Transaction()
  for(var i = 0; i < bidDatas.length; i ++)
    transaction.add(
      program.instruction.cancelOffer(
        {
        accounts: {
          owner : wallet.publicKey,
          bidData : bidDatas[i].bidData
        }
      }
      )
    ) 
  await sendTransaction(wallet, conn, transaction, [])
}

export async function acceptOffer(
  conn: any,
  wallet: any,
  bidData: any,
  nftMint: any,
	){
	console.log("+ Accept Offer")
	let provider = new anchor.Provider(conn, wallet as any, confirmOption)
  let program = new anchor.Program(idl,buySellProgramId,provider)
  let transaction = new Transaction()
  let signers : Keypair[] = []
  const bid_data_info = await program.account.bidData.fetch(new PublicKey(bidData))
  console.log(bid_data_info.nonceAccount.toBase58())

  let [vault, bump] = await PublicKey.findProgramAddress( [ Buffer.from(PREFIX) ], buySellProgramId )

  const metadata = await getMetadata(nftMint)
  const sourceNftAccount = await getTokenWallet( wallet.publicKey, nftMint )
  const destNftAccount = await getTokenWallet( bid_data_info.bidder, nftMint )
  if((await conn.getAccountInfo(destNftAccount)) == null)
  	transaction.add(
      createAssociatedTokenAccountInstruction(
        destNftAccount,
        wallet.publicKey,
        bid_data_info.bidder,
        nftMint
      )
    )

  const accountInfo: any = await conn.getParsedAccountInfo(metadata);
  let metadataData : any = new Metadata(wallet.publicKey.toString(), accountInfo.value);
  let creators: any = []

  for(var i = 0; i < metadataData.data.data.creators.length; i ++) {
    console.log(metadataData.data.data.creators[i].address)    
    creators.push({
      pubkey: new PublicKey(metadataData.data.data.creators[i].address),
      isSigner: false,
      isWritable: true,
    })
  }
  transaction.add(
  	program.instruction.sell(
      bump,
      {
  		accounts: {
  			owner : wallet.publicKey,
  			vault : vault,
  			bidData : bidData,        
        salesTaxRecipient: new PublicKey("3iYf9hHQPciwgJ1TCjpRUp1A3QW4AfaK7J6vCmETRMuu"),
        nftMint: nftMint,
        metadata: metadata,
        sourceNftAccount : sourceNftAccount,
        destNftAccount: destNftAccount,
        tokenProgram : TOKEN_PROGRAM_ID,
        systemProgram : anchor.web3.SystemProgram.programId,
        nonceAccount: bid_data_info.nonceAccount,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        recentBlockhash: anchor.web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
  		},
      remainingAccounts: creators,
  	})
  )
  await sendTransaction(wallet, conn, transaction, signers)
}

export async function getOfferReceived(
  conn: Connection,
  wallet: any,
) {
  console.log("+ get Offer Received")
  const allTokens: any = []
  const tokenAccounts = await conn.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_PROGRAM_ID });
  const provider = new anchor.Provider(conn, wallet, anchor.Provider.defaultOptions());
  const program = new anchor.Program(idl, buySellProgramId, provider);
  for (let index = 0; index < tokenAccounts.value.length; index++) {
    try{
      const tokenAccount = tokenAccounts.value[index];
      const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount;
      if (tokenAmount.uiAmount === 1 && tokenAmount.decimals === 0) {
        let nftMint = new PublicKey(tokenAccount.account.data.parsed.info.mint)
        let resp = await conn.getProgramAccounts(buySellProgramId,{
          dataSlice: {length: 0, offset: 0},
          filters: [
            {
              dataSize: BIDDATA_SIZE
            },
            {
              memcmp:
              {
                offset:8,
                bytes: nftMint.toBase58()
              }
            },
          ]
        })
        for(let dataAccount of resp){
          try{
            let bidData = await program.account.bidData.fetch(dataAccount.pubkey)
            const nonceBalance = await conn.getBalance(bidData.nonceAccount)
            let status = ""
            if(bidData.status === 0) status = "CANCELED"
            else if (bidData.status ===2) status = "ACCEPTED"
            else if (bidData.status === 3) status = "REJECTED"
            else if(nonceBalance >= bidData.bidAmount) {
              if( new Date().getTime() < bidData.expireTime * 1000)
                status = "ACTIVE"
              else status = "REJECTED"
            }
            else status="INVALID"
            let [pda] = await anchor.web3.PublicKey.findProgramAddress([ Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), nftMint.toBuffer(), ], TOKEN_METADATA_PROGRAM_ID);
            let accountInfo: any = await conn.getParsedAccountInfo(pda);
            let metadata : any = new Metadata(wallet.publicKey.toString(), accountInfo.value);
            let { data }: any = await axios.get(metadata.data.data.uri)
            const entireData = { ...data, id: Number(data.name.replace( /^\D+/g, '').split(' - ')[0]) }
            allTokens.push({address : new PublicKey(nftMint), ...entireData,
              bidder : bidData.bidder.toBase58(),
              bidAmount :bidData.bidAmount / (10 ** 9),
              status : status,
              bidData: dataAccount.pubkey,
              nftMint: bidData.nftMint,
              bidTime: new Date(bidData.bidTime * 1000).toDateString(),
              expireTime: bidData.expireTime * 1 === 0 ? "Never Mind" : new Date(bidData.expireTime * 1000).toDateString(),
              NFT: data.image,
              Name: data.name,    
            })
          } catch(e) {
            console.log(e)
            continue
          }
        }
        
      }
      allTokens.sort(function (a: any, b: any) {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      })
    } catch(err) {
      continue;
    }
  }
  console.log(allTokens)
  return allTokens
}

export async function getOfferMade(
  conn: Connection,
  wallet: any,
) {
  console.log("+ get Offer Made")
  const provider = new anchor.Provider(conn, wallet, anchor.Provider.defaultOptions());
  const program = new anchor.Program(idl, buySellProgramId, provider);
  const allData: any = []
  let resp = await conn.getProgramAccounts(buySellProgramId,{
    dataSlice: {length: 0, offset: 0},
    filters: [
      {
        dataSize: BIDDATA_SIZE
      },
      {
        memcmp:
        {
          offset:72,
          bytes: wallet!.publicKey.toBase58()
        }
      },
    ]
  })
  for(let dataAccount of resp){
    try{
      let bidData = await program.account.bidData.fetch(dataAccount.pubkey)
      const nonceBalance = await conn.getBalance(bidData.nonceAccount)
      let status = ""
      if(bidData.status === 0) status = "CANCELED"
      else if (bidData.status ===2) status = "ACCEPTED"
      else if (bidData.status === 3) status = "REJECTED"
      else if(nonceBalance >= bidData.bidAmount) {
        if(bidData.expireTime * 1 === 0) status = "ACTIVE"
        else if(new Date().getTime() > bidData.expireTime * 1000) status = "INVALID"
        else status = "ACTIVE"
      }
      else status="INVALID"
      let [pda] = await anchor.web3.PublicKey.findProgramAddress([ Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), bidData.nftMint.toBuffer(), ], TOKEN_METADATA_PROGRAM_ID);
      let accountInfo: any = await conn.getParsedAccountInfo(pda);
      let metadata : any = new Metadata(wallet.publicKey.toString(), accountInfo.value);
      let { data }: any = await axios.get(metadata.data.data.uri)
      const highest = await getHighestOffer(conn, wallet, bidData.nftMint)
      allData.push({
        bidder : bidData.bidder.toBase58(),
        bidAmount :bidData.bidAmount / (10 ** 9),
        status : status,
        bidData: dataAccount.pubkey,
        nftMint: bidData.nftMint,
        bidTime: new Date(bidData.bidTime * 1000).toDateString(),
        expireTime: bidData.expireTime * 1 === 0 ? "Never Mind" : new Date(bidData.expireTime * 1000).toDateString(),
        NFT: data.image,
        Name: data.name,
        Highest: highest / anchor.web3.LAMPORTS_PER_SOL,
      })
    } catch(e) {
      console.log(e)
      continue
    }
  }
  console.log(allData)
  return allData
}

export async function getHighestOffer(
  conn: any,
  wallet: any,
  nftMint: PublicKey,
) {
  console.log("+ get Highest Offer")
  const provider = new anchor.Provider(conn, wallet, anchor.Provider.defaultOptions());
  const program = new anchor.Program(idl, buySellProgramId, provider);
  let resp = await conn.getProgramAccounts(buySellProgramId,{
    dataSlice: {length: 0, offset: 0},
    filters: [
      {
        dataSize: BIDDATA_SIZE
      },
      {
        memcmp:
        {
          offset:8,
          bytes: nftMint.toBase58()
        }
      },
    ]
  })
  let highest = 0
  for(let dataAccount of resp){
    try{
      let bidData = await program.account.bidData.fetch(dataAccount.pubkey)
      const nonceBalance = await conn.getBalance(bidData.nonceAccount)
      if(bidData.status === 1 && nonceBalance >= bidData.bidAmount) {
        if(highest < bidData.bidAmount) highest = bidData.bidAmount
      } 
    } catch(e) {
      console.log(e)
      continue
    }
  }
  return highest
}