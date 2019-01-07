const axios = require('axios')
const Proxy = require('../proxy')
const moment = require('moment')

const StockPriceProxy = Proxy.StockPrice

const address = 'http://47.98.140.76:3016'
/**
 * 添加数据，大量数据添加
 */
exports.initStockPrice = async function (code, count) {
  const resData = await axios.get(`${address}/stockData/getStockAllDongfang?code=${code}&days=${count || 200}`).then((res) => {
    return res.data
  })
  let list = resData.list
  let opList = []
  // 新的数据在前面
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const ifHas = await StockPriceProxy.check({
      code: code,
      trade_date: item.date
    })
    if (!ifHas) {
      opList.push(StockPriceProxy.newAndSave({
        code: code,
        trade_date: item.date,
        close: item.kline.close,
        high: item.kline.high,
        low: item.kline.low,
        netChangeRatio: item.kline.netChangeRatio,
        open: item.kline.open,
        preClose: item.kline.preClose
      }))
    }
  }
  return Promise.all(opList)
}

/**
 * 添加股票数据
 * @param code
 * @returns {Promise<*>}
 */
exports.addStockPrice = async function (code) {
  const resData = await axios.get(`${address}/stockData/getStockTodayDongfang?code=${code}`).then((res) => {
    return res.data
  })
  const date = moment(resData.tradeTime).format('YYYYMMDD')
  const ifHas = await StockPriceProxy.check({
    code: code,
    trade_date: date
  })
  if (!ifHas) {
    return StockPriceProxy.newAndSave({
      code: code,
      trade_date: date,
      close: resData.close,
      high: resData.high,
      low: resData.low,
      netChangeRatio: resData.netChangeRatio,
      open: resData.open,
      preClose: resData.preClose
    })
  }
  return true
}

/**
 * 获取某日的信息
 * @param query
 * @returns {Promise<*>}
 */
exports.getStockPrice = async function (query) {
  return StockPriceProxy.findOne(query)
}
