/**
 * Created by xiaobxia on 2018/4/7.
 */
const axios = require('axios')

const address = 'http://47.92.210.171:3006'

/**
 * 全部情况--中金在线
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getWebStockdaybarAllZhongjin = async function (ctx) {
  const query = ctx.query
  try {
    const data = ctx.validateData({
      code: { type: 'string', required: true },
      days: { type: 'int', required: false }
    }, query)
    const resData = await axios.get(`${address}/stockData/getStockAllZhongjin?code=${data.code}&days=${data.days || 200}`).then((res) => {
      return res.data
    })
    ctx.body = ctx.resuccess(resData)
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 全部情况--股市通
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getWebStockdaybarAllGushitong = async function (ctx) {
  const query = ctx.query
  try {
    const data = ctx.validateData({
      code: { type: 'string', required: true },
      days: { type: 'int', required: false }
    }, query)
    const resData = await axios.get(`${address}/stockData/getStockAllGushitong?code=${data.code}&days=${data.days || 200}`).then((res) => {
      return res.data
    })
    ctx.body = ctx.resuccess(resData)
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 中金网当天的涨跌情况
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getWebStockdaybarTodayZhongjin = async function (ctx) {
  const query = ctx.query
  try {
    const data = ctx.validateData({
      code: { type: 'string', required: true }
    }, query)
    const resData = await axios.get(`${address}/stockData/getStockTodayZhongjin?code=${data.code}`).then((res) => {
      return res.data
    })
    ctx.body = ctx.resuccess(resData)
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 全部情况--东方财富
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getWebStockdaybarDongfang = async function (ctx) {
  const query = ctx.query
  try {
    const data = ctx.validateData({
      code: { type: 'string', required: true },
      days: { type: 'int', required: false }
    }, query)
    const resData = await axios.get(`${address}/stockData/getStockAllDongfang?code=${data.code}&days=${data.days || 200}`).then((res) => {
      return res.data
    })
    ctx.body = ctx.resuccess(resData)
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 当天的涨跌情况--东方财富渠道
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getWebStockdaybarTodayDongfang = async function (ctx) {
  const query = ctx.query
  try {
    const data = ctx.validateData({
      code: { type: 'string', required: true }
    }, query)
    const resData = await axios.get(`${address}/stockData/getStockTodayDongfang?code=${data.code}`).then((res) => {
      return res.data
    })
    ctx.body = ctx.resuccess(resData)
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 全部情况--东方财富
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getWebStockdaybarTenxun = async function (ctx) {
  const query = ctx.query
  try {
    const data = ctx.validateData({
      code: { type: 'string', required: true },
      days: { type: 'int', required: false }
    }, query)
    const resData = await axios.get(`${address}/stockData/getStockAllTenxun?code=${data.code}&days=${data.days || 200}`).then((res) => {
      return res.data
    })
    ctx.body = ctx.resuccess(resData)
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 当天的涨跌情况--东方财富渠道
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getWebStockdaybarTodayTenxun = async function (ctx) {
  const query = ctx.query
  try {
    const data = ctx.validateData({
      code: { type: 'string', required: true }
    }, query)
    const resData = await axios.get(`${address}/stockData/getStockTodayTenxun?code=${data.code}`).then((res) => {
      return res.data
    })
    ctx.body = ctx.resuccess(resData)
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取上一个交易日
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getLastTradingDay = async function (ctx) {
  const query = ctx.query
  try {
    const data = ctx.validateData({
      way: { type: 'string', required: false }
    }, query)
    const resData = await axios.get(`${address}/stockData/getLastTradingDay?way=${data.way || ''}`).then((res) => {
      return res.data
    })
    ctx.body = ctx.resuccess(resData)
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取交易日
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getTradingDays = async function (ctx) {
  const query = ctx.query
  try {
    const data = ctx.validateData({
      days: { type: 'int', required: false },
      way: { type: 'string', required: false }
    }, query)
    const resData = await axios.get(`${address}/stockData/getTradingDays?days=${data.days || 200}&way=${data.way || ''}`).then((res) => {
      return res.data
    })
    ctx.body = ctx.resuccess(resData)
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取某天开始至今的幅度，包括开始那天
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getWebStockdaybarRate = async function (ctx) {
  const query = ctx.query
  try {
    const data = ctx.validateData({
      code: { type: 'string', required: true },
      start: { type: 'string', required: true },
      way: { type: 'string', required: false }
    }, query)
    const resData = await axios.get(`${address}/stockData/getStockRate?code=${data.code}&start=${data.start}&way=${data.way || ''}`).then((res) => {
      return res.data
    })
    ctx.body = ctx.resuccess(resData)
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}
