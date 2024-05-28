import { useEffect, useState } from 'react';
import { NotificationModal } from "../NotificationModal"
import { acceptOffer, getOfferMade, cancelOffer, getOfferReceived, amendOffer, rejectOffer } from '../../contracts/offer'

import 'font-awesome/css/font-awesome.min.css';

import './style.css'
import { useWallet } from '../../contexts/wallet';
import { useConnection } from '../../contexts/connection'
import BatchOfferModal from '../BatchOfferModal'
const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'Date', headerName: 'DATE', width: 130 },
  { field: 'NFT', headerName: '', type: 'picture', width: 70 },
  { field: 'Name', headerName: 'NAME', width: 150 },
  { field: 'Floor', headerName: 'FLOOR', width: 100 },
  { field: 'Highest', headerName: 'HIGHEST', width: 100 },
  { field: 'Offer', headerName: 'YOUR OFFER', width: 100 },
  { field: 'Status', headerName: 'STATUS', width: 150 },
  { field: 'Actions', headerName: '', width: 400 },

];

export const PageHeader = ({ OfferState }: any) => {

  const [collectionList, setCollectionList] = useState<any>([]);
  const {connected, wallet} = useWallet()
  const connection = useConnection()
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPageNumber, setLastPageNumber] = useState(0);
  const [batchAction, setBatchAction] = useState("Amend")
  const [selectedDatas, setSelectedDatas] = useState<any>([])
  const [notificationTitle, setNotificationTitle] = useState(
    "Please don’t close this modal while we confirm your offer on the blockchain"
  )
  const [notificationDesc, setNotificationDesc] = useState(
    "After wallet approval, your transaction will be finished shortly…"
  )
  const [notificationCanClose, setNotificationCanClose] =
    useState<boolean>(false)
  const [modalTimer, setModalTimer] = useState<number>(0)
  const [buttonLoading, setButtonLoading] = useState(false);
  const [offerAmount, setOfferAmount] = useState(0)
  const [expireTime, setExpireTime] = useState("1D")
  const [showBatchOfferModal, setShowBatchOfferModal] = useState(false)
  const closeAndResetModal = () => {
    setButtonLoading(false)
    setNotificationTitle(
      "Please don’t close this modal while we confirm your offer on the blockchain"
    )
    setNotificationDesc(
      "After wallet approval, your transaction will be finished shortly…"
    )
    setModalTimer(5)
  }
  useEffect(() => {
    getCollectionList();
  }, [perPage, OfferState])

  const getCollectionList = async() => {
    let datas: any = []
    if(OfferState === "Offer Made")
      datas = await getOfferMade(connection, wallet)
    else datas = await getOfferReceived(connection, wallet)
    setLastPageNumber(Math.floor(datas.length / perPage + 1))
    const startNumber = (currentPage - 1) * perPage;
    const lastNumber = startNumber + perPage;
    const draftList = datas.slice(startNumber, lastNumber);
    console.log('getCollectionList', draftList)
    setCollectionList(draftList);
  }

  const changeBidStatus = () => {
    // rows[index].Actions = 1 - rows[index].Actions;
    getCollectionList();
  }

  const returnState = (state: any) => {
    let returnValue;
    switch (state) {
      case 'ACTIVE':
        returnValue = 'active';
        break;
      case 'REJECTED':
        returnValue = 'rejected';
        break;
      case 'INVALID':
        returnValue = 'invalid';
        break;
      case 'CANCELED':
        returnValue = 'canceled';
        break;
      case 'ACCEPTED':
        returnValue = 'active';
        break;
      default:
        break;
    }

    return returnValue;
  }

  async function cancelOfferFunction(
    bidData: any,
  ): Promise<void> {
    setButtonLoading(true)
    try {
      if (wallet) {
        await cancelOffer(connection, wallet, bidData)

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
      changeBidStatus()
    }, 5000)
  }

  async function rejectOfferFunction(
    bidData: any,
  ): Promise<void> {
    setButtonLoading(true)
    try {
      if (wallet) {
        await rejectOffer(connection, wallet, bidData)

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
      changeBidStatus()
    }, 5000)
  }
  
  const expireReturn = () => {
    switch(expireTime) {
      case "1D":
        return new Date().getTime() / 1000 + 86400
        break;
      case "7D":
        return new Date().getTime() / 1000 + 7 * 86400
        break;
      case "1M":
        return new Date().getTime() / 1000 + 30 * 86400
        break;
      case "NV":
        return 0
        break;
    }
    return 0
  }

  async function amendOfferFunction(
    bidData: any,
  ): Promise<void> {
    setButtonLoading(true)
    try {
      if (wallet && offerAmount > 0) {
        await amendOffer(connection, wallet, offerAmount, bidData, expireReturn())

        setNotificationTitle(`Success!`)
        setNotificationDesc(
          `You've successfully ammended.`
        )
        setNotificationCanClose(true)
        setModalTimer(5)
      } else if(offerAmount <= 0) {
        setNotificationTitle(`Faild!`)
        setNotificationDesc(
          `You are making an offer with 0 Sol. lol`
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
      changeBidStatus()
    }, 5000)
  }

  async function acceptOfferFunction(
    bidData: any,
    mintKey: any,
  ): Promise<void> {
    setButtonLoading(true)
    try {
      if (wallet) {
        await acceptOffer(connection, wallet, bidData, mintKey)

        setNotificationTitle(`Success!`)
        setNotificationDesc(
          `You've successfully accepted.`
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
      changeBidStatus()
    }, 5000)
  }

  const closeAndReset = async() => {
    setShowBatchOfferModal(false)
    setSelectedDatas([])
    changeBidStatus()
  }

  return (
    <div >

      {
         OfferState == "Offer Made" && selectedDatas.length > 0 && (
           <>
            Offer Amount: <input style={{color: "black"}} value={offerAmount} onChange={(e: any) => {setOfferAmount(e.target.value)}}/>
            Offer Expire Time : 
            <select value={expireTime} style={{color: "black"}} onChange={(e) => setExpireTime(e.target.value)}>
              <option value="1D">1 Day</option>
              <option value="7D">7 Day</option>
              <option value="1M">1 Month</option>
              <option value="NV">Never</option>
            </select>
            <button className="page-link col-sm-4" onClick={() => {
              setBatchAction("Amend")
              setShowBatchOfferModal(true)
              }}>Amend Offers</button>
            <button className="page-link col-sm-4" onClick={() => {
              setBatchAction("Cancel")
              setShowBatchOfferModal(true)
              }}>Cancel Offers</button>
           </>
        )
      }
      {
        OfferState == "Offer Received" && selectedDatas.length > 0 && (
          <button className="page-link col-sm-4" onClick={() => {
            setBatchAction("Reject")
            setShowBatchOfferModal(true)
          }}>Reject Offers</button>
        )
      }

      {
        showBatchOfferModal && <BatchOfferModal selectedDatas = {selectedDatas} action={batchAction} closeAndReset={closeAndReset} />
      }
      <table className='table table-borderless text-primary'>
        <thead>
          <tr className='justify-content-center'>
            <th style={{ width: '5%' }}><input type="checkbox" style={{ height: 20, width: 20, backgroundColor: 'transparent', borderWidth: 1 }} /></th>
            <th>Date</th>
            <th>img</th>
            <th>Name</th>
            {/* <th>Floor</th> */}
            { OfferState == "Offer Made" && <th>Highest</th>}
            <th>Offer</th>
            <th>Expire Time</th>
            <th>Status</th>
            <th className="flex justify-content-center">Actions</th>
          </tr>
        </thead>
        <tbody className='text-secondary'>
          {collectionList.map((data: any, index: any) => {
            return (
              <tr key={index} className='justify-content-start'>
                <td>
                  <input type="checkbox" style={{ height: 20, width: 20 }} onChange={(e) => {
                      console.log(selectedDatas)
                    if (e.target.checked)
                      setSelectedDatas([...selectedDatas, data])
                    else {
                      setSelectedDatas( selectedDatas.filter((item: any) => item.bidData.toBase58() !== data.bidData.toBase58()))
                    }
                  }}/>
                </td>
                <td>{data.bidTime}</td>
                <td>
                  <img src={data.NFT} style={{width: "80px"}} alt='img' />
                </td>
                <td>{data.Name}</td>
                {/* <td>{data.Floor}</td> */}
                { OfferState == "Offer Made" && <td>{data.Highest}</td> }
                <td>{data.bidAmount}</td>
                <td>{data.expireTime}</td>
                <td className={returnState(data.status)}>{data.status}</td>
                <td className="flex action-btn">
                  {OfferState == 'Offer Made' ?
                    <>
                    {
                      data.status !== "ACCEPTED" && 
                        <>
                          <button className="page-link col-sm-4" onClick={() => amendOfferFunction(data.bidData)}>Amend</button>
                          {
                            data.status !== "CANCELED" && <button className="page-link col-sm-4" onClick={() => cancelOfferFunction(data.bidData)}>Cancel</button>
                          }
                        </>
                    }
                      <button className="page-link col-sm-4">Message Seller</button>
                    </>
                    :
                    <>
                      {
                        data.status === "ACTIVE" && <>
                          <button className="page-link col-sm-4" onClick={() => acceptOfferFunction( data.bidData, data.nftMint)}> Accept</button>
                          <button className="page-link col-sm-4" onClick={() => rejectOfferFunction( data.bidData)}> Reject</button>
                        </>
                      }
                    </>
                  }
                </td>
              </tr>
            )
          })
          }
        </tbody>
      </table>
      <div>
        <li className="flex align-items-center pagination pagination-sm justify-content-between pagination-main">
          <ul className="pagination pagination-sm d-flex paginationIcon">
            <li className="page-item">
              <a className="page-link" onClick={() => setCurrentPage(1)}><i className='fa fa-fast-backward'></i></a>
            </li>
            <li className="page-item">
              <a className={`${currentPage === 1 ? 'disabled page-link' : 'page-link'}`} onClick={() => setCurrentPage(currentPage - 1)}><i className='fa fa-backward'></i></a>
            </li>
            <li className="page-item">
              <a className={`${currentPage === lastPageNumber ? 'disabled page-link' : 'page-link'}`} onClick={() => setCurrentPage(currentPage + 1)}><i className='fa fa-forward'></i></a>
            </li>
            <li className="page-item">
              <a className="page-link" onClick={() => setCurrentPage(lastPageNumber)}><i className='fa fa-fast-forward'></i></a>
            </li>
            <li className='flex align-item-center goToPage'>
              <label>page {currentPage} of {lastPageNumber} | Go to page: </label>
            </li>
          </ul>
          <ul className='float-end'>
            <li className='page-item'>
              <select value={perPage} className="page-link" onChange={(e) => setPerPage(Number(e.target.value))}>
                <option value='5'>5</option>
                <option value='10'>10</option>
                <option value='15'>15</option>
                <option value='20'>20</option>
              </select>
            </li>
          </ul>
        </li>
      </div>
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
  );
};