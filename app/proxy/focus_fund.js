/**
 * Created by xiaobxia on 2018/3/5.
 */
const models = require('../models');

const FocusFundModel = models.FocusFund;

exports.FocusFundModel = FocusFundModel;

exports.newAndSave = function (data) {
  const FocusFund = new FocusFundModel(data);
  return FocusFund.save();
};

exports.delete = function (query) {
  return FocusFundModel.remove(query);
};

const baseInfo = models.fields_table.fundBase.join(' ');

exports.findByUserIdWithFund = function (userId) {
  return FocusFundModel.find({user: userId}).populate('fund', baseInfo);
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

exports.find = function (query, opt) {
  return FocusFundModel.find(query, {}, opt);
};

exports.findOne = function (query) {
  return FocusFundModel.findOne(query);
};

exports.check = function (query, opt) {
  return FocusFundModel.findOne(query, '_id', opt);
};
