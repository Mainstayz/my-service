/**
 * Created by xiaobxia on 2018/2/7.
 */
const request = require('request-promise');

request({
  method: 'get',
  url: `http://127.0.0.1:3002/myService/analyze/updateBaseInfo`
}).then(()=>{
  return request({
    method: 'get',
    url: `http://127.0.0.1:3002/myService/analyze/betterValuation`
  });
}).then(()=>{
  return  request({
    method: 'get',
    url: `http://127.0.0.1:3002/myService/analyze/addRecentNetValue`
  });
});
