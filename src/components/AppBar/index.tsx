import { Menu, Popover, Transition } from "@headlessui/react"
import {
  CogIcon,
  MenuIcon,
  XIcon,
  SunIcon,
  UserCircleIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
} from "@heroicons/react/outline"
// @ts-ignore
import { IKImage } from "imagekitio-react"
import { Fragment, useContext, useEffect, useState } from "react"
import { Link, useHistory } from "react-router-dom"
import { MessageInboxPopup } from "../Jabber/MessageInboxPopup/index"
import { ReactComponent as DiscordLogo } from "../../assets/logo/discord.svg"
import { ReactComponent as TwitterLogo } from "../../assets/logo/twitter.svg"
import { IMAGE_KIT_ENDPOINT_URL } from "../../constants/images"
import {
  GET_SOLO_USER_NO_AUTH,
  GET_SOLO_USER_NO_AUTH_QUERY_PARAM,
} from "../../constants/urls"
import * as ROUTES from "../../constants/routes"
import { useCollections } from "../../contexts/collections"
import { useWallet } from "../../contexts/wallet"
import { SearchV2 } from "../SearchV2"
import { ConnectButton } from "../ConnectButton"
import { CurrentUserBadge } from "../CurrentUserBadge"
import { Settings } from "../Settings"
import { DE_DISCORD, DE_TWITTER } from "../../utils/DeSocials"
import { classNames } from "../../utils"
import { Divider } from "../Divider"
import { useLocation } from "react-router-dom"
import SoloProfileContext from "../../contexts/solo-profile"

interface AppProps {
  toggleSidebar: () => void
}

export function AppBar({ toggleSidebar }: AppProps) {
  const [checked, setChecked] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { isProfilePage, profileTheme } = useContext(SoloProfileContext)

  localStorage.setItem("theme", "theme-dark")

  const setTheme = (themeName: string) => {
    localStorage.setItem("theme", themeName)
    document.documentElement.className = themeName
  }

  useEffect(() => {
    if (localStorage.getItem("theme") === "theme-dark") {
      setChecked(true)
    }
  }, [])

  // function to toggle between light and dark theme
  const toggleTheme = () => {
    setChecked((c) => !c)
    if (localStorage.getItem("theme") === "theme-dark") {
      setTheme("theme-light")
    } else {
      setTheme("theme-dark")
    }
  }

  const history = useHistory()
  const { connected, wallet } = useWallet()
  const { collections, topCollections } = useCollections()
  const { pathname } = useLocation()

  useEffect(() => {
    setIsDropdownOpen(false)
  }, [history, pathname])

  return (
    <Popover
      className="bg-almost-black sticky top-0 z-100 digitaleyes-appbar transition"
      style={{
        background:
          isProfilePage && profileTheme ? profileTheme.headerBackground : "",
      }}
    >
      {({ open, close }) => (
        <>
          <div className="flex justify-between items-center px-4 sm:px-6 md:justify-start md:space-x-10 mx-auto shadow text-sm">
            <div className="flex justify-start  md:h-20 h-12 items-center space-x-6">
              <Link
                to={ROUTES.HOME}
                onClick={() => close()}
                className="flex items-center"
              >
                <IKImage
                  urlEndpoint={IMAGE_KIT_ENDPOINT_URL}
                  path="/logo/digitaleyes.svg"
                  alt="digital eyes logo"
                  className="w-auto h-6 md:h-7.5"
                />
                <span className="text-white ml-2.5 mr-4 font-medium text-xl hidden sm:block">
                  DigitalEyes
                </span>
              </Link>
            </div>

            <div className="flex-auto flex justify-center">
              <div className="text-sm md:text-base w-full lg:w-1/2 xl:w-1/2 bg-gray-900 mx-8 rounded-full">
                <SearchV2
                  collections={collections}
                  topCollections={topCollections}
                  onClose={close}
                  history={history}
                  darkMode={true}
                  wallet={wallet}
                />
              </div>
            </div>

            {/*
            <button onClick={toggleTheme}>
              <SunIcon className="w-5 h-5 text-white" />
            </button>
            */}

            <div className="-mr-2 -my-2 lg:hidden">
              <Popover.Button className="bg-almost-black p-2 inline-flex items-center justify-center text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                <span className="sr-only">Open menu</span>
                <MenuIcon
                  onClick={toggleSidebar}
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </Popover.Button>
            </div>
            <Popover.Group
              as="nav"
              className="hidden lg:flex space-x-6 items-center"
            >
              <Menu as="div" className="relative inline-block text-left">
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="flex flex-col origin-top-right absolute right-0 mt-11 p-2 bg-gray-900 z-10 rounded-lg w-48  overflow-y-auto">
                    <Menu.Item>
                      <button
                        onClick={(e: any) => {
                          history.push(`${ROUTES.SOLO_BROWSE}`)
                        }}
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p> Solo</p>
                      </button>
                    </Menu.Item>
                    <Menu.Item>
                      <button
                        onClick={(e: any) => {
                          history.push(`${ROUTES.EXPLORE}`)
                        }}
                        className="px-4 py-2 hover:text-gray-300 rounded-md hover:bg-gray-600 font-light flex justify-between"
                      >
                        <p> All Collections </p>
                      </button>
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>

              <Link
                to={
                  pathname.includes("solo") ? ROUTES.WALLET_SOLO : ROUTES.WALLET
                }
                onClick={() => close()}
                className="font-light text-white hover:text-gray-500 transition uppercase hover:opacity-70"
                style={{
                  color:
                    isProfilePage && profileTheme
                      ? profileTheme.headerForeground
                      : "",
                }}
              >
                Sell
              </Link>
            </Popover.Group>

            <div className="hidden lg:flex items-center justify-end">
              <WalletConnector />
            </div>
          </div>

          <Divider />
        </>
      )}
    </Popover>
  )
}

const WalletConnector = (props: any) => {
  const { connected, wallet } = useWallet()
  const history = useHistory()
  const { pathname } = useLocation()
  const { isProfilePage, profileTheme } = useContext(SoloProfileContext)
  const [userProf, setUserProf] = useState<any>("")

  const goToCreateProfile = () => {
    history.push(`${ROUTES.SOLO_SETTINGS}`)
  }

  const goToProfile = () => {
    history.push(`${ROUTES.SOLOPROFILE}/${userProf?.username}`)
  }

  const goToFavorites = () => {
    history.push(`${ROUTES.FAVOURITE_LIST}`)
  }

  const goToWallet = (x: any) => {
    history.push(x)
  }

  const getProfAuth = async () => {
    const pubKey = wallet?.publicKey
    try {
      const profAuthed = await fetch(
        `${GET_SOLO_USER_NO_AUTH}?${GET_SOLO_USER_NO_AUTH_QUERY_PARAM}=${pubKey?.toBase58()}`
      ).then((res) => {
        if (res.status == 200) {
          return res.json()
        } else {
          throw new Error()
        }
      })

      setUserProf(profAuthed)
    } catch (error) {
      setUserProf("")
      console.log("Unable to fetch profile info", error)
    }
  }

  useEffect(() => {
    if (wallet?.publicKey) {
      getProfAuth()
    }
  }, [connected])

  return (
    <>
      {connected && <MessageInboxPopup />}
      {!connected && <ConnectButton allowWalletChange={true} />}
      {(connected || process.env.NODE_ENV === "development") && (
        <Menu
          as="div"
          className="mx-3 relative inline-block text-left  opacity-90"
        >
          {connected ? (
            <Menu.Button className="rounded-full flex items-center text-white hover:text-gray-700 outline-none">
              <span className="sr-only">Open options</span>
              {userProf?.image ? (
                <img
                  src={userProf?.image}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon
                  className="h-7 w-7 opacity-90 transition hover:opacity-70"
                  style={{
                    color:
                      isProfilePage && profileTheme
                        ? profileTheme.headerForeground
                        : "",
                  }}
                  aria-hidden="true"
                />
              )}
            </Menu.Button>
          ) : (
            <div className="grid grid-cols-1">
              <Menu.Button className="rounded-full flex items-center text-white hover:text-gray-700 outline-none">
                <span className="sr-only">Open options</span>
                <CogIcon
                  className="h-5 w-5 opacity-80 transition hover:opacity-70"
                  aria-hidden="true"
                  style={{
                    color:
                      isProfilePage && profileTheme
                        ? profileTheme.headerForeground
                        : "",
                  }}
                />
              </Menu.Button>
            </div>
          )}

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right absolute right-0 mt-8 p-5 w-64  bg-gray-900 z-10 rounded-lg">
              {connected && userProf?.username && (
                <Menu.Item>
                  <div className="text-center text-xl">
                    <span>{userProf?.username}</span>
                  </div>
                </Menu.Item>
              )}

              <Menu.Item>{(props) => <CurrentUserBadge />}</Menu.Item>

              {connected && (
                <>
                  <div className="flex justify-center">
                    <Menu.Item>
                      <button
                        type="submit"
                        className="w-full items-center px-3 py-2 shadow-sm text-sm leading-4 font-light text-white bg-gray-900 hover:bg-gray-500 rounded-lg mt-2"
                        onClick={
                          pathname.includes("solo")
                            ? () => goToWallet(ROUTES.WALLET_SOLO)
                            : () => goToWallet(ROUTES.WALLET)
                        }
                      >
                        Wallet
                      </button>
                    </Menu.Item>
                  </div>

                  <div className="flex justify-center">
                    <Menu.Item>
                      <button
                        type="submit"
                        className="w-full items-center px-3 py-2 shadow-sm text-sm leading-4 font-light text-white bg-gray-900 hover:bg-gray-500 rounded-lg mt-2"
                        onClick={
                          pathname.includes("solo")
                            ? () => goToWallet(ROUTES.FAVOURITE_LIST_SOLO)
                            : () => goToWallet(ROUTES.FAVOURITE_LIST)
                        }
                      >
                        Favorites
                      </button>
                    </Menu.Item>
                  </div>
                </>
              )}

              {connected && userProf?.username && (
                <div className="flex justify-center">
                  <Menu.Item>
                    <button
                      type="submit"
                      className="w-full items-center px-3 py-2 shadow-sm text-sm leading-4 font-light text-white bg-gray-900 hover:bg-gray-500 rounded-lg mt-2"
                      onClick={goToProfile}
                    >
                      My Profile
                    </button>
                  </Menu.Item>
                </div>
              )}
              {connected && !userProf?.username && (
                <Menu.Item>
                  <button
                    type="submit"
                    className="w-full items-center px-3 py-2 shadow-sm text-md leading-4 font-light text-white bg-gray-900 hover:bg-gray-500 rounded-lg mt-2"
                    onClick={goToCreateProfile}
                  >
                    Create a Profile
                  </button>
                </Menu.Item>
              )}
              <div className="py-1 space-y-3">
                {process.env.NODE_ENV === "development" && (
                  <Menu.Item>{({ active }) => <Settings />}</Menu.Item>
                )}
              </div>
              <Menu.Item>
                {(props) => <DisconnectButton {...props} />}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      )}
    </>
  )
}

const DisconnectButton = (props: any) => {
  const { connected, disconnect } = useWallet()
  if (connected) {
    return (
      <button
        type="submit"
        className="w-full items-center justify-center px-3 py-2 shadow-sm text-xs leading-4 font-light text-white bg-gray-900 hover:bg-gray-500 rounded-lg mt-2"
        onClick={() => {
          props.onClick()
          disconnect()
        }}
      >
        Disconnect
      </button>
    )
  }
  return null
}
