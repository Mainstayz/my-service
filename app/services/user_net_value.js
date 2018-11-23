/**
 * Created by xiaobxia on 2018/4/5.
 */
const moment = require('moment')
const Proxy = require('../proxy')
const util = require('../util')

const numberUtil = util.numberUtil
const UserNetValue = Proxy.UserNetValue

/**
 * 添加用户净值记录
 * @param userId
 * @param dateString
 * @param data
 * @returns {Promise.<void>}
 */
exports.addUserNetValue = async function (userId, dateString, data) {
  return UserNetValue.newAndSave({
    user: userId,
    net_value_date: dateString,
    ...data
  })
}

/**
 * 删除用户净值记录
 * @param userId
 * @param dateString
 * @returns {Promise.<void>}
 */
exports.deleteUserNetValue = async function (userId, dateString) {
  return UserNetValue.delete({ user: userId, net_value_date: dateString })
}

/**
 * 更新用户净值记录
 * @param userId
 * @param dateString
 * @param data
 * @returns {Promise.<void>}
 */
exports.updateUserNetValue = async function (userId, dateString, data) {
  return UserNetValue.update({ user: userId, net_value_date: dateString }, data)
}

/**
 * 获取用户最新净值
 * @param query
 * @returns {Promise.<void>}
 */
exports.getUserNetValue = async function (query) {
  const opt = {
    skip: 0,
    limit: 1,
    sort: '-net_value_date'
  }
  return UserNetValue.find(query, opt)
}

/**
 * 分页获取用户净值记录
 * @param query
 * @param paging
 * @returns {Promise.<{list: *, count: *}>}
 */
exports.getUserNetValueByPaging = async function (query, paging) {
  // 新创建的在前面
  const opt = {
    skip: paging.start,
    limit: paging.offset,
    sort: '-net_value_date'
  }
  const data = await Promise.all([UserNetValue.find(query, opt), UserNetValue.count(query)])
  return { list: data[0], count: data[1] }
}

/**
 * 通过天数获取净值
 * @param query
 * @param count
 * @returns {Promise<*>}
 */
exports.getUserNetValueByCount = async function (query, count) {
  const opt = {
    skip: 0,
    limit: count,
    sort: '-net_value_date'
  }
  return UserNetValue.find(query, opt)
}

/**
 * 获取用户所有净值记录
 * @param query
 * @returns {Promise.<void>}
 */
exports.getUserNetValueAll = async function (query) {
  // 新创建的在后面
  const opt = {
    sort: 'net_value_date'
  }
  return UserNetValue.find(query, opt)
}

/**
 * 获取所有用户净值记录
 * @param query
 * @returns {Promise.<void>}
 */
exports.getUserNetValueNewSort = async function (query) {
  // 新创建的在前面
  const opt = {
    sort: '-net_value_date'
  }
  return UserNetValue.find(query, opt)
}

/**
 * 获取上一交易日的净值
 * @param query
 * @returns {Promise<*>}
 */
exports.getUserLastNetValue = async function (query) {
  const opt = {
    skip: 0,
    limit: 2,
    sort: '-net_value_date'
  }
  const records = await UserNetValue.find(query, opt)
  let lastNetValue = {}
  // 如果没有记录
  if (!records) {
    return {}
  }
  let date = records[0].net_value_date
  let dateNow = moment().format('YYYY-MM-DD')
  if (date === dateNow) {
    if (records[1]) {
      lastNetValue = records[1]
    } else {
      return {}
    }
  } else {
    lastNetValue = records[0]
  }
  return lastNetValue
}

/**
 * 获取用户每月收益率
 * @param query
 * @returns {Promise.<Array>}
 */
exports.getUserNetValueMonthRate = async function (query) {
  // 新创建的在后面
  const opt = {
    sort: 'net_value_date'
  }
  const netValues = await UserNetValue.find(query, opt)
  let list = []
  let nowItemDate = ''
  let nowMonthLastNetValue = 0
  for (let i = netValues.length - 1; i >= 0; i--) {
    const netValueItem = netValues[i]
    if (i !== 0) {
      if (nowItemDate) {
        // 到了前一个月的数据
        if (!(moment(netValueItem.net_value_date).isSame(nowItemDate, 'month'))) {
          list.unshift({
            yearMonth: moment(nowItemDate).format('YYYY-MM'),
            rate: numberUtil.countDifferenceRate(nowMonthLastNetValue, netValueItem.net_value)
          })
          nowMonthLastNetValue = netValueItem.net_value
          nowItemDate = netValueItem.net_value_date
        }
      } else {
        // 第一个数据
        nowMonthLastNetValue = netValueItem.net_value
        nowItemDate = netValueItem.net_value_date
      }
    } else {
      // 是第一个了
      list.unshift({
        yearMonth: moment(nowItemDate).format('YYYY-MM'),
        rate: numberUtil.countDifferenceRate((nowItemDate ? nowMonthLastNetValue : netValueItem.net_value), 1)
      })
      nowMonthLastNetValue = netValueItem.net_value
      nowItemDate = netValueItem.net_value_date
    }
  }
  return list
}
