/**
 * Created by xiaobxia on 2018/1/25.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  // 基金名称
  name: String,
  // 基金编码
  code: String,
  // 净值
  net_value: Number,
  net_value_date: Date,
  // 是否可购
  sell: Boolean,
  //涨幅
  rate: Number,
  // 是否低费率
  lowRate: Boolean,
  //基金的主题概念
  theme: String,
  // 估值
  valuation_tiantian: Number,
  valuation_haomai: Number,
  valuation_date: Date,
  // 长度15天
  better_count: {
    type: String,
    default: ''
  },
  // 近期数据
  recent_net_value: String,
  create_at: {
    type: Date,
    default: Date.now
  }
});

schema.index({code: 1}, {unique: true});
schema.index({create_at: -1});

module.exports = {
  model: mongoose.model('Fund', schema)
};
