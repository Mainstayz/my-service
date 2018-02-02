/**
 * Created by xiaobxia on 2018/2/2.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  code: String,
  // 估值
  valuation_tiantian: Number,
  valuation_haomai: Number,
  tiantian_count: Number,
  haomai_count: Number,
  // 近期数据
  recent_net_value: String,
  valuation_date: Date,
  create_at: {
    type: Date,
    default: Date.now
  }
});

schema.index({code: 1}, {unique: true});
schema.index({create_at: -1});

module.exports = mongoose.model('FundAnalyze', schema);
