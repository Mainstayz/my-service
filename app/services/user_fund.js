/**
 * Created by xiaobxia on 2018/4/1.
 */
const Proxy = require('../proxy');

const UserFundProxy = Proxy.UserFund;
const FocusFundProxy = Proxy.FocusFund;

/**
 * 持有基金部分-----------------------------------------------------------------
 */

/**
 * 添加用户基金
 * @param userId
 * @param fundId
 * @param data
 * @returns {Promise.<void>}
 */
exports.addUserFund = async function (userId, fundId, data) {
  return UserFundProxy.newAndSave({
    user: userId,
    fund: fundId,
    ...data
  });
};

/**
 * 删除用户基金
 * @param userId
 * @param fundId
 * @returns {Promise.<void>}
 */
exports.deleteUserFund = async function (userId, fundId) {
  return UserFundProxy.delete({user: userId, fund: fundId});
};

/**
 * 更新用户基金
 * @param userId
 * @param fundId
 * @param data
 * @returns {Promise.<void>}
 */
exports.updateUserFund = async function (userId, fundId, data) {
  return UserFundProxy.update({user: userId, fund: fundId}, data);
};

/**
 * 获取用户基金
 * @param userId
 * @returns {Promise.<void>}
 */
exports.getUserFundsByUserId = async function (userId) {
  return UserFundProxy.findByUserId(userId);
};

/**
 * 获取用户基金以及基金信息
 * @param userId
 * @returns {Promise.<void>}
 */
exports.getUserFundsByUserIdWithFundBase = async function (userId) {
  return UserFundProxy.findByUserIdWithFundBase(userId);
};

/**
 * 获取单个用户基金
 * @param userId
 * @param fundId
 * @returns {Promise.<void>}
 */
exports.getUserFund = async function (userId, fundId) {
  return UserFundProxy.findByUserIdFundId(userId, fundId);
};

/**
 * 检查用户基金是否存在
 * @param query
 * @returns {Promise.<void>}
 */
exports.checkUserFundByQuery = async function (query) {
  return UserFundProxy.check(query);
};

/**
 * 关注基金部分-----------------------------------------------------------------
 */

/**
 * 添加关注基金
 * @param userId
 * @param fundId
 * @returns {Promise.<void>}
 */
exports.addFocusFund = async function (userId, fundId) {
  return FocusFundProxy.newAndSave({
    user: userId,
    fund: fundId
  });
};

/**
 * 删除关注基金
 * @param userId
 * @param fundId
 * @returns {Promise.<void>}
 */
exports.deleteFocusFund = async function (userId, fundId) {
  return FocusFundProxy.delete({user: userId, fund: fundId});
};

/**
 * 获取单个关注基金
 * @param userId
 * @param fundId
 * @returns {Promise.<void>}
 */
exports.getFocusFund = async function (userId, fundId) {
  return FocusFundProxy.findByUserIdFundId(userId, fundId);
};

/**
 * 获取用户所有的关注基金
 * @param userId
 * @returns {Promise.<void>}
 */
exports.getFocusFundsByUserId = async function (userId) {
  return FocusFundProxy.findByUserId(userId);
};

/**
 * 获取用户所有的关注基金以及基金信息
 * @param userId
 * @returns {Promise.<void>}
 */
exports.getFocusFundsByUserIdWithFundBase = async function (userId) {
  return FocusFundProxy.findByUserIdWithFundBase(userId);
};

/**
 * 检查关注基金是否存在
 * @param query
 * @returns {Promise.<void>}
 */
exports.checkFocusFundByQuery = async function (query) {
  return FocusFundProxy.check(query);
};
