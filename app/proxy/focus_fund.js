/**
 * Created by xiaobxia on 2018/3/5.
 */
const models = require('../models');

const FocusFundModel = models.FocusFund;

/**
 * 基本
 */

exports.FocusFundModel = FocusFundModel;

exports.newAndSave = function (data) {
  const FocusFund = new FocusFundModel(data);
  return FocusFund.save();
};

exports.delete = function (query) {
  return FocusFundModel.remove(query);
};

exports.update = function (query, data) {
  return FocusFundModel.update(query, {
    $set: data
  });
};

exports.find = function (query, opt) {
  return FocusFundModel.find(query, {}, opt);
};

exports.findOne = function (query) {
  return FocusFundModel.findOne(query);
};

exports.check = function (query, opt) {
  return FocusFundModel.findOne(query, '_id', opt);
};

exports.count = function (query) {
  return FocusFundModel.count(query);
};

/**
 * 扩展
 */

const baseInfo = models.fields_table.fundBase.join(' ');

exports.findByUserIdWithFundBase = function (userId) {
  return FocusFundModel.find({user: userId}).populate('fund', baseInfo);
};

exports.findOneByUserIdWithFundBase = function (userId) {
  return FocusFundModel.findOne({user: userId}).populate('fund', baseInfo);
};

exports.findByUserIdFundId = function (userId, fundId) {
  return FocusFundModel.findOne({user: userId, fund: fundId});
};

exports.findByUserId = function (userId) {
  return FocusFundModel.find({user: userId});
};

exports.findById = function (FocusFundId) {
  return FocusFundModel.findById(FocusFundId);
};


