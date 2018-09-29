/**
 * Created by xiaobxia on 2018/3/5.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//关注基金是跟踪基金，看看关注以后的变化
const schema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  fund: {type: Schema.Types.ObjectId, ref: 'Fund'},
  //关注时净值
  focus_net_value: Number,
  //关注日期
  focus_date: {
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

module.exports = mongoose.model('FocusFund', schema);
