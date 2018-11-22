/**
 * Created by xiaobxia on 2018/4/5.
 */
const util = require('../util')

const numberUtil = util.numberUtil

/**
 * 添加用户净值
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.addUserNetValue = async function (ctx) {
  const query = ctx.request.body
  const userNetValueService = ctx.services.userNetValue
  try {
    const tokenRaw = ctx.tokenRaw
    const data = ctx.validateData({
      shares: { required: true },
      asset: { required: true },
      net_value_date: { required: true }
    }, query)
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    await userNetValueService.addUserNetValue(userRaw._id, query.net_value_date, {
      shares: data.shares,
      asset: data.asset,
      net_value: numberUtil.keepFourDecimals(data.asset / data.shares)
    })
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 删除用户净值
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.deleteUserNetValue = async function (ctx) {
  const query = ctx.query
  const userNetValueService = ctx.services.userNetValue
  try {
    const tokenRaw = ctx.tokenRaw
    const data = ctx.validateData({
      net_value_date: { required: true }
    }, query)
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    await userNetValueService.deleteUserNetValue(userRaw._id, data.net_value_date)
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 更新用户净值
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.updateUserNetValue = async function (ctx) {
  const query = ctx.request.body
  const userNetValueService = ctx.services.userNetValue
  try {
    const tokenRaw = ctx.tokenRaw
    const data = ctx.validateData({
      shares: { required: true },
      asset: { required: true },
      net_value_date: { required: true }
    }, query)
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    await userNetValueService.updateUserNetValue(userRaw._id, query.net_value_date, {
      shares: data.shares,
      asset: data.asset,
      net_value: numberUtil.keepFourDecimals(data.asset / data.shares)
    })
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 分页获取用户净值
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getUserNetValues = async function (ctx) {
  const query = ctx.query
  try {
    const tokenRaw = ctx.tokenRaw
    const data = ctx.validateData({
      current: { type: 'int', required: true },
      pageSize: { type: 'int', required: true }
    }, query)
    let paging = ctx.paging(data.current, data.pageSize)
    // 分页获取
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    const userNetValues = await ctx.services.userNetValue.getUserNetValueByPaging({ user: userRaw._id }, paging)
    paging.total = userNetValues.count
    ctx.body = ctx.resuccess({
      list: userNetValues.list,
      page: paging
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取用户所有净值
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getUserNetValuesAll = async function (ctx) {
  try {
    const tokenRaw = ctx.tokenRaw
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    const userNetValues = await ctx.services.userNetValue.getUserNetValue({ user: userRaw._id })
    ctx.body = ctx.resuccess({
      list: userNetValues
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取用户每月收益率
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getUserNetValueMonthRate = async function (ctx) {
  try {
    const tokenRaw = ctx.tokenRaw
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name)
    const userNetValues = await ctx.services.userNetValue.getUserNetValueMonthRate({ user: userRaw._id })
    ctx.body = ctx.resuccess({
      list: userNetValues
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}
