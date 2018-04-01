/**
 * Created by xiaobxia on 2018/4/1.
 */
const Proxy = require('../proxy');

const UserFundProxy = Proxy.UserFund;
const FocusFundProxy = Proxy.FocusFund;
const UserFundAccountProxy = Proxy.UserFundAccount;


exports.addUserFund = async function (userId, fundId, data) {
  return UserFundProxy.newAndSave({
    user: userId,
    fund: fundId,
    ...data
  });
};

exports.deleteUserFund = async function (userId, fundId) {
  return UserFundProxy.delete({user: userId, fund: fundId});
};

exports.updateUserFund = async function (userId, fundId, data) {
  return UserFundProxy.update({user: userId, fund: fundId}, data);
};

exports.getUserFundsByUserIdWithFund = async function (userId) {
  return UserFundProxy.findByUserIdWithFund(userId);
};

//资产部分
exports.getMyAsset = async function (userId) {
  return UserFundProxy.findOne({user: userId});
};





exports.getUserFundsByUserId = async function (userId) {
  return UserFundProxy.findByUserId(userId);
};

exports.getUserFund = async function (userId, fundId) {
  return UserFundProxy.findByUserIdFundId(userId, fundId);
};



exports.getUserFundsByFundId = async function (fundId) {
  return UserFundProxy.find({fund: fundId});
};

exports.checkUserFundByQuery = async function (query) {
  return UserFundProxy.check(query);
};

// 关注基金
exports.addFocusFund = async function (userId, fundId) {
  return FocusFundProxy.newAndSave({
    user: userId,
    fund: fundId
  });
};

exports.deleteFocusFund = async function (userId, fundId) {
  return FocusFundProxy.delete({user: userId, fund: fundId});
};

exports.getFocusFund = async function (userId, fundId) {
  return FocusFundProxy.findByUserIdFundId(userId, fundId);
};

exports.getFocusFundsByUserId = async function (userId) {
  return FocusFundProxy.findByUserId(userId);
};

exports.getFocusFundsByFundId = async function (fundId) {
  return FocusFundProxy.find({fund: fundId});
};

exports.getFocusFundsByUserIdWithFund = async function (userId) {
  return FocusFundProxy.findByUserIdWithFund(userId);
};

exports.checkFocusFundByQuery = async function (query) {
  return FocusFundProxy.check(query);
};
