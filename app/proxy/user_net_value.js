/**
 * Created by xiaobxia on 2018/3/31.
 */
const models = require('../models');

const UserNetValueModel = models.UserNetValue;

/**
 * 基本
 */

exports.UserNetValueModel = UserNetValueModel;

exports.newAndSave = function (data) {
  const UserNetValue = new UserNetValueModel(data);
  return UserNetValue.save();
};

exports.delete = function (query) {
  return UserNetValueModel.remove(query);
};

exports.update = function (query, data) {
  return UserNetValueModel.update(query, {
    $set: data
  });
};

exports.find = function (query, opt) {
  return UserNetValueModel.find(query, {}, opt);
};

exports.findOne = function (query) {
  return UserNetValueModel.findOne(query);
};

exports.findOneById = function (id) {
  return UserNetValueModel.findById(id);
};

exports.check = function (query, opt) {
  return UserNetValueModel.findOne(query, '_id', opt);
};

exports.count = function (query) {
  return UserNetValueModel.count(query);
};
