/**
 * Created by xiaobxia on 2018/4/7.
 */
const axios = require('axios');
const moment = require('moment');

/**
 * 查询股票的走势信息
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getWebStockdaybar = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    let count = 0;
    for (let i = 1; i < 36; i++) {
      if (moment('2018-03-01').add(i * 31, 'days').isAfter(moment())) {
        count = i * 25;
        break;
      }
    }
    let resData = await axios.get(`https://gupiao.baidu.com/api/stocks/stockdaybar?from=pc&os_ver=1&cuid=xxx&vv=100&format=json&stock_code=${data.code}&step=3&start=&count=${count}&fq_type=no&timestamp=${Date.now()}`, {
      headers: {
        Referer: `https://gupiao.baidu.com/stock/${data.code}.html?from=aladingpc`
      }
    });
    ctx.body = ctx.resuccess({
      list: resData.data.mashData
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getWebStockdaybarAll = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    let resData = await axios.get(`https://gupiao.baidu.com/api/stocks/stockdaybar?from=pc&os_ver=1&cuid=xxx&vv=100&format=json&stock_code=${data.code}&step=3&start=&count=200&fq_type=no&timestamp=${Date.now()}`, {
      headers: {
        Referer: `https://gupiao.baidu.com/stock/${data.code}.html?from=aladingpc`
      }
    });
    ctx.body = ctx.resuccess({
      list: resData.data.mashData
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
