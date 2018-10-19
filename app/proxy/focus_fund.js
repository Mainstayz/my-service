/**
 * Created by xiaobxia on 2018/3/5.
 */
const models = require('../models')

const FocusFundModel = models.FocusFund

/**
 * 基本
 */

exports.FocusFundModel = FocusFundModel

exports.newAndSave = function (data) {
  const FocusFund = new FocusFundModel(data)
  return FocusFund.save()
}

exports.delete = function (query) {
  return FocusFundModel.remove(query)
}

exports.update = function (query, data) {
  return FocusFundModel.update(query, {
    $set: data
  })
}

exports.find = function (query, opt) {
  return FocusFundModel.find(query, {}, opt)
}

exports.findOne = function (query) {
  return FocusFundModel.findOne(query)
}

exports.findOneById = function (id) {
  return FocusFundModel.findById(id)
}

exports.check = function (query, opt) {
  return FocusFundModel.findOne(query, '_id', opt)
}

exports.count = function (query) {
  return FocusFundModel.count(query)
}

/**
 * 扩展
 */

const baseInfo = models.fields_table.fundBase.join(' ')

exports.findWithFundBase = function (query) {
  return FocusFundModel.find(query).populate('fund', baseInfo)
}

exports.findOneWithFundBase = function (query) {
  return FocusFundModel.findOne(query).populate('fund', baseInfo)
}
