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
 * 获取所有用户净值记录
 * @param query
 * @returns {Promise.<void>}
 */
exports.getUserNetValue = async function (query) {
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
