/**
 * Created by xiaobxia on 2018/1/25.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const schema = new Schema({
  user_id: {type: ObjectId},
  name: String,
  code: String,
  // 净值
  net_value:
  create_at: {
    type: Date,
    default: Date.now
  }
});

schema.index({ user_id: 1, create_at: -1 });

module.exports = mongoose.model('Fund', schema);
