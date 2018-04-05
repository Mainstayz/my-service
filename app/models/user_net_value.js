/**
 * Created by xiaobxia on 2018/3/31.
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const schema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  net_value: Number,
  net_value_date: String,
  create_at: {
    type: Date,
    default: Date.now
  }
});
schema.index({net_value_date: -1}, {unique: true});

module.exports = mongoose.model('UserNetValue', schema);
