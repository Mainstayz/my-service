/**
 * Created by xiaobxia on 2018/3/31.
 */
const models = require('../models');

const UserFundAccountModel = models.UserFundAccount;

/**
 * 基本
 */

exports.UserFundAccountModel = UserFundAccountModel;

exports.newAndSave = function (data) {
  const UserFundAccount = new UserFundAccountModel(data);
  return UserFundAccount.save();
};

exports.delete = function (query) {
  return UserFundAccountModel.remove(query);
};

exports.update = function (query, data) {
  return UserFundAccountModel.update(query, {
    $set: data
  });
};

exports.find = function (query, opt) {
  return UserFundAccountModel.find(query, {}, opt);
};

exports.findOne = function (query) {
  return UserFundAccountModel.findOne(query);
};

exports.check = function (query, opt) {
  return UserFundAccountModel.findOne(query, '_id', opt);
};

exports.count = function (query) {
  return UserFundAccountModel.count(query);
};
