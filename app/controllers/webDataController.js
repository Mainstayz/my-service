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
    let code = '';
    if (data.code.indexOf('sh') !== -1) {
      code = data.code.substring(2) + 'K'
    } else if (data.code.indexOf('sz') !== -1) {
      code = data.code.substring(2) + 'J'
    }
    let resData = await axios({
      method: 'get',
      url: `http://v2.quotes.api.cnfol.com/chart.html?action=getStockKline&stockid=${code}&type=1&limit=${count}&callback=jQuery1120020910699759913287_1532932371008&_=1532932371009`,
    }).then((data) => {
      let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'));
      let list = JSON.parse(str).List;
      let listTemp = [];
      for (let i = list.length - 1; i >= 0; i--) {
        let item = list[i];
        listTemp.push({
          date: moment(new Date(item[0])).format('YYYYMMDD'),
          close: item[4],
          high: item[2],
          low: item[3],
          netChangeRatio: item[7],
          open: item[1],
          preClose: i === 0 ? item[1] : list[i - 1][4]
        });
      }
      return listTemp;
    });
    // let resData = await axios.get(`https://gupiao.baidu.com/api/stocks/stockdaybar?from=pc&os_ver=1&cuid=xxx&vv=100&format=json&stock_code=${data.code}&step=3&start=&count=${count}&fq_type=no&timestamp=${Date.now()}`, {
    //   headers: {
    //     Referer: `https://gupiao.baidu.com/stock/${data.code}.html?from=aladingpc`
    //   }
    // });
    let list = resData;
    let listTemp = [];
    for (let i = 0; i < list.length; i++) {
      listTemp.push({
        date: list[i].date,
        kline: {
          close: list[i].close,
          high: list[i].high,
          low: list[i].low,
          netChangeRatio: list[i].netChangeRatio,
          open: list[i].open,
          preClose: list[i].preClose
        }
      })
    }
    ctx.body = ctx.resuccess({
      list: listTemp
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getWebStockdaybarAll = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true},
      days: {type: 'int', required: false}
    }, query);
    let code = '';
    if (data.code.indexOf('sh') !== -1) {
      code = data.code.substring(2) + 'K'
    } else if (data.code.indexOf('sz') !== -1) {
      code = data.code.substring(2) + 'J'
    }
    let resData = await axios({
      method: 'get',
      url: `http://v2.quotes.api.cnfol.com/chart.html?action=getStockKline&stockid=${code}&type=1&limit=${data.days || 200}&callback=jQuery1120020910699759913287_1532932371008&_=1532932371009`,
    }).then((data) => {
      let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'));
      let list = JSON.parse(str).List;
      let listTemp = [];
      for (let i = list.length - 1; i >= 0; i--) {
        let item = list[i];
        listTemp.push({
          date: moment(new Date(item[0])).format('YYYYMMDD'),
          close: item[4],
          high: item[2],
          low: item[3],
          netChangeRatio: item[7],
          open: item[1],
          preClose: i === 0 ? item[1] : list[i - 1][4]
        });
      }
      return listTemp;
    });
    let list = resData;
    let listTemp = [];
    for (let i = 0; i < list.length; i++) {
      listTemp.push({
        date: list[i].date,
        kline: {
          close: list[i].close,
          high: list[i].high,
          low: list[i].low,
          netChangeRatio: list[i].netChangeRatio,
          open: list[i].open,
          preClose: list[i].preClose
        }
      })
    }
    let nowItem = await axios({
      method: 'get',
      url: `http://v2.quotes.api.cnfol.com/stock.html?action=getStockPrice&sid=${code}&fieldseq=11111111111111101100000000010001&callback=StockPrice.GetData&_t=143010`,
    }).then((data) => {
      let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'));
      return JSON.parse(str).List[0];
    });
    let date = listTemp[0].date;
    listTemp.splice(0, 1, {
      date: date,
      kline: {
        close: nowItem.ClosePrice,
        high: nowItem.HighPrice,
        low: nowItem.LowPrice,
        netChangeRatio: nowItem.DiffPriceRate,
        open: nowItem.OpenPrice,
        preClose: nowItem.RefPrice
      }
    });
    ctx.body = ctx.resuccess({
      list: listTemp
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getWebStockdaybarAllOld = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true},
      days: {type: 'int', required: false}
    }, query);
    let resData = await axios.get(`https://gupiao.baidu.com/api/stocks/stockdaybar?from=pc&os_ver=1&cuid=xxx&vv=100&format=json&stock_code=${data.code}&step=3&start=&count=${data.days || 200}&fq_type=no&timestamp=${Date.now()}`, {
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
}
