/**
 * Created by xiaobxia on 2018/3/7.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  now_date: String,
  opening: Boolean,
  create_at: {
    type: Date,
    default: Date.now
  }
});

schema.index({ now_date: 1, create_at: -1 });

module.exports = mongoose.model('openingAudit', schema);
