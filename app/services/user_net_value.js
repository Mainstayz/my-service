/**
 * Created by xiaobxia on 2018/4/5.
 */
const Proxy = require('../proxy');

const UserNetValue = Proxy.UserNetValue;

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
  });
};

/**
 * 删除用户净值记录
 * @param userId
 * @param dateString
 * @returns {Promise.<void>}
 */
exports.deleteUserNetValue = async function (userId, dateString) {
  return UserNetValue.delete({user: userId, net_value_date: dateString});
};

/**
 * 更新用户净值记录
 * @param userId
 * @param dateString
 * @param data
 * @returns {Promise.<void>}
 */
exports.updateUserNetValue = async function (userId, dateString, data) {
  return UserNetValue.update({user: userId, net_value_date: dateString}, data);
};

/**
 * 分页获取用户净值记录
 * @param query
 * @param paging
 * @returns {Promise.<{list: *, count: *}>}
 */
exports.getUserNetValueByPaging = async function (query, paging) {
  const opt = {
    skip: paging.start,
    limit: paging.offset,
    sort: '-net_value_date'
  };
  const data = await Promise.all([UserNetValue.find(query, opt), UserNetValue.count(query)]);
  return {list: data[0], count: data[1]};
};

/**
 * 获取所有用户净值记录
 * @param query
 * @returns {Promise.<void>}
 */
exports.getUserNetValue = async function (query) {
  const opt = {
    sort: 'net_value_date'
  };
  return UserNetValue.find(query, opt);
};

/**
 * 获取所有用户净值记录
 * @param query
 * @returns {Promise.<void>}
 */
exports.getUserNetValueNewSort = async function (query) {
  const opt = {
    sort: '-net_value_date'
  };
  return UserNetValue.find(query, opt);
};
