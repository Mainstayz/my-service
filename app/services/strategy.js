/**
 * Created by xiaobxia on 2018/4/5.
 */
const analyzeService = require('./analyze');
const dictionariesService = require('./dictionaries');
const Proxy = require('../proxy');

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;
const FocusFundProxy = Proxy.FocusFund;
const OptionalFundProxy = Proxy.OptionalFund;

// 获取建议
exports.getStrategy = async function (userId, two) {
  const funds = await FundProxy.find({});
  const userFund = await UserFundProxy.find({user: userId});
  const analyzeValue = await dictionariesService.getAnalyzeValue();
  let list = [];
  let listBoom = [];
  for (let i = 0; i < funds.length; i++) {
    const fund = funds[i];
    let analyzeInfo = analyzeService.getFundAnalyzeRecent(fund, analyzeValue);
    analyzeInfo.has = false;
    for (let j = 0; j < userFund.length; j++) {
      if (userFund[j].fund.toString() === fund._id.toString()) {
        analyzeInfo.has = true;
        break;
      }
    }
    if (two === true) {
      if (analyzeInfo.result.isMonthBoom || analyzeInfo.result.isHalfMonthBoom|| (analyzeInfo.result.isHigh && analyzeInfo.result.isHighHalf)) {
        listBoom.push({
          _id: fund._id,
          code: fund.code,
          name: fund.name,
          ...analyzeInfo
        })
      }
    }
    if (analyzeInfo.result.isMin || analyzeInfo.result.isMonthSlump || analyzeInfo.result.isHalfMonthSlump || (analyzeInfo.result.isLow && analyzeInfo.result.isLowHalf)) {
      list.push({
        _id: fund._id,
        code: fund.code,
        name: fund.name,
        ...analyzeInfo
      })
    }
  }
  if (two === true) {
    // 按暴涨排名
    listBoom.sort(function (a, b) {
      //大的在前面，halfMonthMax理论上是正数
      return b.halfMonthMax - a.halfMonthMax;
    });
  }
  // 按暴跌排名
  list.sort(function (a, b) {
    //小的在前面，halfMonthMin理论上是负数
    return a.halfMonthMin - b.halfMonthMin;
  });
  if (two === true) {
    return {
      slump: list,
      boom: listBoom
    }
  }
  return list;
};

// 对我的持仓的建议
exports.getMyStrategy = async function (userId) {
  const userFund = await UserFundProxy.find({user: userId});
  let fundIds = [];
  const analyzeValue = await dictionariesService.getAnalyzeValue();
  userFund.forEach(function (item) {
    //拥有份额的
    if (item.shares > 0) {
      fundIds.push(item.fund);
    }
  });
  const funds = await FundProxy.find({
    _id: {$in: fundIds}
  });
  let list = [];
  for (let i = 0; i < funds.length; i++) {
    const fund = funds[i];
    let analyzeInfo = analyzeService.getFundAnalyzeRecent(fund, analyzeValue);
    list.push({
      _id: fund._id,
      code: fund.code,
      name: fund.name,
      ...analyzeInfo
    })
  }
  // 按暴跌排名
  list.sort(function (a, b) {
    //小的在前面，halfMonthMin理论上是负数
    return a.halfMonthMin - b.halfMonthMin;
  });
  return list;
};

// 低费率建议
exports.getLowRateStrategy = async function (userId) {
  const funds = await FundProxy.find({lowRate: true});
  const userFund = await UserFundProxy.find({user: userId});
  const analyzeValue = await dictionariesService.getAnalyzeValue();
  let list = [];
  for (let i = 0; i < funds.length; i++) {
    const fund = funds[i];
    let analyzeInfo = analyzeService.getFundAnalyzeRecent(fund, analyzeValue);
    analyzeInfo.has = false;
    for (let j = 0; j < userFund.length; j++) {
      if (userFund[j].fund.toString() === fund._id.toString()) {
        analyzeInfo.has = true;
        break;
      }
    }
    list.push({
      _id: fund._id,
      code: fund.code,
      name: fund.name,
      ...analyzeInfo
    })
  }
  // 按暴跌排名
  list.sort(function (a, b) {
    //小的在前面，halfMonthMin理论上是负数
    return a.halfMonthMin - b.halfMonthMin;
  });
  return list;
};

exports.getFocusStrategy = async function (userId) {
  const focusFund = await FocusFundProxy.find({user: userId});
  const userFund = await UserFundProxy.find({user: userId});
  let fundIds = [];
  focusFund.forEach(function (item) {
    fundIds.push(item.fund);
  });
  const funds = await FundProxy.find({
    _id: {$in: fundIds}
  });
  let strategy = this.analyzeStrategyMap(funds);
  let strategyList = [];
  for (let k in strategy) {
    strategy[k].has = false;
    userFund.forEach(function (item) {
      if (item.fund.toString() === strategy[k]._id.toString()) {
        if (item.count > 0) {
          strategy[k].has = true;
        }
      }
    });
    strategyList.push(strategy[k]);
  }
  // 按暴跌指数排名
  strategyList.sort(function (a, b) {
    return b.slumpWeekCount - a.slumpWeekCount;
  });
  return strategyList;
};

exports.getFundsMaxMinDistribution = async function () {
  let max = [];
  let min = [];
  let halfMax = [];
  let halfMin = [];
  let maxMap = {};
  let minMap = {};
  let halfMaxMap = {};
  let halfMinMap = {};
  const funds = await FundProxy.find({});
  for (let i = 0; i < funds.length; i++) {
    const fund = funds[i];
    const result = analyzeService.getFundMaxMinDistribution(fund);
    max = max.concat(result.max);
    min = min.concat(result.min);
    halfMax = halfMax.concat(result.halfMax);
    halfMin = halfMin.concat(result.halfMin);
  }
  for (let i = 0; i < max.length; i++) {
    if (maxMap[max[i]+'']) {
      maxMap[max[i]+'']++;
    } else {
      maxMap[max[i]+''] = 1;
    }
  }
  for (let i = 0; i < min.length; i++) {
    if (minMap[min[i]+'']) {
      minMap[min[i]+'']++;
    } else {
      minMap[min[i]+''] = 1;
    }
  }
  for (let i = 0; i < halfMin.length; i++) {
    if (halfMinMap[halfMin[i]+'']) {
      halfMinMap[halfMin[i]+'']++;
    } else {
      halfMinMap[halfMin[i]+''] = 1;
    }
  }
  for (let i = 0; i < halfMax.length; i++) {
    if (halfMaxMap[halfMax[i]+'']) {
      halfMaxMap[halfMax[i]+'']++;
    } else {
      halfMaxMap[halfMax[i]+''] = 1;
    }
  }
  return {
    halfMaxMap,
    halfMinMap,
    maxMap,
    minMap
  }
};
