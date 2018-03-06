/**
 * Created by xiaobxia on 2018/3/6.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  name: String,
  describe: String,
  open: {
    type: Boolean,
    default: false
  },
  create_at: {
    type: Date,
    default: Date.now
  }
});
// 一般是以用户id查
schema.index({name: 1}, {unique: true});
schema.index({create_at: -1});

module.exports = mongoose.model('Schedule', schema);
