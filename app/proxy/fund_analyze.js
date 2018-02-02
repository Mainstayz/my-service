/**
 * Created by xiaobxia on 2018/2/2.
 */
const models = require('../models');

const FundAnalyzeModel = models.FundAnalyze;

exports.FundAnalyzeModel = FundAnalyzeModel;

exports.newAndSave = function (data) {
  const fund = new FundAnalyzeModel(data);
  return fund.save();
};

exports.deleteByCode = function (code) {
  return FundAnalyzeModel.remove({code});
};

exports.updateByCode = function (code, data) {
  return FundAnalyzeModel.update({
    code
  }, {
    $set: data
  });
};

exports.getByCode = function (code) {
  return FundAnalyzeModel.findOne({code: code});
};

exports.getById = function (fundId) {
  return FundAnalyzeModel.findById(fundId);
};

exports.find = function (query, opt) {
  return FundAnalyzeModel.find(query, {}, opt);
};

