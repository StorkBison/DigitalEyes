import {
  CurrencyDollarIcon,
  LockOpenIcon,
  ExclamationIcon,
  TicketIcon,
  GlobeAltIcon,
  LightningBoltIcon,
  CheckCircleIcon,
} from "@heroicons/react/solid"
import {
  SpeakerphoneIcon,
} from "@heroicons/react/outline"
import * as ROUTES from "../../../constants/routes"
import moment from 'moment';
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import MintButton from "../../../views/mint-button"
import MaintenanceBanner from "../../../assets/logo/maintenance.jpeg"
import { PublicKey } from "@solana/web3.js"
import { ConnectButton } from "../../ConnectButton"
import { Page } from "../../Page"
import { ReactComponent as DiscordLogo } from "../../../assets/logo/discord.svg"
import { ReactComponent as TwitterLogo } from "../../../assets/logo/twitter.svg"
import { LaunchPadInfo } from "./types"
import { useWallet } from "../../../contexts/wallet"
import { useUserAccounts } from "../../../hooks"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { useConnection } from "../../../contexts"
import { toPublicKey } from "../../../utils"
import { getLaunchPadProjectInfo } from "./utils"

import {
  getImagePath,
  IMAGE_KIT_ENDPOINT_URL,
  isImageInCache,
} from "../../../constants/images"
import {returnHttpsUrl} from "./utils"

// @ts-ignore-next-line
import { IKImage } from "imagekitio-react";
dayjs.extend(utc)

export const LaunchPadProjectView = () => {
  const { wallet } = useWallet()
  const [project, setProject] = useState<LaunchPadInfo>()
  const connection = useConnection()
  const { push } = useHistory()
  const { projectName } = useParams<{ projectName: string }>()
  const [bannerCacheFailed, setBannerCacheFailed] = useState<boolean | undefined>(false)
  const [collectionThumbnailUrl, setCollectionThumbnailUrl] = useState<string>("")
  const [collectionBannerUrl, setCollectionBannerUrl] = useState<string>("")
  const [isPreSaleEnabled, setIsPreSaleEnabled] = useState<boolean | undefined>(false)
  const [isWhiteListedUser, setIsWhiteListedUser] = useState<boolean>(false)
  const {mintsInWalletUnlisted} = useUserAccounts()


  const bannerCacheFallback = (parentNode: any) => {
      setBannerCacheFailed(true)
    }


  async function fetchProjectInfo() {
    let response = await getLaunchPadProjectInfo({projectName});
      //response = response.json()
    setProject(response);

    if (response?.ThumbnailUrl.includes("gs://")) {
      const thumbnailHttpUrl = await returnHttpsUrl(
        response?.ThumbnailUrl
      )
      setCollectionThumbnailUrl(thumbnailHttpUrl as string)
    } else if (response?.ThumbnailUrl.includes("thumbnails/")) {
      setCollectionThumbnailUrl(
        `${IMAGE_KIT_ENDPOINT_URL}${response?.ThumbnailUrl}`
      )
    } else {
      setCollectionThumbnailUrl(response?.ThumbnailUrl)
    }

  if (!!response?.BannerUrl && response?.BannerUrl.includes("gs://")) {
      const bannerHttpsUrl = await returnHttpsUrl(response?.BannerUrl)
      setCollectionBannerUrl(bannerHttpsUrl as string)
    } else {
      setCollectionBannerUrl(response?.BannerUrl)
    }
  }


  useEffect(() => {
      if(projectName){
          fetchProjectInfo()
      }
  }, [projectName])


  useEffect(() => {
    console.log(project);

    if(project?.WhitelistEnabled){
      //@ts-ignore
        let whiteListMint =   project.CandyMachineConfig.whitelistMintSettings.mint;
        setIsWhiteListedUser(mintsInWalletUnlisted.includes("4fRea2p9hpWEMddLraYAaMr7rcQHAAVkk2cQXxUN4yrh"))
        setIsPreSaleEnabled(project?.PresaleEnabled)
      }
  }, [wallet,project])

  const goToProject = (projectName: string) => {
    push(`${ROUTES.LAUNCHPAD}/${projectName}`)
  }

  const txTimeout = 30000
  {
    return (
      <Page title={project?.Name}>

          <>

            {collectionBannerUrl &&
            isImageInCache(collectionBannerUrl) &&
            !bannerCacheFailed ? (
              <IKImage
                urlEndpoint={IMAGE_KIT_ENDPOINT_URL}
                path={collectionBannerUrl}
                className="z-0 absolute top-0 w-screen object-cover bg-image-gradient opacity-20 h-screen"
                width="1000"
                onError={bannerCacheFallback}
              />
            ) : (
              <img
                src={collectionBannerUrl}
                className="z-0 absolute top-0 w-screen object-cover bg-image-gradient opacity-20 h-screen"
                width="1000"
              />
            )}
            <div className= "relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">


              <div className="flex flex-col">
                {project && (
                  <div className="max-w-7xl mx-auto px-4">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-center">
                      <div className="mt-10 lg:mt-0 px-4 lg:col-span-6 align-middle md:max-w-2xl md:mx-auto lg:order-2">
                        <div className="sm:w-full sm:mx-auto sm:rounded-lg sm:overflow-hidden rounded-lg flex justify-center">
                          <img src={collectionThumbnailUrl} />
                        </div>
                      </div>
                      <div className="py-10 xl:py-20 px-4 sm:px-6 md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center lg:order-1">
                        <div>
                            {project?.IsFeatured && (<p className="flex align-middle">
                              <LightningBoltIcon
                                width="20"
                                color="white"
                                className="mr-1"
                              />
                              <span className="mt-1 text-gray-200">
                                Featured Launch
                              </span>
                            </p>)}
                          <h1 className="mt-4 text-3xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl">
                            {project.Name}
                          </h1>
                          <div className="flex mx-auto">
                            {project?.Discord && (
                              <a
                                className="m-4 sm:m-5 lg:m-6"
                                href={project?.Discord}
                                target="_blank"
                              >
                                <DiscordLogo className="h-6 w-6 hover:text-blue-800" />
                              </a>
                            )}
                            {project?.Twitter && (
                              <a
                                className="m-4 sm:m-5 lg:m-6"
                                href={project?.Twitter}
                                target="_blank"
                              >
                                <TwitterLogo className="h-6 w-6 hover:text-blue-800" />
                              </a>
                            )}
                            {project?.Website && (
                              <a
                                className="m-4 sm:m-5 lg:m-6"
                                href={project?.Website}
                                target="_blank"
                              >
                                <GlobeAltIcon className="h-6 w-6 hover:fill-current hover:text-blue-800" />
                              </a>
                            )}
                          </div>
                          <p className="text-base text-gray-300 sm:text-sm lg:text-md">
                            {project.Description}
                          </p>
                          {!project?.CandyMachineKey && (
                            <p className="text-base text-gray-300 sm:text-sm lg:text-md mt-3">
                              Public mint begins {project?.CandyMachineConfig.goLiveDate}
                            </p>
                          )}
                          {project?.State == null || (project?.State <= 5 && !isPreSaleEnabled) ?
                            (
                              <div className="flex items-center mt-4 inline">
                              <div className="flex-row px-5 py-2 border rounded-full border-gray-400 ">
                                <p className="text-gray-300 text-xs lg:text-base inline">
                                LAUNCHPAD AVAILABLE SOON
                                </p>
                              </div>
                            </div>)
                            : project?.State == 6 || (project?.State == 5 && isPreSaleEnabled )?  (
                              <>
                            <div className="flex items-center mt-5">
                            <div className="flex-row px-3 py-1 border rounded-full border-gray-400 ">
                            <TicketIcon
                              color="white"
                              className="inline mr-2 w-5 h-5"
                            />
                              <p className="text-base text-gray-300 sm:text-xs lg:text-sm inline">
                                {project.CandyMachineConfig.number}
                              </p>
                            </div>
                            <div className="flex-row px-3 py-1 border rounded-full border-gray-400 ml-2 ">
                              <p className="text-base text-gray-300 sm:text-xs lg:text-sm inline">
                              ◎  {project.CandyMachineConfig.price} SOL
                              </p>
                            </div>


                          </div>
                          {wallet?.publicKey &&
                            <div className="flex-row px-3 py-1 ml-2 mt-2 ">
                            {isWhiteListedUser && isPreSaleEnabled &&
                              <div>
                              <CheckCircleIcon className="w-5 h-5 inline mr-2 stroke-cyan-500"/>
                              <p className="text-base text-gray-300 sm:text-xs lg:text-sm inline">
                              You're eligible for Pre-Sale
                              </p></div>}
                            {isWhiteListedUser && project.DiscountEnabled &&
                                <div>
                                <CheckCircleIcon className="w-5 h-5 inline mr-2 stroke-cyan-500"/>
                                <p className="text-base text-gray-300 sm:text-xs lg:text-sm inline">
                                Discount of {project.DiscountPrice} ◎  will apply
                                </p></div>}
                            </div>
                          }
                          {wallet?.publicKey && project.CandyMachineKey &&
                            <div className="flex space-x-2 mt-8 gap-2 text-sm text-white  uppercase tracking-wide font-semibold sm:mt-10">
                            <MintButton
                              candyMachineId={toPublicKey(project.CandyMachineKey)}
                              config={toPublicKey(project.CandyMachineKey)}
                              connection={connection}
                              startDate={moment(project.CandyMachineConfig.goLiveDate,"DD MMM YYYY HH:mm:ss zz").valueOf()}
                              treasury={toPublicKey(project.CandyMachineConfig.solTreasuryAccount)}
                              txTimeout={txTimeout}
                              hideMintButton={true}
                            />
                            </div>}
                            {!wallet?.publicKey &&
                              <div className="flex space-x-2 mt-8 gap-2 text-sm text-white  uppercase tracking-wide font-semibold sm:mt-10">
                                <ConnectButton/>
                              </div>}
                          </>

                        ):project?.State ==8 ? (
                          <div className="flex items-center mt-4 inline">
                            <div className="flex-row px-5 py-2 border rounded-full border-gray-400 ">
                              <p className="text-base text-gray-300 sm:text-sm lg:text-md inline">
                              MINT ENDED
                              </p>
                            </div>
                              </div>):(
                                <div className="flex items-center mt-4 inline">
                                    <div className="flex-row px-5 py-2 border rounded-full border-red-500 ">
                                      <p className="text-red-500 text-gray-300 sm:text-sm lg:text-md inline">
                                      MINT CURRENTLY UNAVAILABLE
                                      </p>
                                    </div>
                                  </div>)}


                          {/**<p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-md lg:text-lg">
                            Mint Starting on{" "}
                            {dayjs
                              .utc(dayjs.unix(project.CandyMachineConfig.goLiveDate))
                              .format("DD MMM YYYY")}{" "}
                            at{" "}
                            {dayjs
                              .utc(dayjs.unix(project.CandyMachineConfig.goLiveDate))
                              .format("HH:mm")}{" "}
                            UTC
                          </p>

                          <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-md lg:text-lg">
                            Your Time:{" "}
                            {dayjs
                              .unix(fproject.CandyMachineConfig.goLiveDate)
                              .format("DD MMM YYYY")}{" "}
                            at{" "}
                            {dayjs
                              .unix(project.CandyMachineConfig.goLiveDate)
                              .format("HH:mm")}
                          </p>*/}


                          {project && (
                            <p className="flex align-middle">
                              <span className="mt-10 text-gray-500 text-xxs hover:text-gray-200">

                                <br></br>

                                DigitalEyes only provides this landing page to facilitate
                                the launch of this collection. We do not endorse or curate
                                these collections, and buyer discretion is advised at all times

                                {/* DigitalEyes only provides this landing page and
                                minting services to facilitate the launch of this
                                collection. We do not endorse or curate these
                                collections, and buyer discretion is advised at all
                                times. */}

                              </span>
                            </p>
                          )}
                          <div className="mt-5 w-full sm:mx-auto sm:max-w-lg lg:ml-0">
                            <div className="flex flex-wrap items-start justify-between"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>



            </div>

          </>
      </Page>
  )
}

//   return (
//     <Page title="Launchpad | DigitalEyes">
//     <>

//             <img
//               src={MaintenanceBanner}
//               className="z-0 absolute top-0 w-screen object-cover bg-image-gradient opacity-60 h-screen-half"
//             />

//           <div className= "relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="pt-16 sm:pt-10 z-10">
//               <div className="relative text-center">
//                 <h1 className="h1 text-shadow-bg mt-20"> DigitalEyes Launchpad </h1>
//                 <div className="flex justify-evenly flex-col w-full text-center">
//                   <div className="mt-60 mb-80 text-center">
//                     <p className="text-gray-300  capitalize mx-auto w-5/6 text-xl leading-loose text-shadow-bg opacity-80 inline">
//                      🚧 🚧 -- Brand new Launchpad experience coming soon -- 🚧 🚧
//                     </p>
//                     </div>

//                 </div>
//               </div>
//             </div>
//           </div>
//           </>
//     </Page>
//   )
}
