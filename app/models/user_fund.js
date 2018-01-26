/**
 * Created by xiaobxia on 2018/1/25.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const schema = new Schema({
  user_id: {type: ObjectId},
  fund_id: {type: ObjectId},
  count: Number,
  create_at: {
    type: Date,
    default: Date.now
  }
});
// 一般是以用户id查
schema.index({ fund_id: 1, user_id: 1 }, { unique: true });
schema.index({create_at: -1});

module.exports = mongoose.model('UserFund', schema);
