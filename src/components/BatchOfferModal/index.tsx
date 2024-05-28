
import * as React from 'react';
import { useState } from 'react';
import { amendOfferBatch, cancelOfferBatch, rejectOfferBatch  } from "../../contracts/offer"
import { useWallet } from '../../contexts/wallet';
import { useConnection } from '../../contexts/connection'
import { NotificationModal } from "../NotificationModal"

import './style.css'

const BatchOfferModal = (
  props:{
    selectedDatas: any,
    closeAndReset: any,
    action: string,
  }
) => {
  const {connected, wallet} = useWallet()
  const connection = useConnection()

  const [offerAmount, setOfferAmount] = useState(0)
  const [notificationTitle, setNotificationTitle] = useState(
    "Please don’t close this modal while we confirm your purchase on the blockchain"
  )
  const [notificationDesc, setNotificationDesc] = useState(
    "After wallet approval, your transaction will be finished shortly…"
  )
  const [notificationCanClose, setNotificationCanClose] =
    useState<boolean>(false)
  const [modalTimer, setModalTimer] = useState<number>(0)
  const [buttonLoading, setButtonLoading] = useState(false);
  const closeAndResetModal = () => {
    setButtonLoading(false)
    setNotificationTitle(
      "Please don’t close this modal while we confirm your purchase on the blockchain"
    )
    setNotificationDesc(
      "After wallet approval, your transaction will be finished shortly…"
    )
    setModalTimer(5)
  }
  async function amendOfferBatchFunction( ): Promise<void> {
    setButtonLoading(true)
    try {
      if (wallet) {
        await amendOfferBatch(connection, wallet, props.selectedDatas, offerAmount)

        setNotificationTitle(`Success!`)
        setNotificationDesc(
          `You've successfully updated.`
        )
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
  async function cancelOfferBatchFunction( ): Promise<void> {
    setButtonLoading(true)
    try {
      if (wallet) {
        await cancelOfferBatch(connection, wallet, props.selectedDatas)

        setNotificationTitle(`Success!`)
        setNotificationDesc(
          `You've successfully canceled.`
        )
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

  async function rejectOfferBatchFunction( ): Promise<void> {
    setButtonLoading(true)
    try {
      if (wallet) {
        await cancelOfferBatch(connection, wallet, props.selectedDatas)

        setNotificationTitle(`Success!`)
        setNotificationDesc(
          `You've successfully rejected.`
        )
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
    <div
      className={
         "z-50 fixed flex inset-0 bg-black bg-opacity-90 overflow-y-auto h-full w-full pl-10 pr-10"
      }
      
    >
      <div
        style={{ background: "#2F2F2F", boxShadow: "0px 3px 36px #000000CB" }}
        className="flex-columb m-auto rounded-lg h-auto max-w-2xl overflow-hidden"
      >
        <table className='table table-borderless text-primary'>
          <tbody className='text-secondary'>
            {props.selectedDatas.map((data: any, index: any) => {
              return (
                <tr key={index} className='justify-content-start'>
                  <td>
                    <img src={data.NFT} style={{width: "80px"}} alt='img' />
                  </td>
                  <td>{data.Name}</td>
                  <td>{data.bidAmount}</td>
                  <td className="flex action-btn">
                    {
                      props.action === "Amend" &&
                      <input style={{color: "black"}} value={offerAmount} onChange={(e: any) => {setOfferAmount(e.target.value)}}/>
                    }
                  </td>
                </tr>
              )
            })
            }
          </tbody>
        </table>
        <button className="page-link col-sm-4" onClick={(e) => props.closeAndReset()}>Cancel</button>
        {
          props.action === "Amend" && <button className="page-link col-sm-4" onClick={() => amendOfferBatchFunction()}> Approve</button>
        }
        {
          props.action === "Reject" && <button className="page-link col-sm-4" onClick={() => rejectOfferBatchFunction()}> Approve</button>
        }
        {
          props.action === "Cancel" && <button className="page-link col-sm-4" onClick={() => cancelOfferBatchFunction()}> Approve</button>
        }
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
      </div>

    </div>
  );
};

export default BatchOfferModal;