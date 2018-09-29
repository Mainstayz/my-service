/**
 * Created by xiaobxia on 2018/1/31.
 */
const axios = require('axios');
const moment = require('moment');
// console.log(moment('2018-02-02 00:00:00.000Z').isSame('2018-02-05 03:30:00.000Z', 'day'));
axios({
  method: 'get',
  // 更新估值
  //url: 'http://127.0.0.1:3002/myService/schedule/updateRate'
  // url: 'http://127.0.0.1:3002/${config.project.projectName}/analyze/updateValuation'
  // 更新净值
  // url: 'http://39.108.114.91:3002/${config.project.projectName}/analyze/updateBaseInfo'
  // url: 'http://127.0.0.1:3002/${config.project.projectName}/analyze/updateBaseInfo'
  // 更好估值
  // url: 'http://39.108.114.91:3002/${config.project.projectName}/analyze/betterValuation'
  // url: 'http://127.0.0.1:3002/${config.project.projectName}/analyze/betterValuation'
  // 添加净值
  // url: 'http://39.108.114.91:3002/${config.project.projectName}/analyze/addRecentNetValue'
  // url: 'http://127.0.0.1:3002/${config.project.projectName}/analyze/addRecentNetValue'
  // 策略
  // url: 'http://127.0.0.1:3002/${config.project.projectName}/analyze/getStrategy'
  // 强制更新净值
  // url: 'http://127.0.0.1:3002/myService/schedule/updateRecentNetValue'
  // 判断开盘
  // url: `http://47.98.140.76:3002/myService/schedule/verifyOpening`,
  // 回归
  // url: 'http://127.0.0.1:3002/myServiceV2/schedule/verifyOpening',
  // 邮件
  //url: `http://47.98.140.76:3002/myService/test/testEmail`
  url: `http://127.0.0.1:3002/myService/fund/initUserFundPosition`
}).then((data) => {
  if (data.data.success) {
    console.log(data.data.data);
  } else {
    console.log(data);
  }
});
// axios({
//   method: 'get',
//   url: 'http://v2.quotes.api.cnfol.com/chart.html?action=getStockKline&stockid=000001K&type=1&limit=100&callback=jQuery1120020910699759913287_1532932371008&_=1532932371009',
// }).then((data) => {
//   let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'));
//   let list = JSON.parse(str).List;
//   let listTemp = [];
//   for (let i = list.length - 1; i >= 0; i--) {
//     let item = list[i];
//     listTemp.push({
//       close: item[4],
//       high: item[2],
//       low: item[3],
//       netChangeRatio: item[7],
//       open: item[1],
//       preClose: i === 0 ? item[1] : list[i - 1][4]
//     });
//   }
  // console.log(moment(new Date(list[list.length - 1][0])).format('YYYYMMDD'))
  // console.log(list[list.length - 1])
  // axios({
  //   method: 'get',
  //   url: 'http://v2.quotes.api.cnfol.com/stock.html?action=getStockPrice&sid=000001K&fieldseq=11111111111111101100000000010001&callback=StockPrice.GetData&_t=143010',
  // }).then((data) => {
  //   let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'));
  //   let item = JSON.parse(str).List[0];
  //   console.log(item)
  //   listTemp.splice(0,1 ,{
  //     close: item.ClosePrice,
  //     high: item.HighPrice,
  //     low: item.LowPrice,
  //     netChangeRatio: item.DiffPriceRate,
  //     open: item.OpenPrice,
  //     preClose: RefPrice
  //   })
  // });
// });
// axios({
//   method: 'get',
//   url: 'http://pdfm.eastmoney.com/EM_UBG_PDTI_Fast/api/js?rtntype=5&token=4f1862fc3b5e77c150a2b985b12db0fd&cb=jQuery183018258284170372074_1534312345300&id=0000011&type=r&iscr=false&_=1534312487848',
// }).then((data) => {
//   let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'));
//   console.log(JSON.parse(str).info);
// });
