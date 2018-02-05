/**
 * Created by xiaobxia on 2018/1/26.
 */
const Proxy = require('../proxy');
const fundUtil = require('../util/fund');

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;
const FundAnalyzeProxy = Proxy.FundAnalyze;

exports.addUserFund = async function (userId, fundId, count) {
  return UserFundProxy.newAndSave({
    user: userId,
    fund: fundId,
    count: count,
  });
};

exports.deleteUserFund = async function (userId, fundId) {
  return UserFundProxy.deleteUserFund(userId, fundId);
};

exports.updateUserFund = async function (userId, fundId, count) {
  return UserFundProxy.updateCount(userId, fundId, count);
};

// 更新基本信息，没有的添加，有的更新
exports.updateBaseInfo = async function () {
  // 得到基金信息
  const fundInfos = await fundUtil.getFundsInfo();
  const funds = fundInfos.funds;
  let optionList = [];
  for (let k = 0; k < funds.length; k++) {
    const temp = funds[k];
    // 分析表也要添加数据
    let fundAnalyze = await FundAnalyzeProxy.getByCode(temp.code);
    if (!fundAnalyze) {
      fundAnalyze = await FundAnalyzeProxy.newAndSave({
        code: temp.code,
        tiantian_count: 0,
        haomai_count: 0,
      });
    }
    const fund = await FundProxy.getByCode(temp.code);
    if (!fund) {
      optionList.push(FundProxy.newAndSave({
        code: temp.code,
        name: temp.name,
        net_value: temp.net_value,
        net_value_date: fundInfos.netValueDate,
        sell: temp.sell,
        fund_analyze: fundAnalyze._id
      }));
    } else {
      optionList.push(FundProxy.updateByCode(funds[k].code, {
        name: temp.name,
        net_value: temp.net_value,
        net_value_date: fundInfos.netValueDate
      }));
    }
  }
  return Promise.all(optionList);
};

exports.getFundByCode = async function (code) {
  return FundProxy.getByCode(code);
};

exports.getUserFund = async function (userId, fundId) {
  return UserFundProxy.getUserFund(userId, fundId);
};

exports.getUserFunds = async function (userId) {
  return UserFundProxy.getUserFunds(userId);
};

exports.getFundsByIds = async function (ids) {
  return FundProxy.find({_id: {$in: [...ids]}});
};


