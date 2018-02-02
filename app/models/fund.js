/**
 * Created by xiaobxia on 2018/1/25.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  fund_analyze: {type: Schema.Types.ObjectId, ref: 'FundAnalyze'},
  name: String,
  code: String,
  // 净值
  net_value: Number,
  net_value_date: Date,
  // 是否可购
  sell: Boolean,
  create_at: {
    type: Date,
    default: Date.now
  }
});

schema.index({code: 1}, {unique: true});
schema.index({create_at: -1});

module.exports = mongoose.model('Fund', schema);
