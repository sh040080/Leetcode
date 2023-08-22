import { useState, useEffect, Fragment } from "react";
import axios from 'axios'
import "./res/index.css";

const USER_NO = 'ME00001'
const LIMIT = 5

const INITIAL_SUMMARY = {
  count: 0,
  minute: 0,
  distance: 0,
  carbonReduction: 0
}

const INITIAL_USAGE = {
  list: []
}

/*단위변경 (미터 -> 킬로미터)*/
const meterToKiltometer = (value = 0) => {
  return (value/1000).toFixed(1)
}

/*카드포인트 문구 생성*/
const getTotalPaymentString = (cardPay = 0, pointPay = 0) => {
  let totalPayment = ''
  if(cardPay !== 0 && pointPay !== 0) {
    totalPayment = `카드 ${cardPay}원 + 포인트 ${pointPay}P`
  } else if( cardPay !== 0 && pointPay === 0) {
    totalPayment = `카드 ${cardPay}원`
  } else if( cardPay === 0 && pointPay !== 0) {
    totalPayment = `포인트 ${pointPay}P`
  } else {
    totalPayment = ''
  }
  return totalPayment
}


function App() {

  const [ptype, setPtype] = useState(1)

  const [userName, setUserName] = useState('')
  const [summary, setSummary] = useState(INITIAL_SUMMARY)
  const [usage, setUsage] = useState(INITIAL_USAGE)

  const getUserName = () => {
    axios.get(`http://localhost:8080/api/v1/user/${USER_NO}`)
      .then(response => {
        setUserName(response.data?.name)
      })
  }

  const getSummary = () => {
    axios.get(`http://localhost:8080/api/v1/user/${USER_NO}/usage/summary?ptype=${ptype}`)
      .then(response => {
        const newSummary = {
          count: response.data?.usage_count ?? 0,
          minute: response.data?.usage_minute ?? 0,
          distance: meterToKiltometer(response.data?.usage_meter),
          carbonReduction: (response.data?.carbon_reduction)?.toFixed(1) ?? 0
        }
        setSummary(newSummary)
      })
  }

  const getUsage = () => {
    axios.get(`http://localhost:8080/api/v1/user/${USER_NO}/usage?ptype=${ptype}&offset=0&limit=${LIMIT}`)
      .then(response => {
        const data = response.data
        const newUsage = {
          list: data.list
        }
        setUsage(newUsage)
      })    
  }

  const handleTabClick = (e) => {
    const _ptype = +e.target.dataset.ptype
    setPtype(_ptype)
  }

  useEffect(()=>{
    getSummary()
    getUsage()
     // eslint-disable-next-line
  },[ptype])

  useEffect(()=>{
    getUserName()
  },[])

  return (
    <div>
      <div className="main-title">
        <h1>서비스 이용내역</h1>
        <div>{userName}</div>
      </div>
      <hr />

      <div className="service-summary">
        <div className="service-summary-tab">
          <button data-ptype="1" className={`tablinks ${ptype === 1 ? 'on' : null}`} onClick={handleTabClick}>1주일</button>
          <button data-ptype="2" className={`tablinks ${ptype === 2 ? 'on' : null}`} onClick={handleTabClick}>1개월</button>
          <button data-ptype="3" className={`tablinks ${ptype === 3 ? 'on' : null}`} onClick={handleTabClick}>3개월</button>
        </div>
        <div className="spacer-20"></div>
        <div className="service-summary-detail-container">
          <div className="color-gray">이용건수</div>
          <div>{summary.count}건</div>
          <div className="color-gray">이용시간</div>
          <div>{summary.minute}분</div>
          <div className="color-gray">이동거리</div>
          <div>{summary.distance}km</div>
          <div className="color-gray">탄소절감효과</div>
          <div>{summary.carbonReduction}kg</div>
        </div>
      </div>

      <hr />

      {usage.list.length > 0 ? (
        <Fragment>
          <div className="service-list-container">
            {usage.list.map(item => {
              const distance = item?.use_distance ? meterToKiltometer(item?.use_distance): 0
              const time = item?.use_time ?? 0
              const timeRange = `${item?.use_start_dt} ~ ${item?.use_end_dt}`
              const payDateTime = item?.pay_datetime
              const totalPayment = getTotalPaymentString(item?.card_pay, item?.point_pay)

              return (
                <Fragment key={item.use_no}>
                  <div className="service-list-content">
                    <div className="service-list-header">
                      <span>{distance}km</span>
                      <span className="color-gray ml-10">{time}분</span>
                    </div>
                    <div className="service-list-body">
                      <div className="color-gray">이용시간</div>
                      <div>{timeRange}</div>
                      <div className="color-gray">결제일시</div>
                      <div>{payDateTime}</div>
                      <div className="color-gray">결제수단</div>
                      <div>{totalPayment}</div>
                    </div>
                  </div>
                  <hr />  
                </Fragment>
              )
            })}
          </div>
        </Fragment>
      ) : (
        <div className="service-empty">
          <div className="service-empty-container">
            <div className="service-empty-message">
              조회된 정보가 없습니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
