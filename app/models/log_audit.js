/**
 * Created by xiaobxia on 2018/1/23.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const schema = new Schema({
  log_type: String,
  user_id: {type: ObjectId},
  create_at: {
    type: Date,
    default: Date.now
  }
});

schema.index({name: 1}, {unique: true});

module.exports = mongoose.model('LogAudit', schema);
