/**
 * Created by xiaobxia on 2018/3/29.
 */
const models = require('../models');

const DictionariesModel = models.Dictionaries;

/**
 * 基本
 */

exports.DictionariesModel = DictionariesModel;

exports.newAndSave = function (data) {
  const Dictionaries = new DictionariesModel(data);
  return Dictionaries.save();
};

exports.delete = function (query) {
  return DictionariesModel.remove(query);
};

exports.update = function (query, data) {
  return DictionariesModel.update(query, {
    $set: data
  });
};

exports.find = function (query, opt) {
  return DictionariesModel.find(query, {}, opt);
};

exports.findOne = function (query) {
  return DictionariesModel.findOne(query);
};

exports.check = function (query, opt) {
  return DictionariesModel.findOne(query, '_id', opt);
};

exports.count = function (query) {
  return DictionariesModel.count(query);
};

