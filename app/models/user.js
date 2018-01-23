const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  name: String,
  password: String,
  token: String,
  create_at: {
    type: Date,
    default: Date.now
  }
});
// 1升序，-1降序。比如积分一般在排序时越大的在越前面，所以用降序
schema.index({name: 1});

module.exports = mongoose.model('User', schema);
