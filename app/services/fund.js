/**
 * Created by xiaobxia on 2018/1/26.
 */
const Proxy = require('../proxy');
const fundInfoUtil = require('../util/fundInfo');
const localConst = require('../const');

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;
const FocusFundProxy = Proxy.FocusFund;
const OptionalFundProxy = Proxy.OptionalFund;

/**
 * 添加基金
 */
exports.addFundByCode = async function (code) {
  //检验是否存在
  let fund = await FundProxy.check({code});
  if (fund) {
    return fund;
  }
  //获取网络数据
  const fetchData = await Promise.all([
    fundInfoUtil.getFundInfo(code),
    fundInfoUtil.getRecentNetValue(code, localConst.RECENT_NET_VALUE_DAYS)
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

/**
 * 删除基金
 */
exports.deleteFundByCode = async function (code) {
  //检查是否被占用
  const queryList = await Promise.all([
    OptionalFundProxy.find({code}),
    FocusFundProxy.find({code}),
    UserFundProxy.find({code})
  ]);
  for (let i = 0; i < queryList.length; i++) {
    if (queryList[i].length !== 0) {
      throw new Error('基金已被使用，无法删除');
    }
  }
  //检查是否存在
  const fund = await FundProxy.check({code});
  if (!fund) {
    throw new Error('基金不存在');
  }
  //删除
  return FundProxy.delete({code})
};

/**
 * 获取基金基本信息
 */
exports.getFundBaseByCode = async function (code) {
  return FundProxy.findOneBase({code});
};

/**
 * 分页获取基金基本信息
 */
exports.getFundsBaseByPaging = async function (query, paging) {
  const opt = {
    skip: paging.start,
    limit: paging.offset,
    sort: '-create_at'
  };
  let queryOption = {};
  if (query.keyword) {
    const keyExp = new RegExp(query.keyword, 'i');
    queryOption = {
      $or: [
        {code: keyExp},
        {name: keyExp}]
    }
  }
  const data = await Promise.all([FundProxy.findBase(queryOption, opt), FundProxy.count(queryOption)]);
  return {list: data[0], count: data[1]};
};


// 批量添加，要提前验证code
exports.addFunds = async function (codeList) {
  // 获取基金信息
  let requestList = [
    fundInfoUtil.getFundsInfo()
  ];
  // 获取基金近期信息
  codeList.forEach(function (item) {
    requestList.push(fundInfoUtil.getRecentNetValue(item, 260));
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
      valuation_tiantian: fundData.valuation,
      valuation_date: data.valuation_date,
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

exports.updateFundByCode = async function (code, data) {
  return FundProxy.updateByCode(code, data)
};


exports.getFundSimpleByCode = async function (code) {
  return FundProxy.findOneSimple({code});
};



exports.getFundByCode = async function (code) {
  return FundProxy.findOne({code});
};

exports.getFundsByIds = async function (ids) {
  return FundProxy.find({_id: {$in: [...ids]}});
};



exports.checkFundByQuery = async function (query) {
  return FundProxy.check(query);
};
