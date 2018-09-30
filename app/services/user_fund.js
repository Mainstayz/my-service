/**
 * Created by xiaobxia on 2018/4/1.
 */
const Proxy = require('../proxy');
const util = require('../util');

const numberUtil = util.numberUtil;

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
  //添加持仓记录
  data.position_record = JSON.stringify([{
    cost: data.cost,
    shares: data.shares,
    buy_date: data.buy_date
  }]);
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
 * 加仓
 * @param userId
 * @param fundId
 * @returns {Promise<*>}
 */
exports.addUserFundPosition = async function (userId, fundId, data) {
  let updateData = {};
  const rawData = await UserFundProxy.findOne({user: userId, fund: fundId});
  //之前有记录
  if (rawData.position_record) {
    let temp = JSON.parse(rawData.position_record);
    temp.push({
      cost: data.cost,
      shares: data.shares,
      buy_date: data.buy_date
    });
    updateData.position_record = JSON.stringify(temp);
  } else {
    updateData.position_record = JSON.stringify([{
      cost: data.cost,
      shares: data.shares,
      buy_date: data.buy_date
    }]);
  }
  //份额是直接加的
  updateData.shares = numberUtil.keepTwoDecimals(rawData.shares + data.shares);
  //成本是会变动的
  updateData.cost = numberUtil.keepFourDecimals((rawData.shares * rawData.cost + data.shares * data.cost) / (rawData.shares + data.shares));
  return UserFundProxy.update({user: userId, fund: fundId}, updateData);
};

/**
 * 初始化仓位，老数据是没有仓位记录的
 * @returns {Promise<any[]>}
 */
exports.initUserFundPosition = async function () {
  let allUserFunds = await UserFundProxy.find({});
  let queryList = [];
  for (let i = 0; i < allUserFunds.length; i++) {
    const userFund = allUserFunds[i];
    //没有记录的
    if (!userFund.position_record) {
      queryList.push(UserFundProxy.update({_id: userFund._id}, {
        position_record: JSON.stringify([{
          cost: userFund.cost,
          shares: userFund.shares,
          buy_date: userFund.buy_date
        }])
      }));
    }
  }
  return Promise.all(queryList);
};

/**
 * 减仓
 * @param userId
 * @param fundId
 * @param data
 * @returns {Promise<*>}
 */
exports.cutUserFundPosition = async function (userId, fundId, data) {
  let updateData = {};
  const rawData = await UserFundProxy.findOne({user: userId, fund: fundId});
  let cutShares = data.shares;
  const positionRecord = JSON.parse(rawData.position_record);
  let newPositionRecord = [];
  //老的数据在前面
  for (let i = 0; i < positionRecord.length; i++) {
    const item = positionRecord[i];
    //允许20块误差
    if ((Math.abs(cutShares - item.shares) * item.cost) < 20) {
      newPositionRecord = positionRecord.slice(i + 1);
      break;
    } else {
      //有剩余
      if (cutShares < item.shares) {
        newPositionRecord = positionRecord.slice(i + 1);
        newPositionRecord.unshift({
          cost: item.cost,
          shares: numberUtil.keepTwoDecimals(item.shares - cutShares),
          buy_date: item.buy_date
        });
        break;
      } else {
        //超出
        cutShares -= item.shares;
      }
    }
  }
  updateData.shares = numberUtil.keepTwoDecimals((rawData.shares - data.shares) < 0 ? 0 : (rawData.shares - data.shares));
  updateData.position_record = JSON.stringify(newPositionRecord);
  updateData.buy_date = newPositionRecord[0] ? newPositionRecord[0].buy_date : positionRecord[positionRecord.length - 1].buy_date;
  return UserFundProxy.update({user: userId, fund: fundId}, updateData);
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
  return UserFundProxy.find({user: userId});
};

/**
 * 获取用户基金以及基金信息
 * @param userId
 * @returns {Promise.<void>}
 */
exports.getUserFundsByUserIdWithFundBase = async function (userId) {
  return UserFundProxy.findWithFundBase({user: userId});
};

/**
 * 获取单个用户基金
 * @param userId
 * @param fundId
 * @returns {Promise.<void>}
 */
exports.getUserFund = async function (userId, fundId) {
  return UserFundProxy.findOne({user: userId, fund: fundId});
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
  return FocusFundProxy.findOne({user: userId, fund: fundId});
};

/**
 * 获取用户所有的关注基金
 * @param userId
 * @returns {Promise.<void>}
 */
exports.getFocusFundsByUserId = async function (userId) {
  return FocusFundProxy.find({user: userId});
};

/**
 * 获取用户所有的关注基金以及基金信息
 * @param userId
 * @returns {Promise.<void>}
 */
exports.getFocusFundsByUserIdWithFundBase = async function (userId) {
  return FocusFundProxy.findWithFundBase({user: userId});
};

/**
 * 检查关注基金是否存在
 * @param query
 * @returns {Promise.<void>}
 */
exports.checkFocusFundByQuery = async function (query) {
  return FocusFundProxy.check(query);
};
