/**
 * Created by xiaobxia on 2018/1/25.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  name: String,
  code: String,
  // 净值
  net_value: Number,
  net_value_date: Date,
  // 是否可购
  sell: Boolean,
  // 估值
  valuation_tiantian: Number,
  valuation_haomai: Number,
  // 长度15天
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

module.exports = mongoose.model('Fund', schema);
