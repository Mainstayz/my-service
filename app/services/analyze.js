/**
 * Created by xiaobxia on 2018/2/2.
 */
const moment = require('moment');
const Proxy = require('../proxy');
const util = require('../util');
const logger = require('../common/logger');

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;
const StrategyProxy = Proxy.Strategy;
const FocusFundProxy = Proxy.FocusFund;
const fundInfoUtil = util.fundInfoUtil;
const numberUtil = util.numberUtil;
const analyzeUtil = util.analyzeUtil;
const fundBaseUtil = util.fundBaseUtil;



exports.getFundAnalyzeRecent = function (fund) {
  const list = JSON.parse(fund['recent_net_value']).data;
  // 获取估值
  const valuationInfo = fundBaseUtil.getBetterValuation(fund);
  /**
   * 客观统计数据
   */
    // 目前估值
  const valuation = valuationInfo.valuation;
  // 当日幅度
  const valuationRate = numberUtil.countRate((valuation - fund['net_value']), fund['net_value']);
  /**
   * 客观分析
   */
  let buyCount = 0;
  // 从小到大排序，并记录次数
  const netValueSort = analyzeUtil.getNetValueSort(list);
  const netValueSortHalfYear = analyzeUtil.getNetValueSort(list.slice(0, 130));
  const costLine = analyzeUtil.getCostLine(netValueSort);
  const costLineHalf = analyzeUtil.getCostLine(netValueSortHalfYear);
  const supportLine = analyzeUtil.getSupportLine(netValueSort);

  // 从连续性上看上涨的概率
  let day = analyzeUtil.continueDays(valuationRate, list);
  let internalData = {};
  if (valuationRate <= 0) {
    internalData = maxUpIntervalAndMaxDownInterval.downInterval;
  } else {
    internalData = maxUpIntervalAndMaxDownInterval.upInterval;
  }
  let allInterDays = 0;
  let rateDays = 0;
  for (let key in internalData) {
    allInterDays += internalData[key].times;
    if (day < parseInt(key)) {
      rateDays += internalData[key].times;
    }
  }
  const internal = numberUtil.countRate(
    valuationRate < 0 ? (1 - rateDays / allInterDays) : (rateDays / allInterDays),
    1);

  // 近几天的暴跌信息， 包括了当天的
  const slumpInfo = analyzeUtil.judgeSlump(valuation, list);

  // 低位信息
  const lowPointInfo = analyzeUtil.judgeLowPoint(valuation, netValueSort, 260);
  const lowPointInfoHalf = analyzeUtil.judgeLowPoint(valuation, netValueSortHalfYear, 130);

  // 高位信息
  const highPointInfo = analyzeUtil.judgeHighPoint(valuation, netValueSort, 260);
  const highPointInfoHalf = analyzeUtil.judgeHighPoint(valuation, netValueSortHalfYear, 130);

  // 是不是有支撑
  let supportCount = 0;
  netValueSort.forEach(function (item) {
    // 上下3.5个点
    if (valuation * 1.025 > item.netValue && valuation * 0.975 < item.netValue) {
      supportCount += item.times;
    }
  });
  return {
    recentNetValue: list,
    upAndDownCount,
    maxUpAndDown,
    upAndDownDistribution,
    maxUpIntervalAndMaxDownInterval,
    netValueDistribution,
    recentSlump: slumpInfo.RateList,
    supportLine,
    valuationRate,
    result: {
      // 都是上涨的概率
      distribution,
      internal,
      // 是否新低
      isMin: valuation < netValueSort[0].netValue,
      // 是不是在低位
      // isLow: lowPointInfo.valuationIndex < 260 * 0.2 || valuation < lowPointInfo.lowLine,
      isLow: lowPointInfo.count > 0,
      isLowHalf: lowPointInfoHalf.count > 0,
      isHigh: highPointInfo.count > 0,
      isHighHalf: highPointInfoHalf.count > 0,
      // 是否有支撑
      isSupport: supportCount >= 260 * 0.3,
      // 是否暴跌
      isSlump: slumpInfo.count > 10,
      isWeekSlump: slumpInfo.weekCount > 5,
      isBoom: -slumpInfo.count > 10,
      isWeekBoom: slumpInfo.weekCountBoom > 3,
      costLine,
      costLineHalf
    },
    count: {
      slumpCount: slumpInfo.count,
      slumpWeekCount: slumpInfo.weekCount,
      boomCount: -slumpInfo.count,
      boomWeekCount: -slumpInfo.weekCount,
      lowCount: lowPointInfo.count,
      lowHalfCount: lowPointInfoHalf.count,
      highCount: highPointInfo.count,
      highHalfCount: highPointInfoHalf.count,
      internalCount: internal
    }
  };
};

exports.analyzeStrategyMap = function (funds) {
  let strategy = {};
  funds.forEach((item) => {
    if (item['recent_net_value']) {
      const fundAnalyzeRecent = this.getFundAnalyzeRecent(item);
      const result = fundAnalyzeRecent.result;
      const count = fundAnalyzeRecent.count;
      strategy[item.code] = {
        times: 0,
        _id: item._id,
        code: item.code,
        name: item.name,
        rule: [],
        valuationRate: fundAnalyzeRecent.valuationRate,
        slumpCount: count.slumpCount,
        boomCount: count.boomCount,
        boomWeekCount: count.boomWeekCount,
        lowCount: count.lowCount,
        slumpWeekCount: count.slumpWeekCount,
        lowHalfCount: count.lowHalfCount,
        highCount: count.highCount,
        highHalfCount: count.highHalfCount,
        recentSlump: fundAnalyzeRecent.recentSlump,
        saleRule: []
      };
      // 从幅度分布上看
      // if (result.distribution > 70) {
      //   strategy[item.code].times++;
      //   strategy[item.code].rule.push('distribution');
      // }
      // 从连续上看概率
      if (result.internal > 80) {
        strategy[item.code].times++;
        strategy[item.code].rule.push('internal');
      }
      // 从连续上看概率
      if (result.internal < 20) {
        strategy[item.code].times++;
        strategy[item.code].rule.push('downInternal');
      }
      // 是否是历史新低
      if (result.isMin) {
        strategy[item.code].times++;
        strategy[item.code].rule.push('isMin');
      }
      // 处于低位
      if (result.isLow) {
        strategy[item.code].times++;
        strategy[item.code].rule.push('isLow');
      }
      if (result.isLowHalf) {
        strategy[item.code].times++;
        strategy[item.code].rule.push('isLowHalf');
      }
      // 是否是暴跌
      if (result.isSlump) {
        strategy[item.code].times++;
        strategy[item.code].rule.push('isSlump');
      }
      if (result.isWeekSlump) {
        strategy[item.code].times++;
        strategy[item.code].rule.push('isWeekSlump');
      }
      // 是否是暴涨
      if (result.isBoom) {
        strategy[item.code].saleRule.push('isBoom');
      }
      if (result.isWeekBoom) {
        strategy[item.code].saleRule.push('isWeekBoom');
      }
      // 是否是高位
      // if (result.isHigh) {
      //   strategy[item.code].saleRule.push('isHigh');
      // }
      if (result.isHighHalf) {
        strategy[item.code].saleRule.push('isHighHalf');
      }
      // 是否有支撑
      if (result.isSupport) {
        // 不计分
        // strategy[item.code].times++;
        strategy[item.code].rule.push('isSupport');
      }
    }
  });
  return strategy;
};

// 把分析排序
exports.getStrategyList = async function () {
  const funds = await FundProxy.find({});
  let strategy = this.analyzeStrategyMap(funds);
  let strategyList = [];
  for (let k in strategy) {
    if (strategy[k].times !== 0) {
      // 如果只有一种，那只能是暴跌
      if (strategy[k].times === 1) {
        if (strategy[k].rule.indexOf('isWeekSlump') === -1) {
          continue;
        }
      }
      strategyList.push(strategy[k])
    }
  }
  // 按暴跌指数排名
  strategyList.sort(function (a, b) {
    return b.slumpWeekCount - a.slumpWeekCount;
  });
  return strategyList;
};

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

