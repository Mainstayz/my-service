/**
 * Created by xiaobxia on 2018/1/26.
 */
const Proxy = require('../proxy');
const fundInfoUtil = require('../util/fundInfo');
const localConst = require('../const');
const moment = require('moment');
const util = require('../util');

const numberUtil = util.numberUtil;
const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;
const FocusFundProxy = Proxy.FocusFund;
const OptionalFundProxy = Proxy.OptionalFund;
const DictionariesProxy = Proxy.Dictionaries;

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

exports.getFundByCode = async function (code) {
  return FundProxy.findOne({code});
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
    requestList.push(fundInfoUtil.getRecentNetValue(item, localConst.RECENT_NET_VALUE_DAYS));
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
exports.importFunds = async function (funds) {
  const fundsTemp = await FundProxy.findBase({});
  let codeList = [];
  // 把没导入过的导入
  funds.forEach(function (item) {
    let has = false;
    for (let k = 0; k < fundsTemp.length; k++) {
      if (fundsTemp[k].code === item.code) {
        has = true;
        break;
      }
    }
    if (!has) {
      codeList.push(item.code);
    }
  });
  return this.addFunds(codeList);
};

//验证开市
exports.verifyOpening = async function () {
  const nowDay = moment().format('YYYY-MM-DD');
  const fundData = await fundInfoUtil.getFundsInfo();
  // 如果相同就说明开盘了
  const isToday = nowDay === fundData.valuation_date;
  let result = await DictionariesProxy.findOne({key: localConst.OPENING_RECORDS_REDIS_KEY});
  let records = [];
  //如果有记录
  if (result) {
    records = JSON.parse(result.value);
    // 没开市，就不会有记录
    if (records[0] === nowDay) {
      return 'over';
    } else {
      //是，就加记录
      if (isToday) {
        records.unshift(nowDay);
      }
    }
  } else {
    //是，就加记录
    if (isToday) {
      records = [nowDay];
    }
  }
  records = records.slice(0, 260);
  await DictionariesProxy.update({key: localConst.OPENING_RECORDS_REDIS_KEY}, {
    value: JSON.stringify(records)
  });
  return isToday;
};


// 更新估值
exports.updateValuation = async function () {
  // 获取基金
  const funds = await FundProxy.findBase({});
  // 抓取数据
  const fetchList = Promise.all([
    fundInfoUtil.getFundsInfo(),
    fundInfoUtil.getFundsInfoHaomai(),
    // 估值时间以招商白酒为基准
    fundInfoUtil.getFundInfo('161725')
  ]);
  const fetchData = await fetchList;
  const tiantianData = fetchData[0];
  const haomaiData = fetchData[1];
  // 估值时间
  const valuationDate = fetchData[2].valuation_date;
  let updateList = [];
  let valuationDataList = [];
  // 混合天天和好买数据
  for (let i = 0; i < tiantianData.funds.length; i++) {
    for (let j = 0; j < haomaiData.funds.length; j++) {
      if (tiantianData.funds[i].code === haomaiData.funds[j].code) {
        valuationDataList.push({
          code: tiantianData.funds[i].code,
          tiantian: tiantianData.funds[i].valuation,
          haomai: haomaiData.funds[j].valuation
        });
        break;
      }
    }
  }
  // 更新
  for (let k = 0; k < funds.length; k++) {
    for (let i = 0; i < valuationDataList.length; i++) {
      const valuationData = valuationDataList[i];
      if (valuationData.code === funds[k].code) {
        updateList.push(FundProxy.update({code: funds[k].code}, {
          valuation_tiantian: valuationData.tiantian,
          valuation_haomai: valuationData.haomai || valuationData.tiantian,
          valuation_date: valuationDate
        }));
        break;
      }
    }
  }
  return Promise.all(updateList);
};

// 更新估值准确记录
exports.betterValuation = async function () {
  const funds = await FundProxy.findBase({});
  for (let k = 0; k < funds.length; k++) {
    const fund = funds[k];
    let betterCount = [];
    //如果有之前的记录
    if (fund['better_count']) {
      betterCount = JSON.parse(fund['better_count']).data;
      // 如果当天的被添加过了，那就跳过
      if (moment(fund['valuation_date']).isSame(betterCount[0].date, 'day')) {
        continue;
      }
    }
    let type = '';
    // 估值和净值是不是同一天，那就跳过
    if (!moment(fund['valuation_date']).isSame(fund['net_value_date'], 'day')) {
      continue;
    }
    // 对比差值的偏离
    if (Math.abs(fund['valuation_tiantian'] - fund['net_value']) > Math.abs(fund['valuation_haomai'] - fund['net_value'])) {
      type = 'haomai';
    } else {
      type = 'tiantian';
    }
    // 添加数据
    betterCount.unshift({
      type,
      date: fund['net_value_date']
    });
    // 超过15天数据就截掉
    if (betterCount.length > 15) {
      betterCount = betterCount.slice(0, 15)
    }
    // 更新数据
    await FundProxy.update({code: funds[k].code}, {
      better_count: JSON.stringify({
        data: betterCount
      })
    })
  }
};

// 产生所有的近期涨跌数据，一般只有第一次产生数据时用
exports.updateRecentNetValue = async function () {
  const funds = await FundProxy.find({});
  let requestList = [];
  funds.forEach(function (fund) {
    requestList.push(fundInfoUtil.getRecentNetValue(fund.code, localConst.RECENT_NET_VALUE_DAYS).then((item)=>{
      return FundProxy.update({code: fund.code}, {
        recent_net_value: JSON.stringify({data: item})
      })
    }));
  });
  return Promise.all(requestList);
};

// 添加涨跌数据，在执行这个之前要保证fund中的数据是最新的
exports.addRecentNetValue = async function () {
  const funds = await FundProxy.find({});
  for (let k = 0; k < funds.length; k++) {
    const fund = funds[k];
    let recentNetValue = [];
    let newData = {};
    // 如果有记录
    if (fund['recent_net_value']) {
      recentNetValue = JSON.parse(fund['recent_net_value']).data;
      // 添加过那就跳过
      if (moment(recentNetValue[0]['net_value_date']).isSame(fund['net_value_date'], 'day')) {
        continue;
      }
      // 拿最新净值和前一天净值对比，计算增长率
      newData.valuation_rate = numberUtil.countRate(fund['net_value'] - recentNetValue[0].net_value, recentNetValue[0].net_value);
    } else {
      newData.valuation_rate = 0;
    }
    newData.net_value = fund['net_value'];
    newData['net_value_date'] = moment(fund['net_value_date']).format('YYYY-MM-DD');
    // 添加数据
    recentNetValue.unshift(newData);
    // 超过260天数据就截掉
    if (recentNetValue.length > localConst.RECENT_NET_VALUE_DAYS) {
      recentNetValue = recentNetValue.slice(0, localConst.RECENT_NET_VALUE_DAYS)
    }
    await FundProxy.update({code: funds[k].code}, {
      recent_net_value: JSON.stringify({data: recentNetValue})
    });
  }
};

// 更新基本信息
exports.updateBaseInfo = async function () {
  // 得到基金，有的才更新
  const funds = await FundProxy.findBase({});
  // 得到基金信息
  const fundsInfo = await fundInfoUtil.getFundsInfo();
  const fundInfos = fundsInfo.funds;
  let optionList = [];
  for (let k = 0; k < funds.length; k++) {
    const temp = funds[k];
    for (let i = 0; i < fundInfos.length; i++) {
      const info = fundInfos[i];
      if (temp.code === info.code) {
        optionList.push(FundProxy.update({code: temp.code}, {
          name: info.name,
          net_value: info.net_value,
          net_value_date: fundsInfo.net_value_date,
          sell: info.sell,
        }));
        break;
      }
    }
  }
  return Promise.all(optionList);
};

//删除不售的基金
exports.deleteUnSellFund = async function () {
  //获取不售的
  const funds = await FundProxy.findBase({sell: false});
  let optionList = [];
  for (let i = 0; i < funds.length; i++) {
    const code = funds[i].code;
    const queryList = await Promise.all([
      OptionalFundProxy.find({code}),
      FocusFundProxy.find({code}),
      UserFundProxy.find({code})
    ]);
    let use = false;
    for (let i = 0; i < queryList.length; i++) {
      if (queryList[i].length !== 0) {
        use = true;
      }
    }
    if (!use) {
      optionList.push(FundProxy.delete({code}));
    }
  }
  return Promise.all(optionList);
};

//更新费率信息
exports.updateLowRateFund = async function (codes) {
  const funds = await FundProxy.findBase({});
  let optionList = [];
  funds.forEach((fund)=>{
    if (codes.indexOf(fund.code) === -1) {
      optionList.push(FundProxy.update({code: fund.code}, {
        lowRate: false
      }));
    } else {
      optionList.push(FundProxy.update({code: fund.code}, {
        lowRate: true
      }));
    }
  });
  return Promise.all(optionList);
};

//更新费率信息
exports.deleteHighRateFund = async function (codes) {
  //传进来的都是低和中等费率的
  const funds = await FundProxy.findBase({});
  let optionList = [];
  for (let i = 0; i < funds.length; i++) {
    const code = funds[i].code;
    //不是低和中等费率的
    if (codes.indexOf(code) === -1) {
      const queryList = await Promise.all([
        OptionalFundProxy.find({code}),
        FocusFundProxy.find({code}),
        UserFundProxy.find({code})
      ]);
      let use = false;
      for (let i = 0; i < queryList.length; i++) {
        if (queryList[i].length !== 0) {
          use = true;
        }
      }
      if (!use) {
        optionList.push(FundProxy.delete({code}));
      }
    }
  }
  return Promise.all(optionList);
};
