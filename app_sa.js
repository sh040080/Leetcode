import { useState, useEffect } from "react";
import axios from 'axios'
import "./res/index.css";

const USER_NO = 'ME00001'

const INITIAL_SUMMARY = {
  count : 0,
  time : 0,
  distance : 0,
  carbonReduction : 0
}

const INITIAL_USAGE = {
  list : []
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

  const [summary, setSummary] = useState(INITIAL_SUMMARY)
  const [usage, setUsage] = useState(INITIAL_USAGE)
  const [userName, setUserName] = useState('')

   const getUserName = () => {
    try {
    axios.get(`http://localhost:8080/api/v1/user/${USER_NO}`)
      .then(response => {
      console.log('response',response)
        setUserName(response.data?.name)
      })

    } catch (error) {
      console.log('error',error)
       setUserName('무명사용자')
    }

    console.log('userName', userName)
  }

  const getSummary = () => {
    // URL : http://localhost:8080/api/v1/user/:user_no/usage/summary
    // Path parameters : user_no / string / ME00001
    // URL parameter : ptype / int / 1  ---------------> 숫자
    axios.get(`http://localhost:8080/api/v1/user/${USER_NO}/usage/summary?ptype=${ptype}`)
      .then(response => {
        console.log(response)

        const newSummary = {
          count : response.data?.usage_count ?? 0,
          time : response.data?.usage_minute ?? 0,
          distance : meterToKiltometer(response.data?.usage_meter),
          carbonReduction : (response.data?.carbon_reduction)?.toFixed(1) ?? 0
        }
        setSummary(newSummary)
      })
  }

  const getUsage = () => {

    // URL : http://localhost:8080/api/v1/user/:user_no/usage
    // Path parameters : user_no / string / ME00001
    // URL parameter : ptype / int / 1  ---------------> 숫자
    axios.get(`http://localhost:8080/api/v1/user/${USER_NO}/usage?ptype=${ptype}`)
      .then(response => {
        console.log(response)

        const newUsage = {
          list : response.data.list
        }
        setUsage(newUsage)
      })
      // const newUsageListArray = {
      //     list :[{lineNo:3},{lineNo:5}]
      //   }

      const newUsageListArray = {
        list : [{distance : 5, time : 55},{distance : 3, time : 33}]
      }
    setUsage(newUsageListArray)
  }


  const handleTabClick = (e) => {
     setPtype(+e.target.dataset.ptype) // datatype! , integer 일때 + 붙여줌
  }

  const meterToKiltometer = (value = 0) => {
      return (value/1000).toFixed(1); // 소수점 1자리까지 보여줌
  }

  // 방법 1 : MyComponent method 생성
  // 1-1 : <hr /> 아랫줄에 <MyComponentLength length={usage.list[0].lineNo}/> 로 call
        // const newUsageLength1 = {
        //   list :{length:3}
        // }
  // 1-2 : <hr /> 아랫줄에 <MyComponentLength length={usage.list.length}/>
      //   const newUsageListArray = {
      //     list :[{lineNo:3},{lineNo:5}]
      //   }
      // setUsage(newUsageListArray)

  function MyComponentLength({length}) {
    console.log('length',{length})
    const distance = 1;
    const timeRange = "2023-07-07"
    const payDateTime = "2023-07-07"
    const totalPayment = "카드"
    const elements = Array.from({length}, (_, index) => (
      <div key = {index}>
          <div className="service-list-content">
            <div className="service-list-header">
              <span>{distance}km</span>
              <span className="color-gray ml-10">{index}분</span>
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
        </div>
    ));
    return <>{elements}</> ;
  }

  function MyComponentList(list) {
    console.log('list',list)
    console.log('length',{list}.length)
    console.log('time[0]',{list}[0].time)
    console.log('distance[1]',list[1].distance)
    var index = 1

    list.map(item => {
      const distance = item?.distance ? meterToKiltometer(item?.distance) : 0
      const time = item?.time ?? 0
      const payDateTime = "2023-07-07"
      const totalPayment = "카드"
      index += 1
      console.log('distance',distance)
      console.log('time',time)

      return (
      <>
        <div key = {index}>
          <div className="service-list-content">
            <div className="service-list-header">
              <span>{distance}km</span>
              <span className="color-gray ml-10">{index}분</span>
            </div>
            <div className="service-list-body">
              <div className="color-gray">이용시간</div>
              <div>{time}</div>
              <div className="color-gray">결제일시</div>
              <div>{payDateTime}</div>
              <div className="color-gray">결제수단</div>
              <div>{totalPayment}</div>
            </div>
          </div>
          <hr />
        </div>
      </>
    )
    });
  }

  useEffect(()=>{ // 컴포넌트가 마운트 됐을때, API로부터 data 받아옴
    getSummary()
    getUsage()
  },[ptype]) // array안의 변수 값이 바뀔 때마다 useEffect가 새로 실행됨.

  useEffect(()=>{
    getUserName()
  },[]) // 빈 array는 컴포넌트 마운트 시에 한번만 실행됨, what if , 빈 array 마저 없다면, 모든 컴포넌트가 업데이트될때마다 새로 실행됨.

  return (
    <div>
      <div className="main-title">
        <h1>서비스 이용내역 내역</h1>
        <div>{userName}</div>
      </div>
      <hr />
      <div className="service-summary">
        <div className="service-summary-tab" id="tab-period">
          <button data-ptype="1" className={`tablinks ${ptype === 1 ? 'on' : null}`} onClick={handleTabClick}>1주일</button>
          <button data-ptype="2" className={`tablinks ${ptype === 2 ? 'on' : null}`} onClick={handleTabClick}>1개월</button>
          <button data-ptype="3" className={`tablinks ${ptype === 3 ? 'on' : null}`} onClick={handleTabClick}>3개월</button>
        </div>
        <div className="spacer-20"></div>
        <div className="service-summary-detail-container">
          <div className="color-gray">이용건수</div>
          <div>{summary.count}건</div>
          <div className="color-gray">이용시간</div>
          <div>{summary.time}분</div>
          <div className="color-gray">이동거리</div>
          <div>{summary.distance}km</div>
          <div className="color-gray">탄소절감효과</div>
          <div>{summary.carbonReduction}kg</div>
        </div>
      </div>

      <hr />

      { console.log('usage.list.length',usage.list.length)}
      {
       usage.list.length > 0 ? (
          <MyComponentList list={usage.list} />
        ) : (
          <div className="service-empty">
            <div className="service-empty-container">
              <div className="service-empty-message">
                조회된 정보가 없습니다.
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default App;
