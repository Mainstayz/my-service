/**
 * Created by xiaobxia on 2018/4/5.
 */
const Proxy = require('../proxy');

const UserNetValue = Proxy.UserNetValue;


exports.addUserNetValue = async function (userId, dateString, data) {
  return UserNetValue.newAndSave({
    user: userId,
    net_value_date: dateString,
    ...data
  });
};

exports.deleteUserNetValue = async function (userId, dateString) {
  return UserNetValue.delete({user: userId, net_value_date: dateString});
};

exports.updateUserNetValue = async function (userId, dateString, data) {
  return UserNetValue.update({user: userId, net_value_date: dateString}, data);
};

exports.getUserNetValueByPaging = async function (query, paging) {
  const opt = {
    skip: paging.start,
    limit: paging.offset,
    sort: '-net_value_date'
  };
  const data = await Promise.all([UserNetValue.find({}, opt), UserNetValue.count({})]);
  return {list: data[0], count: data[1]};
};
