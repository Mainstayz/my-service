const moment = require('moment')

/**
 * 初始化数据
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.initStockPrice = async function (ctx) {
  const query = ctx.query
  const stockPriceService = ctx.services.stockPrice
  try {
    const data = ctx.validateData({
      code: { required: true },
      count: { required: true, type: 'number' }
    }, query)
    await stockPriceService.initStockPrice(data.code, data.count)
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}
/**
 * 添加数据
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.addStockPrice = async function (ctx) {
  const query = ctx.query
  const stockPriceService = ctx.services.stockPrice
  try {
    const data = ctx.validateData({
      code: { required: true }
    }, query)
    await stockPriceService.addStockPrice(data.code)
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取某天数据
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getStockPrice = async function (ctx) {
  const query = ctx.query
  const stockPriceService = ctx.services.stockPrice
  try {
    const data = ctx.validateData({
      code: { required: true },
      date: { required: true }
    }, query)
    const res = await stockPriceService.getStockPrice({
      code: data.code,
      trade_date: moment(data.date).format('YYYYMMDD')
    })
    ctx.body = ctx.resuccess(res || {})
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}
