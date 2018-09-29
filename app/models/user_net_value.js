/**
 * Created by xiaobxia on 2018/3/31.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  // 净值
  net_value: Number,
  // 资产
  asset: Number,
  // 自己组合的份额
  shares: Number,
  // 净值日期
  net_value_date: String,
  create_at: {
    type: Date,
    default: Date.now
  }
});
schema.index({net_value_date: -1}, {unique: true});

module.exports = {
  model: mongoose.model('UserNetValue', schema)
};
