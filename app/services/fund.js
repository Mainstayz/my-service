/**
 * Created by xiaobxia on 2018/1/26.
 */
const request = require('request-promise');
const Proxy = require('../proxy');

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;

exports.addFund = async function (code) {
  const fund = await FundProxy.getByCode(code);
  if (!fund) {
    const result = await request({
      method: 'get',
      url: `http://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`,
      encoding: 'utf-8'
    }).then((body) => {
      const jsonData = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
      return JSON.parse(jsonData);
    });
    return FundProxy.newAndSave(result.fundcode, result.name, result.dwjz, result.gsz);
  } else {
    return fund;
  }
};

exports.addUserFund = async function (userId, fundId, count) {
  const userFund = await UserFundProxy.getByUserIdAndFundId(userId, fundId);
  if (!userFund) {
    return UserFundProxy.newAndSave(userId, fundId, count);
  } else {
    return userFund;
  }
};

exports.getUserFunds = async function (userId) {
  return UserFundProxy.getByUserId(userId);
};

exports.getFundsByIds = async function (ids) {
  return FundProxy.find({_id: {$in: [...ids]}});
};
