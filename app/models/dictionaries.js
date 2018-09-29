/**
 * Created by xiaobxia on 2018/3/29.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
//字典
const schema = new Schema({
  //键
  key: String,
  //说明
  describe: String,
  //归类
  type: String,
  //值
  value: String,
  create_at: {
    type: Date,
    default: Date.now
  }
});

schema.index({key: 1}, {unique: true});
schema.index({create_at: -1});

module.exports = {
  model: mongoose.model('Dictionaries', schema)
};
