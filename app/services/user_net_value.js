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
  let lastMonthNetValue = 1
  let lastItem = {}
  let list = []
  for (let i = 0; i < netValues.length; i++) {
    const netValueItem = netValues[i]
    // 判断是不是第一个数据
    if (lastItem.net_value_date) {
      // 判断和上个数据是不是同一个月
      if (!(moment(netValueItem.net_value_date).isSame(lastItem.net_value_date, 'month'))) {
        list.push({
          yearMonth: moment(lastItem.net_value_date).format('YYYY-MM'),
          rate: numberUtil.countRate((lastItem.net_value - lastMonthNetValue), 1)
        })
        lastMonthNetValue = lastItem.net_value
        // 如果是最后一个
      }
      // 如果是最后一个
      if ((i + 1) === netValues.length) {
        list.push({
          yearMonth: moment(netValueItem.net_value_date).format('YYYY-MM'),
          rate: numberUtil.countRate((netValueItem.net_value - lastMonthNetValue), 1)
        })
      }
    }
    lastItem = netValueItem
  }
  return list
}
