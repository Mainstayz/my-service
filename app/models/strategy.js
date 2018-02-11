/**
 * Created by xiaobxia on 2018/2/11.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  // 'YYYY-MM-DD'
  day: String,
  // json
  list: String,
  update_at: {
    type: Date,
    default: Date.now
  },
  create_at: {
    type: Date,
    default: Date.now
  }
});

schema.index({day: 1}, {unique: true});
schema.index({create_at: -1});

module.exports = mongoose.model('Strategy', schema);
