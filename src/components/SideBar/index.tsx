import React from "react"
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "react-pro-sidebar"

import { useCallback, useEffect, useState } from "react"
import { deposit, withdraw, findBiddingWallet } from '../../contracts/offer'
import { NotificationModal } from "../NotificationModal"

import "../../components/SideBar/style.css"
import "font-awesome/css/font-awesome.min.css"
import useWindowDimensions from "../../utils/layout"
import { useConnection } from "../../contexts/connection"
import { useWallet } from "../../contexts/wallet"

export const SideBar = ({
  setStatus,
  menuCollapse,
  setMenuCollapse,
  subTitle,
  isMobile,
  setIsMobile,
}: any) => {
  const [title, setTitle] = useState("Your Wallet")
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState()
  const {connected, wallet} = useWallet()
  const connection = useConnection()
  //create a custom function that will change menucollapse state from false to true and true to false
  const menuIconClick = () => {
    //condition checking to change state from true to false and vice versa
    menuCollapse ? setMenuCollapse(false) : setMenuCollapse(true)
    isMobile ? setIsMobile(true) : setIsMobile(false)
  }

  const [notificationTitle, setNotificationTitle] = useState(
    "Please don’t close this modal while we confirm your deposit on the blockchain"
  )
  const [notificationDesc, setNotificationDesc] = useState(
    "After wallet approval, your transaction will be finished shortly…"
  )
  const [notificationCanClose, setNotificationCanClose] =
    useState<boolean>(false)
  const [modalTimer, setModalTimer] = useState<number>(0)
  const [buttonLoading, setButtonLoading] = useState(false);

  const checkWidth = (e: any) => {
    const width = window.innerWidth
    console.log(menuCollapse)
    if (width > 768 && !menuCollapse) {
      console.log(">")
      setMenuCollapse(true)
      setIsMobile(false)
    }
    if (width <= 768 && menuCollapse) {
      setMenuCollapse(false)
      setIsMobile(true)
    }
  }
  
  const closeAndResetModal = () => {
    setButtonLoading(false)
    setNotificationTitle(
      "Please don’t close this modal while we confirm your deposit on the blockchain"
    )
    setNotificationDesc(
      "After wallet approval, your transaction will be finished shortly…"
    )
    setModalTimer(5)
  }

  useEffect(() => {
    window.addEventListener("resize", (e) => {
      checkWidth(e)
    })
  }, [])

  useEffect(() => {
    (async() => {
      const res = await findBiddingWallet(connection, wallet)
      if(res === null) return
      let b = await connection.getBalance(res.data.nonceAccount)
      setBalance( b / ( 10 ** 9) )
    })()
  }, [connected])

  async function depositFunction( ): Promise<void> {
    setNotificationTitle(
      "Please don’t close this modal while we confirm your deposit on the blockchain"
    )
    setButtonLoading(true)
    try {
      if (wallet) {
        await deposit(connection, wallet, amount)

        setNotificationTitle(`Success!`)
        setNotificationDesc(
          `You've successfully deposited. Please allow some time for the changes to be reflected in the listing and in your wallet.`
        )
        const res = await findBiddingWallet(connection, wallet)
        if(res === null) return
        let b = await connection.getBalance(res.data.nonceAccount)
        setBalance( b / ( 10 ** 9) )
        setNotificationCanClose(true)
        setModalTimer(5)
      }
    } catch (error) {
      setNotificationTitle(`Oops, something went wrong!`)
      setNotificationDesc((error as Error).message)
      setNotificationCanClose(true)
    }
    setTimeout(() => {
      closeAndResetModal()
      setNotificationCanClose(false)
    }, 5000)
  }

  async function withdrawFunction( ): Promise<void> {
    setNotificationTitle(
      "Please don’t close this modal while we confirm your withdrawal on the blockchain"
    )
    setButtonLoading(true)
    try {
      if (wallet) {
        await withdraw(connection, wallet, amount)

        setNotificationTitle(`Success!`)
        setNotificationDesc(
          `You've successfully withdrawn. Please allow some time for the changes to be reflected in the listing and in your wallet.`
        )
        const res = await findBiddingWallet(connection, wallet)
        if(res === null) return
        let b = await connection.getBalance(res.data.nonceAccount)
        setBalance( b / ( 10 ** 9) )
        setNotificationCanClose(true)
        setModalTimer(5)
      }
    } catch (error) {
      setNotificationTitle(`Oops, something went wrong!`)
      setNotificationDesc((error as Error).message)
      setNotificationCanClose(true)
    }
    setTimeout(() => {
      closeAndResetModal()
      setNotificationCanClose(false)
    }, 5000)
  }

  return (
    <>
      {menuCollapse ? (
        <ProSidebar>
          <SidebarHeader
            style={{
              padding: 40,
            }}
          >
            <div className="sidebar-header1">
              <div>{title}</div>
              <div className="sidebar-header2 mt-2 text-xs opacity-80">
                {subTitle}
              </div>
              {/* <div className="sidebar-header3 mt-2">
                                Total Floor Value
                            </div> */}
                        </div>
                        <div className="closemenu" onClick={menuIconClick}>
                            {/* changing menu collapse icon on click */}
                            {menuCollapse ? (
                                <i className="fa fa-angle-double-left"></i>
                            ) : (
                                <i className="fa fa-angle-double-right"></i>
                            )}
                        </div>
                    </SidebarHeader>

          <SidebarContent
            style={{
              padding: "20px 0 20px 50px",
              color: "white",
            }}
          >
            <Menu>
              <MenuItem
                onClick={() => {
                  setStatus(0)
                  setTitle("Your Wallet")
                  if (isMobile) setMenuCollapse(false)
                }}
              >
                {" "}
                Owned NFTs{" "}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setStatus(1)
                  setTitle("Your Listed NFTs")
                  if (isMobile) setMenuCollapse(false)
                }}
              >
                {" "}
                Listed NFTs{" "}
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  setStatus(4)
                  setTitle("Your Offers Received")
                  if (isMobile) setMenuCollapse(false)
                }}
              > 
                {" "}
                Offers Received{" "}
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  setStatus(5)
                  setTitle("Your Offers Made")
                  if (isMobile) setMenuCollapse(false)
                }}
              > 
                {" "}
                Offers Made{" "}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setStatus(2)
                  setTitle("Your Live Bids")
                  if (isMobile) setMenuCollapse(false)
                }}
              >
                {" "}
                Live Domain Bids{" "}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setStatus(3)
                  setTitle("Your Live Dutch Auctions")
                  if (isMobile) setMenuCollapse(false)
                }}
              >
                {" "}
                Live Dutch Auctions{" "}
              </MenuItem>

              {/* <MenuItem> Creations </MenuItem> */}
              {/* <MenuItem onClick={() => setStatus(3) }> <a href="" id="auction"> Activities </a> </MenuItem> */}
              <hr></hr>
              <div style={{
                textAlign: "center",
                padding: 20,
                color: "white"
              }}>
                <p
                  style={{
                    textTransform: "uppercase",
                    marginBottom: "16px"
                  }}>
                  Bidding Account
                </p>
                <p> Balance &nbsp; &nbsp; {balance} SOL</p>
                <input style={{color: "black"}} value={amount} onChange={(e: any) => setAmount(e.target.value)}/>
                <button className = "sidebar-btn" onClick={() => depositFunction()}>Deposit</button>
                <button className = "sidebar-btn" onClick={() => withdrawFunction()}>Withdraw</button>
              </div>
            </Menu>
          </SidebarContent>

          <SidebarFooter
            style={{
              textAlign: "center",
              padding: 20,
              color: "white"
            }}>
            {/* <div>
              <p
                style={{
                  textTransform: "uppercase",
                  marginBottom: "16px"
                }}>
                Bidding Account
              </p>
              <p> Balance &nbsp; &nbsp; {balance} SOL</p>
              <input type="number" value={amount} onChange={(e: any) => setAmount(e.target.value)}/>
              <button className = "sidebar-btn" onClick={async() => {
                await deposit(connection, wallet, amount)
              }}>Deposit</button>
              <button className = "sidebar-btn" onClick={async() => {
                await withdraw(connection, wallet, amount)
              }}>Withdraw</button>
            </div> */}
          </SidebarFooter> 
        </ProSidebar>
      ) : (
        <div className="small-sidebar">
          <div className="closemenu" onClick={menuIconClick}>
            {/* changing menu collapse icon on click */}
            {menuCollapse ? (
              <i className="fa fa-angle-double-left"></i>
            ) : (
              <i className="fa fa-angle-double-right"></i>
            )}
          </div>
        </div>
      )}
    <NotificationModal
        isShow={buttonLoading}
        isToast={false}
        title={notificationTitle}
        description={notificationDesc}
        timer={modalTimer}
        onBackDropClick={() => {
          if (notificationCanClose) {
            closeAndResetModal()
          }
        }}
      ></NotificationModal>
    </>
  )
}
