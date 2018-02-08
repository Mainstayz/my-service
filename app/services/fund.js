/**
 * Created by xiaobxia on 2018/1/26.
 */
const Proxy = require('../proxy');
const fundUtil = require('../util/fund');

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;
const FundAnalyzeProxy = Proxy.FundAnalyze;

exports.addFund = async function (code) {
  const fetchData = await Promise.all([
    fundUtil.getFundInfo(code),
    fundUtil.getRecentNetValue(code, 260)
  ]);
  const data = fetchData[0];
  // 近一年的涨跌数据
  const dataRecent = fetchData[1];
  // 在分析表中添加数据
  const fundAnalyze = await FundAnalyzeProxy.newAndSave({
    code: code,
    valuation_tiantian: data.valuation,
    valuation_date: data.valuation_date,
    recent_net_value: JSON.stringify({data: dataRecent})
  });
  return FundProxy.newAndSave({
    code: data.code,
    name: data.name,
    net_value: data.net_value,
    net_value_date: data.net_value_date,
    sell: true,
    fund_analyze: fundAnalyze._id
  })
};

exports.deleteFund = async function (code) {
  const fund = await FundProxy.getByCode(code);
  // 存在才删除
  if (fund) {
    await FundAnalyzeProxy.deleteByCode(fund.code);
    return FundProxy.deleteByCode(fund.code)
  }
};

exports.getFundsByPaging = async function (query, opt) {
  const data = await Promise.all([FundProxy.find(query, opt), FundProxy.count(query)]);
  return {list: data[0], count: data[1]};
};

exports.importFund = async function (funds) {
  // 在网络上得到基本信息
  const fundInfos = await fundUtil.getFundsInfo();
  const fundsData = fundInfos.funds;
  let optionList = [];
  // 遍历导入的基金
  for (let k = 0; k < funds.length; k++) {
    // 检查是否在基金库中
    const fund = await FundProxy.getByCode(funds[k].code);
    if (!fund) {
      let fundAnalyze = null;
      for (let i = 0; i < fundsData.length; i++) {
        const fundData = fundsData[i];
        // 找到数据
        if (funds[k].code === fundData.code) {
          // 近一年的涨跌数据
          const data = await fundUtil.getRecentNetValue(funds[k].code, 260);
          // 在分析表中添加数据
          fundAnalyze = await FundAnalyzeProxy.newAndSave({
            code: fundData.code,
            recent_net_value: JSON.stringify({data})
          });
          optionList.push(FundProxy.newAndSave({
            code: fundData.code,
            name: fundData.name,
            net_value: fundData.net_value,
            net_value_date: fundInfos.netValueDate,
            sell: fundData.sell,
            fund_analyze: fundAnalyze._id
          }));
          break;
        }
      }
    }
  }
  return Promise.all(optionList);
};

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

exports.getFundByCode = async function (code) {
  return FundProxy.getByCode(code);
};

exports.getUserFund = async function (userId, fundId) {
  return UserFundProxy.getUserFund(userId, fundId);
};

exports.getUserFunds = async function (userId) {
  return UserFundProxy.getUserFunds(userId);
};

exports.getUserFundsByFundId = async function (fundId) {
  return UserFundProxy.find(fundId);
};

exports.getFundsByIds = async function (ids) {
  return FundProxy.find({_id: {$in: [...ids]}});
};


