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

exports.find = function (query, opt) {
  return FundModel.find(query, {}, opt);
};

exports.findOne = function (query, opt) {
  return FundModel.findOne(query, {}, opt);
};

exports.count = function (query) {
  return FundModel.count(query);
};

const baseInfo = models.fields_table.fundBase.join(' ');

exports.findBase = function (query, opt) {
  return FundModel.find(query, baseInfo, opt);
};

exports.findOneBase = function (query, opt) {
  return FundModel.findOne(query, baseInfo, opt);
};

const simpleInfo = models.fields_table.fundSimple.join(' ');

exports.findSimple = function (query, opt) {
  return FundModel.find(query, simpleInfo, opt);
};

exports.findOneSimple = function (query, opt) {
  return FundModel.findOne(query, simpleInfo, opt);
};

exports.check = function (query, opt) {
  return FundModel.findOne(query, '_id', opt);
};

