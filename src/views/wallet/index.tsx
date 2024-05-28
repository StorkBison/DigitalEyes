import React, { useEffect, useState, Fragment, useCallback } from "react"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { useTabState } from "reakit/Tab"
import { forceCheck } from "react-lazyload"

import { useWallet } from "../../contexts/wallet"
import { useConnection, useConnectionConfig } from "../../contexts/connection"
import {
  DomainNameAndAuction,
  useDomainListing,
} from "../../contexts/domainListings"
import { DomainName } from "../../utils/name-service"

// reused components imports
import { Page } from "../../components/Page"
import { SideBar } from "../../components/SideBar"
import { OwnedNftTab } from "./OwnedNftTab"
import ListedNftTab from "./ListedNftTab"
import OwnedDomainTab from "./OwnedDomainTab"
import ListedDomainTab from "./ListedDomainTab"
import LiveBidsTab from "./LiveBidsTab"

// styles import
import "./style.css"
import "font-awesome/css/font-awesome.min.css"

import BidStateTable from "../../components/BidTable"
import { PageHeader } from "../../components/PageHeader"

export type Data = {
  collection: any
  transaction: any
  type: any
  time: any
  amount: any
  mint: any
  buyer: any
  seller: any
}

export function WalletView() {
  const tab = useTabState()
  const screenWidth = window.innerWidth

  const [isLoadingEscrow, setIsLoadingEscrow] = useState(false)

  // sidebar related states
  const [currentTab, setCurrentTab]: any = useState(0) //  the current active sidebar link
  const [menuCollapse, setMenuCollapse] = useState(true)
  const [isMobile, setIsMobile] = useState(false) // check if device has a small screen

  // domain related states
  const [domains, setDomains] = useState<string | string[] | undefined>("")
  const [domainFilter, setDomainFilter] = useState("")

  

  useEffect(() => {
    forceCheck()
  }, [tab])

  useEffect(() => {
    checkWidth("")
  }, [screenWidth])

  const checkWidth = (e: any) => {
    if (screenWidth > 768 && !menuCollapse) {
      setMenuCollapse(true)
      setIsMobile(false)
    }
    if (screenWidth <= 768 && menuCollapse) {
      setMenuCollapse(false)
      setIsMobile(true)
    }
  }

  // showing current tab
  const BaseDiv = (prop: any) => <div>{prop.children}</div>
  const Switch = (props: any) => {
    const { test, children } = props
    return children?.find((child: any) => {
      return child?.props?.value === test
    })
  }

  return (
    <Page title="Your Wallet | DigitalEyes">
      <div className="d-flex wallet-sidebar">
        <SideBar
          setStatus={(tab: any) => setCurrentTab(tab)}
          menuCollapse={menuCollapse}
          isMobile={isMobile}
          setIsMobile={setIsMobile}
          setMenuCollapse={setMenuCollapse}
          subTitle={domains}
        />
        <div
          className={`pt-10 px-4 sm:px-6 lg:px-8 wallet ${
            isMobile
              ? ""
              : menuCollapse && !isMobile
              ? "normal-width"
              : "collapsed-width"
          }`}
        >
          <div
            className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
              !isMobile
                ? ""
                : isMobile && menuCollapse
                ? "normal-width"
                : "collapsed-width"
            }`}
          >
            <div className="relative w-full max-w-full  px-1 sm:px-2 lg:px-5">
              <Switch test={currentTab}>
                <BaseDiv value={0}>
                  <OwnedNftTab />
                </BaseDiv>
                <BaseDiv value={1}>
                  <ListedNftTab
                    isLoadingEscrow={isLoadingEscrow}
                    setIsLoadingEscrow={setIsLoadingEscrow}
                  />
                </BaseDiv>
                <BaseDiv value={3}>
                  <OwnedDomainTab
                    domainFilter={domainFilter}
                    setDomainFilter={setDomainFilter}
                  />
                </BaseDiv>
                <BaseDiv value={6}>
                  <ListedDomainTab
                    domainFilter={domainFilter}
                    setDomainFilter={setDomainFilter}
                  />
                </BaseDiv>
                <BaseDiv value={2}>
                  <LiveBidsTab />
                </BaseDiv>
                <BaseDiv value={4}>
                  <BidStateTable />
                  <PageHeader OfferState={'Offer Received'}/>
                </BaseDiv>
                <BaseDiv value={5}>
                  <BidStateTable />
                  <PageHeader OfferState={"Offer Made"}/>
                </BaseDiv>
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default WalletView
