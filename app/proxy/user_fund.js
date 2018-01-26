/**
 * Created by xiaobxia on 2018/1/26.
 */
const models = require('../models');

const UserFundModel = models.UserFund;

exports.UserFundModel = UserFundModel;

exports.newAndSave = function (userId, fundId, count) {
  const UserFund = new UserFundModel({
    user_id: userId,
    fund_id: fundId,
    count: count,
  });
  return UserFund.save();
};


exports.getByUserIdAndFundId = function (userId, fundId) {
  return UserFundModel.findOne({user_id: userId, fund_id: fundId});
};

exports.getByUserId = function (userId) {
  return UserFundModel.find({user_id: userId});
};

exports.getById = function (UserFundId) {
  return UserFundModel.findById(UserFundId);
};

exports.find = function (query, opt) {
  return UserFundModel.find(query, {}, opt);
};
