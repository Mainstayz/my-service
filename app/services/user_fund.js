/**
 * Created by xiaobxia on 2018/4/1.
 */

exports.addUserFund = async function (userId, fundId, count) {
  return UserFundProxy.newAndSave({
    user: userId,
    fund: fundId,
    count: count,
  });
};

exports.deleteUserFund = async function (userId, fundId) {
  return UserFundProxy.delete({user: userId, fund: fundId});
};

exports.updateUserFund = async function (userId, fundId, count) {
  return UserFundProxy.updateCount(userId, fundId, count);
};

exports.getUserFund = async function (userId, fundId) {
  return UserFundProxy.findByUserIdFundId(userId, fundId);
};

exports.getUserFundsByUserId = async function (userId) {
  return UserFundProxy.findByUserId(userId);
};

exports.getUserFundsByUserIdWithFund = async function (userId) {
  return UserFundProxy.findByUserIdWithFund(userId);
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
