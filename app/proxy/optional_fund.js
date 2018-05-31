/**
 * Created by xiaobxia on 2018/3/29.
 */
const models = require('../models');

const OptionalFundModel = models.OptionalFund;

/**
 * 基本
 */

exports.OptionalFundModel = OptionalFundModel;

exports.newAndSave = function (data) {
  const OptionalFund = new OptionalFundModel(data);
  return OptionalFund.save();
};

exports.delete = function (query) {
  return OptionalFundModel.remove(query);
};

exports.update = function (query, data) {
  return OptionalFundModel.update(query, {
    $set: data
  });
};

exports.find = function (query, opt) {
  return OptionalFundModel.find(query, {}, opt);
};

exports.findOne = function (query) {
  return OptionalFundModel.findOne(query);
};

exports.check = function (query, opt) {
  return OptionalFundModel.findOne(query, '_id', opt);
};

exports.count = function (query) {
  return OptionalFundModel.count(query);
};
