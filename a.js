/**
 * Created by xiaobxia on 2018/1/31.
 */
const request = require('request-promise');
request({
  method: 'get',
  url: `http://localhost:3002/myService/analyze/updateValuation`
});
