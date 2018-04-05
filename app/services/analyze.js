/**
 * Created by xiaobxia on 2018/2/2.
 */
const moment = require('moment');
const Proxy = require('../proxy');
const util = require('../util');
const logger = require('../common/logger');

const FundProxy = Proxy.Fund;
const numberUtil = util.numberUtil;
const analyzeUtil = util.analyzeUtil;
const fundBaseUtil = util.fundBaseUtil;


exports.getFundAnalyzeRecent = function (fund) {
  console.log(fund.code)
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
    // 从小到大排序，并记录次数
  const netValueSort = analyzeUtil.getNetValueSort(list);
  const netValueSortHalfYear = analyzeUtil.getNetValueSort(list.slice(0, 130));
  const costLine = analyzeUtil.getCostLine(netValueSort);
  const costLineHalf = analyzeUtil.getCostLine(netValueSortHalfYear);
  // 近几天的暴跌信息， 包括了当天的
  const recentInfo = analyzeUtil.getMaxRiseAndFallInfo(valuation, list);
  // 点位信息
  const positionInfo = analyzeUtil.getPositionInfo(valuation, netValueSort);
  const positionInfoHalf = analyzeUtil.getPositionInfo(valuation, netValueSortHalfYear);

  return {
    recentNetValue: list,
    valuationRate,
    ...recentInfo,
    result: {
      isMin: valuation < netValueSort[0],
      isLow: valuation < positionInfo.lowLine || positionInfo.valuationIndex < 260*0.2,
      isLowHalf: valuation < positionInfoHalf.lowLine || positionInfoHalf.valuationIndex < 260*0.2,
      isHigh: valuation > positionInfo.highLine|| positionInfo.valuationIndex > 260*0.8,
      isHighHalf: valuation > positionInfoHalf.highLine|| positionInfoHalf.valuationIndex > 260*0.8,
      // 是否暴跌
      isMonthSlump: recentInfo.monthMin < -10,
      isHalfMonthSlump: recentInfo.halfMonthMin < -5,
      isMonthBoom: recentInfo.monthMax > 10,
      isHalfMonthBoom: recentInfo.halfMonthMax > 5,
      costLine,
      costLineHalf
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


