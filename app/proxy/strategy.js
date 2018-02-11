/**
 * Created by xiaobxia on 2018/1/26.
 */
const models = require('../models');

const StrategyModel = models.Strategy;

exports.StrategyModel = StrategyModel;

exports.newAndSave = function (data) {
  const fund = new StrategyModel(data);
  return fund.save();
};

exports.delete = function (data) {
  return StrategyModel.remove(data);
};

exports.deleteByDay = function (day) {
  return StrategyModel.remove({day});
};

exports.updateByDay = function (day, data) {
  return StrategyModel.update({
    day
  }, {
    $set: data
  });
};

exports.find = function (query, opt) {
  return StrategyModel.find(query, {}, opt);
};

exports.findOne = function (query, opt) {
  return StrategyModel.findOne(query, {}, opt);
};

exports.check = function (query, opt) {
  return StrategyModel.findOne(query, '_id', opt);
};

