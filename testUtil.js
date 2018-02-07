/**
 * Created by xiaobxia on 2018/1/31.
 */
const request = require('request-promise');
const moment = require('moment');
console.log(moment('2018-02-02 00:00:00.000Z').isSame('2018-02-05 03:30:00.000Z', 'day'));
request({
  method: 'get',
  // url: 'http://39.108.114.91:3002/myService/analyze/updateValuation'
  url: 'http://127.0.0.1:3002/myService/analyze/updateValuation'
  // url: 'http://39.108.114.91:3002/myService/analyze/updateBaseInfo'
  // url: 'http://127.0.0.1:3002/myService/analyze/updateBaseInfo'
  // url: 'http://39.108.114.91:3002/myService/analyze/betterValuation'
  // url: 'http://127.0.0.1:3002/myService/analyze/betterValuation'
  // url: 'http://39.108.114.91:3002/myService/analyze/addRecentNetValue'
  // url: 'http://127.0.0.1:3002/myService/analyze/addRecentNetValue'
});
