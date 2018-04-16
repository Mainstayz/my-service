/**
 * Created by xiaobxia on 2018/2/2.
 */
const util = require('../util');

const numberUtil = util.numberUtil;
const analyzeUtil = util.analyzeUtil;
const fundBaseUtil = util.fundBaseUtil;


exports.getFundAnalyzeRecent = function (fund, hasNetValueList) {
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
  const rate = 0.05;
  let data = {
    valuationRate,
    ...recentInfo,
    result: {
      isMin: valuation < netValueSort[0],
      isLow: valuation < positionInfo.lowLine || positionInfo.valuationIndex < 260 * rate,
      isLowHalf: valuation < positionInfoHalf.lowLine || positionInfoHalf.valuationIndex < 130 * rate,
      isHigh: valuation > positionInfo.highLine || positionInfo.valuationIndex > 260 * (1 - rate),
      isHighHalf: valuation > positionInfoHalf.highLine || positionInfoHalf.valuationIndex > 130 * (1 - rate),
      // 是否暴跌
      isMonthSlump: recentInfo.monthMin < -7,
      isHalfMonthSlump: recentInfo.halfMonthMin < -3,
      isMonthBoom: recentInfo.monthMax > 7,
      isHalfMonthBoom: recentInfo.halfMonthMax > 3,
      costLine,
      costLineHalf
    }
  };
  if (hasNetValueList) {
    data.recentNetValue = list;
  }
  return data;
};


