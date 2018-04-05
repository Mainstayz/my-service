/**
 * Created by xiaobxia on 2018/1/29.
 */
const numberUtil = require('./number');

// 把净值从小到大排序
exports.getNetValueSort = function (netValueList) {
  let listFake = [];
  netValueList.forEach(function (item) {
    listFake.push(parseFloat(item['net_value']));
  });
  //左小右打
  listFake.sort(function (a, b) {
    return a - b;
  });
  return listFake;
};

//判断暴跌，近一月最大涨跌幅，近半月最大涨跌幅
exports.getMaxRiseAndFallInfo = function (valuation, netValueList) {
  let listMonth = [];
  let listMonthTemp = [];
  let listHalfMonth = [];
  for (let i = 0; i < netValueList.length; i++) {
    //一个月
    if (i < 20) {
      const rate = numberUtil.countDifferenceRate(valuation, netValueList[i]['net_value']);
      listMonth.push(rate);
      listMonthTemp.push(rate);
      //半个月
      if (i < 10) {
        listHalfMonth.push(rate);
      }
    } else {
      break;
    }
  }
  //小->大
  listHalfMonth.sort(function (a, b) {
    return a - b;
  });
  listMonth.sort(function (a, b) {
    return a - b;
  });
  return {
    listMonth: listMonthTemp,
    halfMonthMax: listHalfMonth[listHalfMonth.length - 1],
    halfMonthMin: listHalfMonth[0],
    monthMax: listMonth[listMonth.length - 1],
    monthMin: listMonth[0],
  }
};

// 判断当前点位所处的位置
exports.getPositionInfo = function (valuation, netValueSort) {
  // netValueSort是已经被处理过的
  let valuationIndex = netValueSort.length;
  // 计算当前净值处于的位置
  for (let i = 0; i < netValueSort.length; i++) {
    if (valuation > netValueSort[i]) {
      valuationIndex = i;
      break;
    }
  }
  // 幅度的位置
  const rate = 0.1;
  const range = netValueSort[netValueSort.length - 1].netValue - netValueSort[0].netValue;
  const step = rate * range;
  const lowLine = numberUtil.keepFourDecimals(netValueSort[0].netValue + step);
  const highLine = numberUtil.keepFourDecimals(netValueSort[netValueSort.length - 1].netValue - step);
  return {
    valuationIndex,
    lowLine,
    highLine
  };
};

//获取平均成本线
exports.getCostLine = function (netValueList) {
  let value = 0;
  netValueList.forEach(function (item) {
    value += item;
  });
  return numberUtil.keepFourDecimals(value / (netValueList.length));
};
