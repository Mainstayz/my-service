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
  // 长度15天,ththth,看是t多还是h多
  better_count: {
    type: String,
    default: ''
  },
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
