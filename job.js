/**
 * Created by xiaobxia on 2018/2/7.
 */
const request = require('request-promise');

request({
  method: 'get',
  url: `http://127.0.0.1:3002/myService/analyze/updateBaseInfo`
});

setTimeout(function () {
  request({
    method: 'get',
    url: `http://127.0.0.1:3002/myService/analyze/betterValuation`
  });
}, 1000 * 60);

setTimeout(function () {
  request({
    method: 'get',
    url: `http://127.0.0.1:3002/myService/analyze/addRecentNetValue`
  });
}, 1000 * 60 * 2);
