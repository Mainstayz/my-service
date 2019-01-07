const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  code: String,
  // 交易日期
  trade_date: String,
  // 具体数据
  close: Number,
  high: Number,
  low: Number,
  netChangeRatio: Number,
  open: Number,
  preClose: Number,
  create_at: {
    type: Date,
    default: Date.now
  }
})
schema.index({ trade_date: -1, code: 1 }, { unique: true })

module.exports = mongoose.model('StockPrice', schema)
