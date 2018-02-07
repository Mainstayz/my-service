/**
 * Created by xiaobxia on 2018/1/26.
 */
const models = require('../models');

const UserFundModel = models.UserFund;

exports.UserFundModel = UserFundModel;

exports.newAndSave = function (data) {
  const UserFund = new UserFundModel(data);
  return UserFund.save();
};

exports.deleteUserFund = function (userId, fundId) {
  return UserFundModel.remove({user: userId, fund: fundId});
};

exports.updateCount = function (userId, fundId, count) {
  return UserFundModel.update({
    user: userId,
    fund: fundId
  }, {
    $set: {
      count
    }
  });
};

exports.getUserFunds = function (userId) {
  return UserFundModel.find({user: userId}).populate('fund');
};

exports.getUserFund = function (userId, fundId) {
  return UserFundModel.findOne({user: userId, fund: fundId});
};

exports.getByUserId = function (userId) {
  return UserFundModel.find({user: userId});
};

exports.getById = function (UserFundId) {
  return UserFundModel.findById(UserFundId);
};

exports.find = function (query, opt) {
  return UserFundModel.find(query, {}, opt);
};

exports.findOne = function (query) {
  return UserFundModel.findOne(query);
};
