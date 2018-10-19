const models = require('../models')

const UserModel = models.User

/**
 * 基本
 */

exports.UserModel = UserModel

exports.newAndSave = function (data) {
  const user = new UserModel(data)
  return user.save()
}

exports.delete = function (data) {
  return UserModel.remove(data)
}

exports.update = function (query, data) {
  return UserModel.update(query, {
    $set: data
  })
}

exports.find = function (query, opt) {
  return UserModel.find(query, {}, opt)
}

exports.findOne = function (query, opt) {
  return UserModel.findOne(query, {}, opt)
}

exports.findOneById = function (id) {
  return UserModel.findById(id)
}

exports.check = function (query, opt) {
  return UserModel.findOne(query, '_id', opt)
}

exports.count = function (query) {
  return UserModel.count(query)
}
