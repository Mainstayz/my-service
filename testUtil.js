/**
 * Created by xiaobxia on 2018/1/31.
 */
const axios = require('axios');
const moment = require('moment');
console.log(moment('2018-02-02 00:00:00.000Z').isSame('2018-02-05 03:30:00.000Z', 'day'));
axios({
  method: 'get',
  // 更新估值
  // url: 'http://39.108.114.91:3002/${config.project.projectName}/analyze/updateValuation'
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
  // url: 'http://127.0.0.1:3002/${config.project.projectName}/analyze/updateRecentNetValue'
  // 判断开盘
  // url: 'http://127.0.0.1:3002/${config.project.projectName}/schedule/verifyOpening'
  // 回归
  url: 'http://127.0.0.1:3002/myServiceV2/schedule/deleteUnSellFund',
}).then((data) => {
  if (data.data.success) {
    console.log(data.data.data);
  } else {
    console.log(data);
  }
});
