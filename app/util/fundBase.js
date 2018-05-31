/**
 * Created by xiaobxia on 2018/3/31.
 */
const numberUtil = require('./number');

/**
 * 通过估值源准确性统计，获取更好的估值源
 */
exports.getBetterValuation = function (fund) {
  let valuationInfo = null;
  // 如果有统计
  if (fund['better_count']) {
    const betterCount = JSON.parse(fund['better_count']).data;
    let haomaiCount = 0;
    let tiantianCount = 0;
    const totalCount = betterCount.length;
    const standard = (totalCount * 2) / 3;
    //统计
    betterCount.forEach(function (item) {
      if (item.type === 'tiantian') {
        tiantianCount++;
      } else {
        haomaiCount++;
      }
    });
    // 超过3分之2
    if (haomaiCount >= standard) {
      valuationInfo = {
        sourceType: 'haomai',
        sourceName: '好买',
        valuation: fund[`valuation_haomai`]
      };
    } else if (tiantianCount >= standard) {
      valuationInfo = {
        sourceType: 'tiantian',
        sourceName: '天天',
        valuation: fund[`valuation_tiantian`]
      };
    } else {
      valuationInfo = {
        sourceType: 'tiantian/haomai',
        sourceName: '天天/好买',
        valuation: numberUtil.keepFourDecimals((fund[`valuation_tiantian`] + fund[`valuation_haomai`]) / 2)
      };
    }
  } else {
    valuationInfo = {
      sourceType: 'tiantian',
      sourceName: '天天',
      valuation: fund[`valuation_tiantian`]
    };
  }
  return valuationInfo;
};
