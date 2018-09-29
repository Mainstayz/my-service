/**
 * Created by xiaobxia on 2018/1/26.
 */
const models = require('../models');

const FundModel = models.Fund;

/**
 * 基本
 */

exports.FundModel = FundModel;

exports.newAndSave = function (data) {
  const fund = new FundModel(data);
  return fund.save();
};

exports.delete = function (data) {
  return FundModel.remove(data);
};

exports.update = function (query, data) {
  return FundModel.update(query, {
    $set: data
  });
};

exports.find = function (query, opt) {
  return FundModel.find(query, {}, opt);
};

exports.findOne = function (query, opt) {
  return FundModel.findOne(query, {}, opt);
};

exports.findOneById = function (id) {
  return FundModel.findById(id);
};

exports.check = function (query, opt) {
  return FundModel.findOne(query, '_id', opt);
};

exports.count = function (query) {
  return FundModel.count(query);
};

/**
 * 扩展
 */
const baseInfo = models.fields_table.fundBase.join(' ');

exports.findBase = function (query, opt) {
  return FundModel.find(query, baseInfo, opt);
};

exports.findOneBase = function (query, opt) {
  return FundModel.findOne(query, baseInfo, opt);
};



