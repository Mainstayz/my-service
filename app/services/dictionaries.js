/**
 * Created by xiaobxia on 2018/4/1.
 */
const Proxy = require('../proxy');
const Dictionaries = Proxy.Dictionaries;

exports.getByKey = async function (key) {
  return Dictionaries.findOne({key});
};
