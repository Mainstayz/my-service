/**
 * Created by xiaobxia on 2018/3/29.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//自选基金是自己基金库，买基金的时候会优先在这里选
const schema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  fund: {type: Schema.Types.ObjectId, ref: 'Fund'},
  //加入自选时净值
  optional_net_value: Number,
  //加入自选时日期
  optional_date: {
    type: Date,
    default: Date.now
  },
  create_at: {
    type: Date,
    default: Date.now
  }
});
// 一般是以用户id查
schema.index({ user: 1, fund: 1 }, { unique: true });
schema.index({create_at: -1});

module.exports = {
  model: mongoose.model('OptionalFund', schema)
};
