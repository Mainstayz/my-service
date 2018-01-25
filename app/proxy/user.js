const models = require('../models');

const UserModel = models.User;

exports.UserModel = UserModel;

exports.update = function (user) {
  return UserModel.update({
    _id: user.id
  }, {
    $set: {
      nick_name: user.nick_name,
      head_img: user.head_img,
      password: user.password
    }
  });
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
