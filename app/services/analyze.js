/**
 * Created by xiaobxia on 2018/2/2.
 */
const moment = require('moment');
const Proxy = require('../proxy');
const util = require('../util');
const logger = require('../common/logger');
const redisClient = require('../common/redis');

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;
const StrategyProxy = Proxy.Strategy;
const FocusFundProxy = Proxy.FocusFund;
const fundUtil = util.fundUtil;
const numberUtil = util.numberUtil;
const analyzeUtil = util.analyzeUtil;

// 更新估值
exports.updateValuation = async function () {
  // 获取基金
  const funds = await FundProxy.findSimple({});
  // 抓取数据
  const fetchList = Promise.all([
    fundUtil.getFundsInfo(),
    fundUtil.getFundsInfoHaomai(),
    // 估值时间以招商白酒为基准
    fundUtil.getFundInfo('161725')
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
        updateList.push(FundProxy.updateByCode(funds[k].code, {
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
    // 不是第一次添加
    let betterCount = [];
    if (fund['better_count']) {
      betterCount = JSON.parse(fund['better_count']).data;
      // 先验证数据是否被添加过
      if (moment(fund['valuation_date']).isSame(betterCount[0].date, 'day')) {
        continue;
      }
    }
    let type = '';
    // 验证估值和净值是不是同一天
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
    await FundProxy.updateByCode(funds[k].code, {
      better_count: JSON.stringify({
        data: betterCount
      })
    })
  }
};

// 产生所有的近期涨跌数据，一般只有第一次产生数据时用
exports.updateRecentNetValue = async function () {
  const funds = await FundProxy.findSimple({});
  let requestList = [];
  funds.forEach(function (item) {
    // 近两年数据
    requestList.push(fundUtil.getRecentNetValue(item.code, 260));
  });
  const fetchData = await Promise.all(requestList);
  let optionList = [];
  fetchData.forEach(function (item, index) {
    optionList.push(FundProxy.updateByCode(funds[index].code, {
      recent_net_value: JSON.stringify({data: item})
    }));
  });
  return Promise.all(optionList);
};

// 添加涨跌数据，在执行这个之前要保证fund中的数据是最新的
exports.addRecentNetValue = async function () {
  const funds = await FundProxy.find({});
  for (let k = 0; k < funds.length; k++) {
    const fund = funds[k];
    let recentNetValue = [];
    let newData = {};
    // 检查是否存在
    if (fund['recent_net_value']) {
      recentNetValue = JSON.parse(fund['recent_net_value']).data;
      // 检查是否添加过
      if (moment(recentNetValue[0].net_value_date).isSame(fund['net_value_date'], 'day')) {
        continue;
      }
      // 拿最新净值和前一天净值对比，计算增长率
      newData.valuation_rate = numberUtil.countRate(fund['net_value'] - recentNetValue[0].net_value, recentNetValue[0].net_value);
    } else {
      newData.valuation_rate = 0;
    }
    newData.net_value = fund['net_value'];
    newData.net_value_date = moment(fund['net_value_date']).format('YYYY-MM-DD');
    // 添加数据
    recentNetValue.unshift(newData);
    // 超过260天数据就截掉
    if (recentNetValue.length > 260) {
      recentNetValue = recentNetValue.slice(0, 260)
    }
    await FundProxy.updateByCode(funds[k].code, {
      recent_net_value: JSON.stringify({data: recentNetValue})
    });
  }
};

// 更新基本信息
exports.updateBaseInfo = async function () {
  // 得到基金，有的才更新
  const funds = await FundProxy.findSimple({});
  // 得到基金信息
  const fundsInfo = await fundUtil.getFundsInfo();
  const fundInfos = fundsInfo.funds;
  let optionList = [];
  for (let k = 0; k < funds.length; k++) {
    const temp = funds[k];
    for (let i = 0; i < fundInfos.length; i++) {
      const info = fundInfos[i];
      if (temp.code === info.code) {
        optionList.push(FundProxy.updateByCode(temp.code, {
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

exports.getFundAnalyzeRecent = function (fund) {
  const list = JSON.parse(fund['recent_net_value']).data.slice(0, 260);
  // 获取估值
  const valuationInfo = analyzeUtil.getBetterValuation(fund);
  /**
   * 客观统计数据
   */
    // 目前估值
  const valuation = valuationInfo.valuation;
  // 当日幅度
  const valuationRate = numberUtil.countRate((valuation - fund['net_value']), fund['net_value']);
  // 涨跌统计
  const upAndDownCount = analyzeUtil.getUpAndDownCount(list);
  // 最大统计
  const maxUpAndDown = analyzeUtil.getMaxUpAndDown(list);
  // 涨跌分布
  const upAndDownDistribution = analyzeUtil.getUpAndDownDistribution(list);
  // 连续性分布
  const maxUpIntervalAndMaxDownInterval = analyzeUtil.getMaxUpIntervalAndMaxDownInterval(list);
  // 净值分布
  const netValueDistribution = analyzeUtil.getNetValueDistribution(list);
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
  // 从涨跌分布上看上涨的概率
  let distribution = 0;
  upAndDownDistribution.list.forEach(function (item) {
    if (item.start <= valuationRate && valuationRate < item.end) {
      distribution = numberUtil.countRate(
        valuationRate < 0 ? (1 - item.continues.times / item.times) : (item.continues.times / item.times),
        1);
    }
  });

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
      isWeekSlump: slumpInfo.weekCount > 6,
      isBoom: -slumpInfo.count > 10,
      isWeekBoom: -slumpInfo.weekCount > 4,
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
        if (strategy[k].rule.indexOf('isSlump') === -1 || strategy[k].rule.indexOf('isWeekSlump')) {
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

// 回归测试
exports.regressionTest = async function () {
  const funds = await FundProxy.find({});
  let result = [];
  funds.forEach(function (fund) {
    const list = JSON.parse(fund['recent_net_value']).data;
    // 数据大于60天
    if (list.length > 285) {
      for (let i = 260; i > 25; i--) {
        const day = i;
        const valuation = list[day]['net_value'];
        const slumpInfo = analyzeUtil.judgeSlump2(valuation, list, day);
        if (slumpInfo.count > 20) {
          const tempRate = analyzeUtil.countIncome(valuation, list, day);
          result.push({
            count: slumpInfo.count,
            tempRate
          });
        }
      }
    }
  });
  return redisClient.setAsync('regressionSlump', JSON.stringify(result));
};

exports.getRegressionSlump = async function () {
  return redisClient.getAsync('regressionSlump');
};

