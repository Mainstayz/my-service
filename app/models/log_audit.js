/**
 * Created by xiaobxia on 2018/1/23.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const schema = new Schema({
  log_type: String,
  user_id: {type: ObjectId},
  platform: String,
  create_at: {
    type: Date,
    default: Date.now
  }
});
// 一般是以用户id查
schema.index({ user_id: 1, create_at: -1 });

module.exports = {
  model: mongoose.model('LogAudit', schema)
};
