const models = require('../models');

const UserModel = models.User;

/**
 * 基本
 */

exports.UserModel = UserModel;

exports.newAndSave = function (data) {
  const fund = new UserModel(data);
  return fund.save();
};

exports.update = function (id, user) {
  return UserModel.update({
    _id: user.id
  }, {
    $set: user
  });
};

exports.delete = function (data) {
  return UserModel.remove(data);
};

exports.getByName = function (userName) {
  return UserModel.findOne({ name: userName });
};

exports.getById = function (userId) {
  return UserModel.findById(userId);
};

exports.find = function (query, opt) {
  return UserModel.find(query, {}, opt);
};
