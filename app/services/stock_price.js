const Proxy = require('../proxy')

const StockPriceProxy = Proxy.StockPrice

/**
 * 添加数据，大量数据添加
 */
exports.addStockPrice = async function (list) {
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const ifHas = await StockPriceProxy.check({
      code: item.code,
      trade_date: item.trade_date
    })
    if (!ifHas) {
      return StockPriceProxy.newAndSave({
        code: item.code,
        close: item.close,
        high: item.high,
        low: item.low,
        netChangeRatio: item.netChangeRatio,
        open: item.open,
        preClose: item.preClose,
        trade_date: item.trade_date
      })
    }
  }
}

/**
 * 获取某日的信息
 * @param query
 * @returns {Promise<*>}
 */
exports.getStockPrice = async function (query) {
  return StockPriceProxy.findOne(query)
}
