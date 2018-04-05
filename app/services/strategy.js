/**
 * Created by xiaobxia on 2018/4/5.
 */
const analyzeService = require('./analyze');
const Proxy = require('../proxy');

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;
const FocusFundProxy = Proxy.FocusFund;
const OptionalFundProxy = Proxy.OptionalFund;

// 获取建议
exports.getStrategy = async function (force) {
  // 得到今天
  const nowDay = moment().format('YYYY-MM-DD');
  let strategyList = null;
  // 查找今天的建议
  const rawStrategy = await StrategyProxy.findOne({
    day: nowDay
  });
  if (!force && rawStrategy) {
    // 验证是否超过5分钟
    if (moment(rawStrategy['update_at']).add(5, 'minute').isBefore(moment())) {
      // 重新获取
      strategyList = await this.getStrategyList();
    } else {
      return JSON.parse(rawStrategy.list)
    }
  } else {
    strategyList = await this.getStrategyList();
  }
  // 决定更新还是创建
  if (rawStrategy) {
    await StrategyProxy.updateByDay(nowDay, {
      list: JSON.stringify(strategyList),
      update_at: Date.now()
    })
  } else {
    await StrategyProxy.newAndSave({
      day: nowDay,
      list: JSON.stringify(strategyList)
    })
  }
  return strategyList;
};

// 对我的持仓的建议
exports.getMyStrategy = async function (userId) {
  const userFund = await UserFundProxy.find({user: userId});
  let fundIds = [];
  userFund.forEach(function (item) {
    if (item.count > 0) {
      fundIds.push(item.fund);
    }
  });
  const funds = await FundProxy.find({
    _id: {$in: fundIds}
  });
  let strategy = this.analyzeStrategyMap(funds);
  let strategyList = [];
  for (let k in strategy) {
    strategy[k].has = true;
    strategyList.push(strategy[k]);
  }
  // 按暴跌指数排名
  strategyList.sort(function (a, b) {
    return b.slumpWeekCount - a.slumpWeekCount;
  });
  return strategyList;
};

// 低费率建议
exports.getLowRateStrategy = async function (userId) {
  const funds = await FundProxy.find({lowRate: true});
  const userFund = await UserFundProxy.find({user: userId});
  let list = [];
  for (let i = 0; i < funds.length; i++) {
    const fund = funds[i];
    let analyzeInfo = analyzeService.getFundAnalyzeRecent(fund);
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
