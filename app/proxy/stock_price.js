const models = require('../models')

const StockPriceModel = models.StockPrice

/**
 * 基本
 */

exports.StockPriceModel = StockPriceModel

exports.newAndSave = function (data) {
  const log = new StockPriceModel(data)
  return log.save()
}

exports.delete = function (data) {
  return StockPriceModel.remove(data)
}

exports.update = function (query, data) {
  return StockPriceModel.update(query, {
    $set: data
  })
}

exports.find = function (query, opt) {
  return StockPriceModel.find(query, {}, opt)
}

exports.findOne = function (query, opt) {
  return StockPriceModel.findOne(query, {}, opt)
}

exports.findOneById = function (id) {
  return StockPriceModel.findById(id)
}

exports.check = function (query, opt) {
  return StockPriceModel.findOne(query, '_id', opt)
}

exports.count = function (query) {
  return StockPriceModel.count(query)
}
