/**
 * Created by xiaobxia on 2018/1/26.
 */
const models = require('../models');

const FundModel = models.Fund;

exports.FundModel = FundModel;

exports.newAndSave = function (code, name, net_value, valuation) {
  const fund = new FundModel({
    name,
    code,
    // 净值
    net_value,
    // 估值
    valuation,
    valuation_date: Date.now(),
    update_date: Date.now()
  });
  return fund.save();
};

exports.updateByCode = function (code, name, net_value, valuation) {
  return FundModel.update({
    code
  }, {
    $set: {
      name,
      // 净值
      net_value,
      // 估值
      valuation,
      valuation_date: Date.now(),
      update_date: Date.now()
    }
  });
};

exports.updateNetValueByCode = function (code, net_value) {
  return FundModel.update({
    code
  }, {
    $set: {
      // 净值
      net_value,
      update_date: Date.now()
    }
  });
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
