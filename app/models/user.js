const mongoose = require('mongoose')

const Schema = mongoose.Schema

const schema = new Schema({
  name: String,
  password: String,
  email: String,
  mobile: String,
  true_name: String,
  gender: Number,
  birthday: Date,
  city: String,
  website: String,
  company: String,
  school: String,
  job: String,
  introduce: String,
  token: String,
  create_at: {
    type: Date,
    default: Date.now
  }
})
// 1升序，-1降序。比如积分一般在排序时越大的在越前面，所以用降序
// 名字不重复
schema.index({ name: 1 }, { unique: true })

module.exports = mongoose.model('User', schema)
