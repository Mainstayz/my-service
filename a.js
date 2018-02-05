/**
 * Created by xiaobxia on 2018/1/31.
 */
const request = require('request-promise');
const moment = require('moment');
console.log(moment('2018-02-02 00:00:00.000Z').isSame('2018-02-05 03:30:00.000Z', 'day'));
request({
  method: 'get',
  url: `http://localhost:3002/myService/analyze/addRecentNetValue`
});

console.log(parseInt((1.009 - 1) * 10000) / 100)
