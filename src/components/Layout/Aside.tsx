import React from "react"
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarContent,
} from "react-pro-sidebar"
import "react-pro-sidebar/dist/css/styles.css"
import { FaWallet } from "react-icons/fa"
import "./sidebar.css"
import * as ROUTES from "../../constants/routes"
import { Link, useHistory, useParams } from "react-router-dom"
import { ReactComponent as Svgtm } from "../../svgs/badge.svg"
import { useWallet } from "../../contexts"
import { ConnectButton } from "../ConnectButton"
import { ConnectedDropdown } from "../AppBar/ConnectedDropdown"
import { ReactComponent as RightIcon } from "../../assets/icons/chevron-right.svg"

interface AsideProps {
  collapsed: boolean
  handleToggleSidebar: (x: any) => void
}

export const Aside = React.memo(
  ({ collapsed, handleToggleSidebar }: AsideProps) => {
    const { connected } = useWallet()

    const checkfIfMobile = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        handleToggleSidebar(true)
      }
    }

    return (
      <ProSidebar
        collapsed={collapsed}
        // toggled={collapsed}
        onToggle={handleToggleSidebar}
        // width={250}
        breakPoint="md"
        className={` side-bar-pro`}
      >
        <div className={!collapsed ? "side-bar-p" : "side-bar-collapsed"}>
          <div className="toggle-icon">
            <RightIcon
              className={collapsed ? "toggled" : "not-toggled"}
              onClick={() => handleToggleSidebar(!collapsed)}
            />
          </div>

          <Menu iconShape="square">
            <MenuItem
              className="my-1"
              icon={
                <img
                  src="/assets/icons/home.png"
                  className="pad-left w-6 h-6"
                  alt="home"
                />
              }
            >
              <Link
                onClick={checkfIfMobile}
                className="text-white px-2 text-md"
                to={ROUTES.HOME}
              >
                Home
              </Link>
            </MenuItem>

            <MenuItem
              className="my-1"
              icon={
                <img
                  className="pad-left w-6 h-6"
                  src="/assets/icons/collection-icon.png"
                  alt="collection"
                />
              }
            >
              <Link
                onClick={checkfIfMobile}
                className="text-white px-2 text-md"
                to={ROUTES.EXPLORE}
              >
                Collections
              </Link>
            </MenuItem>

            <MenuItem
              className="my-1"
              icon={
                <img
                  className="pad-left w-5 h-5"
                  src="/assets/icons/launchpad.png"
                  alt="launchpad"
                />
              }
            >
              <Link
                onClick={checkfIfMobile}
                className="text-white px-2 text-md"
                to={`${ROUTES.LAUNCHPAD}/featured`}
              >
                Launchpad
              </Link>
            </MenuItem>

            <MenuItem
              className="my-1 px-2 text-md"
              icon={
                <img
                  src="/assets/icons/badge.svg"
                  alt="solo"
                  className="w-5 h-5"
                />
              }
            >
              <Link
                onClick={checkfIfMobile}
                className="text-white"
                to={ROUTES.SOLO}
              >
                Solo
              </Link>
            </MenuItem>
            {/**<MenuItem
              className="my-1 px-2"
              icon={
                <img
                  src="/assets/icons/bonfida-icon.png"
                  alt="bonfida"
                  className="w-5 h-5"
                />
              }
            >
              <Link
                className="text-white text-md"
                to={`${ROUTES.COLLECTIONS}/Bonfida`}
                onClick={checkfIfMobile}
              >
                Domains
              </Link>
            </MenuItem>*/}

            <MenuItem
              className="mobile-connect my-1 px-2"
              icon={<FaWallet size={18} />}
            >
              <Link
                className="text-white text-md"
                to={`${ROUTES.WALLET}`}
                onClick={checkfIfMobile}
              >
                Wallet
              </Link>
            </MenuItem>

            <MenuItem
              className="my-1 px-2"
              icon={
                <img
                  src="/assets/icons/calendar-icon.png"
                  alt="calendar"
                  className="w-5 h-5"
                />
              }
            >
              <Link
                className="text-white text-md"
                to={ROUTES.MINT_CALENDAR}
                onClick={checkfIfMobile}
              >
                Mint Calendar
              </Link>
            </MenuItem>

            <SubMenu
              className="my-1 px-2 text-md"
              title="Creators"
              icon={
                <img
                  src="/assets/icons/creator-icon.png"
                  alt="creator"
                  className="w-5 h-5"
                />
              }
            >
              <MenuItem>
                <a
                  href="https://de-creators-portal.netlify.app/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Listing
                </a>
              </MenuItem>
              <MenuItem>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdDBxeZgKF5C3K5C-8pqoawIma2qaIFC18WYFk1NZHWZd_s3g/viewform"
                  target="_blank"
                  rel="noreferrer"
                >
                  Marketing
                </a>
              </MenuItem>
              <MenuItem>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLScm9bt4ORJqRJgxsUdhhR_c7bwmek8_1PVU6_gbc3WyMdbiBg/viewform?usp=sf_link"
                  target="_blank"
                  rel="noreferrer"
                >
                  Launchpad
                </a>
              </MenuItem>
            </SubMenu>

            <SubMenu
              className="my-1 px-2 text-md"
              title="Resources"
              icon={
                <img
                  src="/assets/icons/resources-icon.png"
                  alt="resources"
                  className="w-5 h-5"
                />
              }
            >
              <MenuItem>
                <a href="/buyer-seller-faqs">FAQs: Buyer/Seller</a>
              </MenuItem>

              <MenuItem>
                <a href="/creator-faqs">FAQs: Creator</a>
              </MenuItem>

              <MenuItem>
                <a href="/buyer-seller-guides">Guides: Buyer/Seller</a>
              </MenuItem>

              <MenuItem>
                <a href="/creator-guides">Guides: Creator</a>
              </MenuItem>

              <MenuItem>
                <a href={ROUTES.BLOG}>Blog</a>
              </MenuItem>
            </SubMenu>

            <div className="mobile-connect">
              {!connected && (
                <MenuItem>
                  <ConnectButton allowWalletChange={true} />
                </MenuItem>
              )}
            </div>

            <div className="mobile-connect">
              {connected && <ConnectedDropdown />}
            </div>
          </Menu>
        </div>
      </ProSidebar>
    )
  }
)
