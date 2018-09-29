/**
 * Created by xiaobxia on 2018/1/25.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  fund: {type: Schema.Types.ObjectId, ref: 'Fund'},
  // 份额
  shares: Number,
  // 所在策略组
  strategy: String,
  // 持仓成本
  cost: Number,
  // 几倍仓
  standard: Number,
  // 买入日期
  buy_date: {
    type: Date,
    default: Date.now
  },
  // 目标净值
  target_net_value: Number,
  stop_net_value: Number,
  // 持仓记录，[{cost,shares,buyDate}]
  position_record: {
    type: String,
    default: ''
  },
  create_at: {
    type: Date,
    default: Date.now
  }
});
// 一般是以用户id查
schema.index({user: 1, fund: 1}, {unique: true});
schema.index({create_at: -1});

module.exports = {
  model: mongoose.model('UserFund', schema)
};
