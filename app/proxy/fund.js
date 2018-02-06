/**
 * Created by xiaobxia on 2018/1/26.
 */
const models = require('../models');

const FundModel = models.Fund;

exports.FundModel = FundModel;

exports.newAndSave = function (data) {
  const fund = new FundModel(data);
  return fund.save();
};

exports.delete = function (data) {
  return FundModel.remove(data);
};

exports.deleteByCode = function (code) {
  return FundModel.remove({code});
};

exports.updateByCode = function (code, data) {
  return FundModel.update({
    code
  }, {
    $set: data
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

exports.count = function (query) {
  return FundModel.count(query);
};

