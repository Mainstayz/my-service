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

exports.delete = function (query) {
  return UserFundModel.remove(query);
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

const baseInfo = models.fields_table.fundBase.join(' ');

exports.findByUserIdWithFund = function (userId) {
  return UserFundModel.find({user: userId}).populate('fund', baseInfo);
};

exports.findByUserIdFundId = function (userId, fundId) {
  return UserFundModel.findOne({user: userId, fund: fundId});
};

exports.findByUserId = function (userId) {
  return UserFundModel.find({user: userId});
};

exports.findById = function (UserFundId) {
  return UserFundModel.findById(UserFundId);
};

exports.find = function (query, opt) {
  return UserFundModel.find(query, {}, opt);
};

exports.findOne = function (query) {
  return UserFundModel.findOne(query);
};

exports.check = function (query, opt) {
  return UserFundModel.findOne(query, '_id', opt);
};
