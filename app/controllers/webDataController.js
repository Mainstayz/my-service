/**
 * Created by xiaobxia on 2018/4/7.
 */
const axios = require('axios')
const moment = require('moment')
const util = require('../util')

const numberUtil = util.numberUtil

function formatDongfangData (rawData) {
  return {
    close: rawData.c,
    high: rawData.h,
    low: rawData.l,
    netChangeRatio: numberUtil.countDifferenceRate(rawData.c, rawData.yc),
    open: rawData.o,
    preClose: rawData.yc,
    tradeTime: rawData.time
  }
}

function formatDongfangCode (code) {
  let codeId = ''
  if (code.indexOf('sh') !== -1) {
    codeId = code.substring(2) + '1'
  } else if (code.indexOf('sz') !== -1) {
    codeId = code.substring(2) + '2'
  }
  return codeId
}

function formatZhongjinData (rawData) {
  return {
    close: rawData.ClosePrice,
    high: rawData.HighPrice,
    low: rawData.LowPrice,
    netChangeRatio: rawData.DiffPriceRate,
    open: rawData.OpenPrice,
    preClose: rawData.RefPrice,
    tradeTime: rawData.TradeTime
  }
}

function formatZhongjinCode (code) {
  let codeId = ''
  if (code.indexOf('sh') !== -1) {
    codeId = code.substring(2) + 'K'
  } else if (code.indexOf('sz') !== -1) {
    codeId = code.substring(2) + 'J'
  }
  return codeId
}

function formatKline (rawData) {
  return {
    close: rawData.close,
    high: rawData.high,
    low: rawData.low,
    netChangeRatio: rawData.netChangeRatio,
    open: rawData.open,
    preClose: rawData.preClose
  }
}

function getAllDataByZhongjin (code, count) {
  return axios({
    method: 'get',
    url: `http://v2.quotes.api.cnfol.com/chart.html?action=getStockKline&stockid=${code}&type=1&limit=${count}&callback=jQuery1120020910699759913287_1532932371008&_=1532932371009`
  }).then((data) => {
    let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'))
    let list = JSON.parse(str).List
    let listTemp = []
    for (let i = list.length - 1; i >= 0; i--) {
      let item = list[i]
      listTemp.push({
        date: moment(new Date(item[0])).format('YYYYMMDD'),
        close: item[4],
        high: item[2],
        low: item[3],
        netChangeRatio: item[7],
        open: item[1],
        preClose: i === 0 ? item[1] : list[i - 1][4]
      })
    }
    return listTemp
  })
}

/**
 * 查询股票的走势信息
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getWebStockdaybar = async function (ctx) {
  const query = ctx.query
  try {
    const data = ctx.validateData({
      code: { type: 'string', required: true }
    }, query)
    // let count = 0
    for (let i = 1; i < 36; i++) {
      if (moment('2018-03-01').add(i * 31, 'days').isAfter(moment())) {
        // count = i * 25
        break
      }
    }
    let code = formatZhongjinCode(data.code)
    // let resData = await axios.get(`https://gupiao.baidu.com/api/stocks/stockdaybar?from=pc&os_ver=1&cuid=xxx&vv=100&format=json&stock_code=${data.code}&step=3&start=&count=${count}&fq_type=no&timestamp=${Date.now()}`, {
    //   headers: {
    //     Referer: `https://gupiao.baidu.com/stock/${data.code}.html?from=aladingpc`
    //   }
    // });
    let list = await getAllDataByZhongjin(code, data.days || 200)
    let listTemp = []
    for (let i = 0; i < list.length; i++) {
      listTemp.push({
        date: list[i].date,
        kline: formatKline(list[i])
      })
    }
    ctx.body = ctx.resuccess({
      list: listTemp
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

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
    let code = formatZhongjinCode(data.code)
    let list = await getAllDataByZhongjin(code, data.days || 200)
    let listTemp = []
    for (let i = 0; i < list.length; i++) {
      listTemp.push({
        date: list[i].date,
        kline: formatKline(list[i])
      })
    }
    let nowItem = await axios({
      method: 'get',
      url: `http://v2.quotes.api.cnfol.com/stock.html?action=getStockPrice&sid=${code}&fieldseq=11111111111111101100000000010001&callback=StockPrice.GetData&_t=143010`
    }).then((data) => {
      let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'))
      return JSON.parse(str).List[0]
    })
    let date = listTemp[0].date
    let dataNow = moment(nowItem.TradeTime).format('YYYYMMDD')
    if (date === dataNow) {
      listTemp.splice(0, 1, {
        date: date,
        kline: formatZhongjinData(nowItem)
      })
    } else {
      listTemp.splice(0, 0, {
        date: date,
        kline: formatZhongjinData(nowItem)
      })
    }
    ctx.body = ctx.resuccess({
      list: listTemp
    })
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
    let resData = await axios.get(`https://gupiao.baidu.com/api/stocks/stockdaybar?from=pc&os_ver=1&cuid=xxx&vv=100&format=json&stock_code=${data.code}&step=3&start=&count=${data.days || 200}&fq_type=no&timestamp=${Date.now()}`, {
      headers: {
        Referer: `https://gupiao.baidu.com/stock/${data.code}.html?from=aladingpc`
      }
    })
    ctx.body = ctx.resuccess({
      list: resData.data.mashData
    })
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
    let code = formatZhongjinCode(data.code)
    let nowItem = await axios({
      method: 'get',
      url: `http://v2.quotes.api.cnfol.com/stock.html?action=getStockPrice&sid=${code}&fieldseq=11111111111111101100000000010001&callback=StockPrice.GetData&_t=143010`
    }).then((data) => {
      let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'))
      return JSON.parse(str).List[0]
    })
    ctx.body = ctx.resuccess(formatZhongjinData(nowItem))
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
    let code = formatZhongjinCode(data.code)
    let codeId = formatDongfangCode(data.code)
    let list = await getAllDataByZhongjin(code, data.days || 200)
    let listTemp = []
    for (let i = 0; i < list.length; i++) {
      listTemp.push({
        date: list[i].date,
        kline: formatKline(list[i])
      })
    }
    let nowItem = await axios({
      method: 'get',
      url: `http://pdfm.eastmoney.com/EM_UBG_PDTI_Fast/api/js?rtntype=5&token=4f1862fc3b5e77c150a2b985b12db0fd&cb=jQuery183018258284170372074_1534312345300&id=${codeId}&type=r&iscr=false&_=1534312487848`
    }).then((data) => {
      let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'))
      return JSON.parse(str).info
    })
    let date = listTemp[0].date
    let dataNow = moment(nowItem.time).format('YYYYMMDD')
    // 如果当天没有重合那就直接加，如果当天有重合就删除再加
    if (date === dataNow) {
      listTemp.splice(0, 1, {
        date: date,
        kline: formatDongfangData(nowItem)
      })
    } else {
      listTemp.splice(0, 0, {
        date: date,
        kline: formatDongfangData(nowItem)
      })
    }
    ctx.body = ctx.resuccess({
      list: listTemp
    })
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
    let codeId = formatDongfangCode(data.code)
    let nowItem = await axios({
      method: 'get',
      url: `http://pdfm.eastmoney.com/EM_UBG_PDTI_Fast/api/js?rtntype=5&token=4f1862fc3b5e77c150a2b985b12db0fd&cb=jQuery183018258284170372074_1534312345300&id=${codeId}&type=r&iscr=false&_=1534312487848`
    }).then((data) => {
      let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'))
      return JSON.parse(str).info
    })
    ctx.body = ctx.resuccess(formatDongfangData(nowItem))
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
  try {
    let code = formatZhongjinCode('sh000016')
    let list = await getAllDataByZhongjin(code, 2)
    let listTemp = []
    // 近的在左边
    for (let i = 0; i < list.length; i++) {
      listTemp.push({
        date: list[i].date
      })
    }
    let lastTradingDay = ''
    let date = listTemp[0].date
    let dateNow = moment().format('YYYYMMDD')
    if (date === dateNow) {
      lastTradingDay = listTemp[1].date
    } else {
      lastTradingDay = listTemp[0].date
    }
    ctx.body = ctx.resuccess({
      lastTradingDay: moment(lastTradingDay).format('YYYY-MM-DD')
    })
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
      days: { type: 'int', required: false }
    }, query)
    let code = formatZhongjinCode('sh000016')
    let list = await getAllDataByZhongjin(code, 260 || data.days)
    let tradingDay = []
    for (let i = 0; i < list.length; i++) {
      tradingDay.push(moment(list[i].date).format('YYYY-MM-DD'))
    }
    // 翻转
    tradingDay.reverse()
    ctx.body = ctx.resuccess({
      tradingDay
    })
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
      start: { type: 'string', required: true }
    }, query)
    let code = formatZhongjinCode(data.code)
    let diff = moment().diff(data.start, 'days')
    let day = parseInt((5 * diff / 7) + 5)
    let list = await axios({
      method: 'get',
      url: `http://v2.quotes.api.cnfol.com/chart.html?action=getStockKline&stockid=${code}&type=1&limit=${day}&callback=jQuery1120020910699759913287_1532932371008&_=1532932371009`
    }).then((data) => {
      let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'))
      return JSON.parse(str).List
    })
    let startClose = 0
    let itemDate = ''
    for (let i = 0; i < list.length; i++) {
      let item = list[i]
      let date = moment(new Date(item[0])).format('YYYYMMDD')
      if (moment(data.start).isSame(date, 'day')) {
        startClose = item[4]
        itemDate = date
        break
      }
    }
    let nowItemRaw = await axios({
      method: 'get',
      url: `http://v2.quotes.api.cnfol.com/stock.html?action=getStockPrice&sid=${code}&fieldseq=11111111111111101100000000010001&callback=StockPrice.GetData&_t=143010`
    }).then((data) => {
      let str = data.data.slice(data.data.indexOf('(') + 1, data.data.indexOf(')'))
      return JSON.parse(str).List[0]
    })
    let nowItem = formatZhongjinData(nowItemRaw)
    ctx.body = ctx.resuccess({
      startClose,
      startDate: itemDate,
      nowClose: nowItem.close,
      rate: numberUtil.countDifferenceRate(nowItem.close, startClose)
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}
