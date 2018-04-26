/**
 * Created by xiaobxia on 2018/2/2.
 */
const util = require('../util');

const numberUtil = util.numberUtil;
const analyzeUtil = util.analyzeUtil;
const fundBaseUtil = util.fundBaseUtil;


exports.getFundAnalyzeRecent = function (fund, analyzeValue, hasNetValueList) {
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
  const netValueSortHalfMonth = analyzeUtil.getNetValueSort(list.slice(0, 10));
  const netValueSortMonth = analyzeUtil.getNetValueSort(list.slice(0, 20));
  const costLine = analyzeUtil.getCostLine(netValueSort);
  const costLineHalf = analyzeUtil.getCostLine(netValueSortHalfYear);
  // 近几天的暴跌信息， 包括了当天的
  const recentInfo = analyzeUtil.getMaxRiseAndFallInfo(valuation, list);
  // 点位信息
  const positionInfo = analyzeUtil.getPositionInfo(valuation, netValueSortMonth);
  const positionInfoHalf = analyzeUtil.getPositionInfo(valuation, netValueSortHalfMonth);
  const rate = 0.2;
  let data = {
    valuationRate,
    ...recentInfo,
    result: {
      isMin: valuation < netValueSort[0],
      isLow: valuation < positionInfo.lowLine || positionInfo.valuationIndex < 20 * rate,
      isLowHalf: valuation < positionInfoHalf.lowLine || positionInfoHalf.valuationIndex < 10 * rate,
      isHigh: valuation > positionInfo.highLine || positionInfo.valuationIndex > 20 * (1 - rate),
      isHighHalf: valuation > positionInfoHalf.highLine || positionInfoHalf.valuationIndex > 10 * (1 - rate),
      // 是否暴跌
      isMonthSlump: recentInfo.monthMin < (analyzeValue.monthSlumpValue || -8),
      isHalfMonthSlump: recentInfo.halfMonthMin < (analyzeValue.halfMonthSlumpValue || -4),
      isMonthBoom: recentInfo.monthMax > (analyzeValue.monthBoomValue || 8),
      isHalfMonthBoom: recentInfo.halfMonthMax > (analyzeValue.halfMonthBoomValue || 4),
      costLine,
      costLineHalf
    }
  };
  if (hasNetValueList) {
    data.recentNetValue = list;
  }
  return data;
};

exports.getFundMaxMinDistribution = function (fund) {
  const list = JSON.parse(fund['recent_net_value']).data;
  // 近几天的暴跌信息， 包括了当天的
  let max = [];
  let min = [];
  let halfMax = [];
  let halfMin = [];
  for (let i = 0; i < list.length - 22; i++) {
    const recentInfo = analyzeUtil.getMaxRiseAndFallInfo(list[i]['net_value'], list.slice(i, i + 22));
    max.push(recentInfo.monthMax);
    min.push(recentInfo.monthMin);
    halfMax.push(recentInfo.halfMonthMax);
    halfMin.push(recentInfo.halfMonthMin);
  }
  return {
    halfMax,
    halfMin,
    min,
    max
  }
};

