import { Menu, Popover, Transition } from "@headlessui/react"
import { CogIcon, UserCircleIcon } from "@heroicons/react/outline"
// @ts-ignore
import { IKImage } from "imagekitio-react"
import { Fragment, useContext, useEffect, useState } from "react"
import { Link, useHistory } from "react-router-dom"
// import { MessageInboxPopup } from "../Jabber/MessageInboxPopup/index"
import {
  GET_SOLO_USER_NO_AUTH,
  GET_SOLO_USER_NO_AUTH_QUERY_PARAM,
} from "../../constants/urls"
import * as ROUTES from "../../constants/routes"
import { useWallet } from "../../contexts/wallet"
import { ConnectButton } from "../ConnectButton"
import { CurrentUserBadge } from "../CurrentUserBadge"
import { Settings } from "../Settings"
import { useLocation } from "react-router-dom"
import SoloProfileContext from "../../contexts/solo-profile"

export const ConnectedDropdown = (props: any) => {
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
      {/* {connected && <MessageInboxPopup />} */}
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
