/**
 * Created by xiaobxia on 2018/1/26.
 */
const Proxy = require('../proxy');
const fundUtil = require('../util/fund');

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;
const FundAnalyzeProxy = Proxy.FundAnalyze;

exports.addFund = async function (code) {
  const data = await fundUtil.getFundInfo(code);
  const fundAnalyze = await FundAnalyzeProxy.newAndSave({
    code: data.fundcode
  });
  return FundProxy.newAndSave({
    code: data.fundcode,
    name: data.name,
    net_value: data.dwjz,
    net_value_date: data.jzrq,
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
          fundAnalyze = await FundAnalyzeProxy.newAndSave({
            code: fundData.code
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
        code: temp.code
      });
    }
    // 没有的添加，有的更新
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


