/**
 * Created by xiaobxia on 2018/1/26.
 */
const Proxy = require('../proxy');
const fundUtil = require('../util/fund');

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;

// 添加基金
exports.addFund = async function (code) {
  const fetchData = await Promise.all([
    fundUtil.getFundInfo(code),
    fundUtil.getRecentNetValue(code, 260)
  ]);
  // 基本数据
  const data = fetchData[0];
  // 近一年的涨跌数据
  const dataRecent = fetchData[1];
  // 添加数据
  return FundProxy.newAndSave({
    code: data.code,
    name: data.name,
    net_value: data.net_value,
    net_value_date: data.net_value_date,
    sell: true,
    valuation_tiantian: data.valuation,
    valuation_date: data.valuation_date,
    recent_net_value: JSON.stringify({data: dataRecent})
  })
};

// 批量添加，要提前验证code
exports.addFunds = async function (codeList) {
  // 获取基金信息
  let requestList = [fundUtil.getFundsInfo()];
  // 获取基金近期信息
  codeList.forEach(function (item) {
    requestList.push(fundUtil.getRecentNetValue(item, 260));
  });
  const fetchData = await Promise.all(requestList);
  // 基本数据
  const data = fetchData[0];
  const dataFunds = data.funds;
  let optionList = [];
  codeList.forEach(function (item, index) {
    let fundData = {};
    // 找到匹配的数据
    for (let k = 0; k < dataFunds.length; k++) {
      if (dataFunds[k].code === item) {
        fundData = dataFunds[k];
        break;
      }
    }
    optionList.push(FundProxy.newAndSave({
      code: fundData.code,
      name: fundData.name,
      net_value: fundData.net_value,
      net_value_date: data.net_value_date,
      sell: fundData.sell,
      recent_net_value: JSON.stringify({data: fetchData[index + 1]})
    }));
  });
  return Promise.all(optionList);
};

//导入基金
exports.importFunds = async function (codes) {
  const fundsTemp = await FundProxy.findSimple({});
  let codeList = [];
  // 把没导入过的导入
  codes.forEach(function (item) {
    let has = false;
    for (let k = 0; k < fundsTemp.length; k++) {
      if (fundsTemp[k].code === item) {
        has = true;
        break;
      }
    }
    if (!has) {
      codeList.push(item);
    }
  });
  return this.addFunds(codeList);
};

exports.deleteFundByCode = async function (code) {
  return FundProxy.deleteByCode(code)
};

exports.getFundSimpleByCode = async function (code) {
  return FundProxy.findOneSimple({code});
};

exports.getFundBaseByCode = async function (code) {
  return FundProxy.findOneBase({code});
};

exports.getFundByCode = async function (code) {
  return FundProxy.findOne({code});
};

exports.getFundsByIds = async function (ids) {
  return FundProxy.find({_id: {$in: [...ids]}});
};

exports.getSimpleFundsByPaging = async function (query, opt) {
  const data = await Promise.all([FundProxy.findSimple(query, opt), FundProxy.count(query)]);
  return {list: data[0], count: data[1]};
};

exports.checkFundByQuery = async function (query) {
  return FundProxy.check(query);
};

exports.addUserFund = async function (userId, fundId, count) {
  return UserFundProxy.newAndSave({
    user: userId,
    fund: fundId,
    count: count,
  });
};

exports.deleteUserFund = async function (userId, fundId) {
  return UserFundProxy.delete({user: userId, fund: fundId});
};

exports.updateUserFund = async function (userId, fundId, count) {
  return UserFundProxy.updateCount(userId, fundId, count);
};

exports.getUserFund = async function (userId, fundId) {
  return UserFundProxy.findByUserIdFundId(userId, fundId);
};

exports.getUserFundsByUserId = async function (userId) {
  return UserFundProxy.findByUserId(userId);
};

exports.getUserFundsByUserIdWithFund = async function (userId) {
  return UserFundProxy.findByUserIdWithFund(userId);
};

exports.getUserFundsByFundId = async function (fundId) {
  return UserFundProxy.find({fund: fundId});
};

exports.checkUserFundByQuery = async function (query) {
  return UserFundProxy.check(query);
};

