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
  const data = await Promise.all([UserNetValue.find(query, opt), UserNetValue.count(query)]);
  return {list: data[0], count: data[1]};
};

exports.getUserNetValue = async function (query) {
  const opt = {
    sort: 'net_value_date'
  };
  return UserNetValue.find(query, opt);
};

exports.getUserNetValueNewSort = async function (query) {
  const opt = {
    sort: '-net_value_date'
  };
  return UserNetValue.find(query, opt);
};
