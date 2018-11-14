/**
 * Created by xiaobxia on 2018/3/29.
 */
const moment = require('moment')
const util = require('../util')

const numberUtil = util.numberUtil
const fundBaseUtil = util.fundBaseUtil

/**
 * 添加用户基金
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.addUserFund = async function (ctx) {
  const query = ctx.request.body
  const fundService = ctx.services.fund
  const userFundService = ctx.services.userFund
  try {
    const tokenRaw = ctx.tokenRaw
    const data = ctx.validateData({
      code: { required: true },
      shares: { required: true, type: 'number' },
      strategy: { required: true },
      standard: { required: false },
      cost: { required: true, type: 'number' },
      buy_date: { required: true },
      target_net_value: { required: true },
      stop_net_value: { required: true }
    }, query)
    // 添加基金，如果存在就什么都不做
    let fund = await fundService.addFundByCode(data.code)
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    await userFundService.addUserFund(userRaw._id, fund._id, data)
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 删除用户基金
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.deleteUserFund = async function (ctx) {
  const query = ctx.query
  const fundService = ctx.services.fund
  const userFundService = ctx.services.userFund
  try {
    const tokenRaw = ctx.tokenRaw
    const data = ctx.validateData({
      code: { type: 'string', required: true }
    }, query)
    // 得到基金信息
    const fund = await fundService.getFundBaseByCode(data.code)
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    // 删除基金用户关系
    await userFundService.deleteUserFund(userRaw._id, fund._id)
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 加仓
 * @param ctx
 * @returns {Promise<void>}
 */
exports.addUserFundPosition = async function (ctx) {
  const query = ctx.request.body
  const fundService = ctx.services.fund
  const userFundService = ctx.services.userFund
  try {
    const tokenRaw = ctx.tokenRaw
    const data = ctx.validateData({
      code: { required: true },
      shares: { required: true, type: 'number' },
      cost: { required: true, type: 'number' },
      buy_date: { required: true }
    }, query)
    let fund = await fundService.getFundBaseByCode(data.code)
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    await userFundService.addUserFundPosition(userRaw._id, fund._id, data)
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 初始化仓位，老数据是没有仓位记录的
 * @param ctx
 * @returns {Promise<void>}
 */
exports.initUserFundPosition = async function (ctx) {
  const userFundService = ctx.services.userFund
  try {
    const tokenRaw = ctx.tokenRaw
    if (tokenRaw.name === 'xiaobxia') {
      await userFundService.initUserFundPosition()
      ctx.body = ctx.resuccess()
    } else {
      ctx.body = ctx.refail({ message: '不具备此权限' })
    }
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 减仓
 * @param ctx
 * @returns {Promise<void>}
 */
exports.cutUserFundPosition = async function (ctx) {
  const query = ctx.request.body
  const fundService = ctx.services.fund
  const userFundService = ctx.services.userFund
  try {
    const tokenRaw = ctx.tokenRaw
    const data = ctx.validateData({
      code: { required: true },
      shares: { required: true }
    }, query)
    let fund = await fundService.getFundBaseByCode(data.code)
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    await userFundService.cutUserFundPosition(userRaw._id, fund._id, data)
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 更新用户基金
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.updateUserFund = async function (ctx) {
  const query = ctx.request.body
  const fundService = ctx.services.fund
  const userFundService = ctx.services.userFund
  try {
    const tokenRaw = ctx.tokenRaw
    const data = ctx.validateData({
      code: { required: true },
      shares: { required: false },
      strategy: { required: false },
      cost: { required: false },
      standard: { required: false },
      buy_date: { required: false },
      target_net_value: { required: false },
      stop_net_value: { required: false },
      position_record: { required: false }
    }, query)
    // 验证基金
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    const fund = await fundService.getFundBaseByCode(data.code)
    // 更新基金用户关系
    delete data.code
    await userFundService.updateUserFund(userRaw._id, fund._id, data)
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取用户基金
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getUserFunds = async function (ctx) {
  const dictionariesService = ctx.services.dictionaries
  const userFundService = ctx.services.userFund
  try {
    const tokenRaw = ctx.tokenRaw
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    // 找到用户下的基金
    const userFunds = await userFundService.getUserFundsByUserIdWithFundBase(userRaw._id)
    const strategy = await ctx.services.strategy.getMyStrategy(userRaw._id)
    let records = await dictionariesService.getByKey(ctx.localConst.OPENING_RECORDS_REDIS_KEY)
    // 如果有记录
    records = JSON.parse(records.value)
    let list = []
    let totalSum = 0
    let costTotalSum = 0
    let valuationTotalSum = 0
    for (let i = 0; i < userFunds.length; i++) {
      const userFund = userFunds[i]
      const fund = userFund.fund
      // 持仓金额
      const sum = fund.net_value * userFund.shares
      totalSum += sum
      const costSum = userFund.cost * userFund.shares
      costTotalSum += costSum
      const valuationInfo = fundBaseUtil.getBetterValuation(fund)
      const buyDate = moment(userFund.buy_date).format('YYYY-MM-DD')
      let strategyInfo = {}
      for (let j = 0; j < strategy.length; j++) {
        if (fund.code === strategy[j].code) {
          strategyInfo = strategy[j]
          break
        }
      }
      let tempPosition_record = JSON.parse(userFund.position_record)
      let newPosition_record = []
      for (let i = 0; i < tempPosition_record.length; i++) {
        newPosition_record[i] = {
          ...tempPosition_record[i],
          has_days: records.indexOf(tempPosition_record[i].buy_date)
        }
      }
      let result = {
        ...strategyInfo,
        name: fund.name,
        code: fund.code,
        theme: fund.theme,
        shares: userFund.shares,
        strategy: userFund.strategy,
        cost: userFund.cost,
        standard: userFund.standard,
        position_record: JSON.stringify(newPosition_record),
        buy_date: buyDate,
        has_days: records.indexOf(buyDate),
        target_net_value: userFund.target_net_value,
        stop_net_value: userFund.stop_net_value,
        // 净值
        netValue: fund.net_value,
        // 持仓净值
        sum: numberUtil.keepTwoDecimals(sum),
        costSum: numberUtil.keepTwoDecimals(costSum),
        valuation: valuationInfo.valuation,
        valuationSource: valuationInfo.sourceName
      }
      result.valuationSum = numberUtil.keepTwoDecimals(result.valuation * userFund.shares)
      valuationTotalSum += result.valuationSum
      list.push(result)
    }
    list.sort(function (a, b) {
      return b.sum - a.sum
    })
    ctx.body = ctx.resuccess({
      list,
      info: {
        costTotalSum: numberUtil.keepTwoDecimals(costTotalSum),
        totalSum: numberUtil.keepTwoDecimals(totalSum),
        valuationTotalSum: numberUtil.keepTwoDecimals(valuationTotalSum),
        valuationDate: userFunds[0] ? moment(userFunds[0].fund['valuation_date']).format('YYYY-MM-DD HH:mm:ss') : ''
      }
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取普通的用户基金信息
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getUserFundsNormal = async function (ctx) {
  const dictionariesService = ctx.services.dictionaries
  const userFundService = ctx.services.userFund
  try {
    const tokenRaw = ctx.tokenRaw
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    // 找到用户下的基金
    const userFunds = await userFundService.getUserFundsByUserIdWithFundBase(userRaw._id)
    let records = await dictionariesService.getByKey(ctx.localConst.OPENING_RECORDS_REDIS_KEY)
    // 如果有记录
    records = JSON.parse(records.value)
    let list = []
    for (let i = 0; i < userFunds.length; i++) {
      const userFund = userFunds[i]
      const fund = userFund.fund
      // 持仓金额
      const sum = fund.net_value * userFund.shares
      const costSum = userFund.cost * userFund.shares
      const valuationInfo = fundBaseUtil.getBetterValuation(fund)
      const buyDate = moment(userFund.buy_date).format('YYYY-MM-DD')
      let tempPosition_record = JSON.parse(userFund.position_record)
      let newPosition_record = []
      for (let i = 0; i < tempPosition_record.length; i++) {
        newPosition_record[i] = {
          ...tempPosition_record[i],
          has_days: records.indexOf(tempPosition_record[i].buy_date)
        }
      }
      let result = {
        name: fund.name,
        code: fund.code,
        theme: fund.theme,
        shares: userFund.shares,
        cost: userFund.cost,
        strategy: userFund.strategy,
        standard: userFund.standard,
        position_record: JSON.stringify(newPosition_record),
        buy_date: buyDate,
        has_days: records.indexOf(buyDate),
        target_net_value: userFund.target_net_value,
        stop_net_value: userFund.stop_net_value,
        // 净值
        netValue: fund.net_value,
        // 持仓净值
        sum: numberUtil.keepTwoDecimals(sum),
        costSum: numberUtil.keepTwoDecimals(costSum),
        valuation: valuationInfo.valuation,
        valuationSource: valuationInfo.sourceName
      }
      result.valuationSum = numberUtil.keepTwoDecimals(result.valuation * userFund.shares)
      list.push(result)
    }
    list.sort(function (a, b) {
      return b.sum - a.sum
    })
    ctx.body = ctx.resuccess({
      list
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}
