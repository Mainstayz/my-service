/**
 * Created by xiaobxia on 2018/3/5.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  fund: {type: Schema.Types.ObjectId, ref: 'Fund'},
  create_at: {
    type: Date,
    default: Date.now
  }
});
// 一般是以用户id查
schema.index({ user: 1, fund: 1 }, { unique: true });
schema.index({create_at: -1});

module.exports = mongoose.model('FocusFund', schema);