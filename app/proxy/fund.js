/**
 * Created by xiaobxia on 2018/1/26.
 */
const models = require('../models');

const FundModel = models.Fund;

exports.FundModel = FundModel;

exports.newAndSave = function (code, name, valuation, net_value) {
  const fund = new FundModel({
    name,
    code,
    // 净值
    net_value,
    // 估值
    valuation,
  });
  return fund.save();
};


exports.getByCode = function (code) {
  return FundModel.findOne({code: code});
};

exports.getByName = function (name) {
  return FundModel.findOne({name: name});
};

exports.getById = function (fundId) {
  return FundModel.findById(fundId);
};

exports.find = function (query, opt) {
  return FundModel.find(query, {}, opt);
};
