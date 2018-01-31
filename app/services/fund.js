/**
 * Created by xiaobxia on 2018/1/26.
 */
const Proxy = require('../proxy');
const fundUtil = require('../util/fund');

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;

exports.getFundByCode = async function (code) {
  const fund = await FundProxy.getByCode(code);
  return fund;
};

exports.addFund = async function (code) {
  const fund = await FundProxy.getByCode(code);
  if (!fund) {
    const result = await fundUtil.getFundInfo(code);
    // 新增的是用天天的源，在估算的定时任务中修改源
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
    return UserFundProxy.updateByUserIdAndFundId(userId, fundId, count);
  }
};

exports.deleteUserFund = async function (userId, fundId) {
  return UserFundProxy.deleteByUserIdAndFundId(userId, fundId);
};

exports.getUserFunds = async function (userId) {
  return UserFundProxy.getByUserId(userId);
};

exports.getFundsByIds = async function (ids) {
  return FundProxy.find({_id: {$in: [...ids]}});
};

exports.updateFundsInfo = async function () {
  const funds = await fundUtil.getFundsInfo();
  for (let k = 0; k < funds.length; k++) {
    const fund = await FundProxy.getByCode(funds[k].code);
    if (!fund) {
      await FundProxy.newAndSave(funds[k].code, funds[k].name, funds[k].net_value, funds[k].valuation);
    } else {
      // 如果源是天天的，那就更新估值
      if(fund.valuationSource === 'tiantian') {
        await FundProxy.updateByCode(funds[k].code, funds[k].name, funds[k].net_value, funds[k].valuation);
      } else {
        await FundProxy.updateNetValueByCode(funds[k].code, funds[k].net_value);
      }
    }
  }
  return true;
};
