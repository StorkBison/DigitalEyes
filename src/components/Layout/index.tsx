import { PublicKey } from "@solana/web3.js"
import React, { useEffect, useState } from "react"
import { useConnection, useWallet } from "../../contexts"
// import { getUserDomains } from "../../utils/name-service"
import "react-pro-sidebar/dist/css/styles.css"
import { AppBar } from "../AppBar"
import Disclaimer from "../Disclaimer"
import { Footer } from "../Footer"
import { Aside } from "./Aside"
import "./sidebar.css"
import { useHistory, withRouter } from "react-router-dom"

const DISCLAIMER_LOCAL_STORAGE_KEYS = {
  beta: "digitalEyesBetaDisclaimerClosed",
}

// !!!! If you change the disclaimer message, please don't forget to change the following storage key.
const CURRENT_DISCLAIMER_KEY = "beta"

const Layout = React.memo((props: any) => {
  const history = useHistory()
  const [collapsed, setCollapsed] = useState(
    !(
      window.matchMedia("(min-width: 768px)").matches &&
      history.location.pathname === "/"
    )
  )
  const { wallet } = useWallet()

  console.log(
    "state of bar is",
    window.matchMedia("(min-width: 768px)").matches ||
      history.location.pathname !== "/"
  )

  const [userDomains, setUserDomains] = useState<
    | (
        | {
            name: string
            nameKey: any
          }
        | {
            name: undefined
            nameKey: any
          }
      )[]
    | undefined
  >()

  const showDisclaimerLocalStorage =
    localStorage.getItem(
      DISCLAIMER_LOCAL_STORAGE_KEYS[CURRENT_DISCLAIMER_KEY]
    ) !== "true"
  const [showDisclaimer, setShowDisclaimer] = useState(
    showDisclaimerLocalStorage
  )

  const closeDisclaimer = () => {
    localStorage.setItem(
      DISCLAIMER_LOCAL_STORAGE_KEYS[CURRENT_DISCLAIMER_KEY],
      "true"
    )
    setShowDisclaimer(false)
  }

  const connection = useConnection()
  // useEffect(() => {
  //   ;(async () => {
  //     if (wallet?.publicKey && !userDomains) {
  //       const domains = await getUserDomains(
  //         connection,
  //         wallet?.publicKey as PublicKey
  //       )
  //       setUserDomains(domains)
  //       console.log(domains)
  //     }
  //   })()
  // }, [wallet?.publicKey, connection, userDomains])

  // useEffect(() => {
  //   if (wallet && userDomains) wallet["domainNames"] = userDomains
  // }, [wallet?.publicKey, userDomains])

  useEffect(() => {
    if (history.location.pathname !== "/") {
      setCollapsed(true)
    }
    if (history.location.pathname.includes("/collections")) {
      setCollapsed(true)
    }
    if (history.location.pathname === "/solo-wallet") {
      setCollapsed(true)
    }
    if (
      history.location.pathname === "/" &&
      window.matchMedia("(min-width: 768px)").matches
    ) {
      setCollapsed(false)
    }
    console.log("history", history.location.pathname)
  }, [history.location.pathname])

  const handleToggleSidebar = (value: boolean): void => {
    setCollapsed(value)
  }
  // setInterval(() => {
  //   setCollapsed(!collapsed)
  // }, 4000)

  const closeOutsideClick = () => {
    if (window.matchMedia("(max-width: 768px)").matches && !collapsed) {
      setCollapsed(true)
    }
  }

  console.log("his", history.location.pathname)

  return (
    <div className="flex flex-col min-h-screen">
      <AppBar toggleSidebar={() => handleToggleSidebar(!collapsed)} />
      {showDisclaimer && <Disclaimer closeDisclaimer={closeDisclaimer} />}

      <div className="side-bar">
        <div>
          <Aside
            collapsed={collapsed}
            handleToggleSidebar={handleToggleSidebar}
          />
        </div>

        {history.location.pathname === "/" ? (
          <div
            className={!collapsed ? "side-padding" : "side-padding-collapsed"}
          >
            <main
              className="bg-color-main-tertiary flex-1"
              onClick={() => closeOutsideClick()}
            >
              {props.children}
            </main>
          </div>
        ) : (
          <div className="side-padding-collapsed">
            <main
              className="bg-color-main-tertiary flex-1"
              onClick={() => closeOutsideClick()}
            >
              {props.children}
            </main>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
})

export default withRouter(Layout)
