/**
 * Created by xiaobxia on 2018/2/2.
 */
const moment = require('moment');
const Proxy = require('../proxy');
const util = require('../util');
const logger = require('../common/logger');

const FundProxy = Proxy.Fund;
const StrategyProxy = Proxy.Strategy;
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
  logger.info('request end');
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
    if (Math.abs(fund['valuation_tiantian'] - fund['net_value']) > Math.abs(fund['valuation_haomai'] - fundTemp['net_value'])) {
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
  const list = JSON.parse(fund['recent_net_value']).data;
  // 获取估值
  let valuationSource = {
    type: 'tiantian',
    name: '天天'
  };
  if (fund['better_count']) {
    const betterCount = JSON.parse(fund['better_count']).data;
    valuationSource = analyzeUtil.getBetterValuation(betterCount);
  }
  // 目前估值
  const valuation = fund[`valuation_${valuationSource.type}`];
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
  // 从涨跌分布上看
  let distribution = 0;
  upAndDownDistribution.list.forEach(function (item) {
    if (item.start <= valuationRate && valuationRate < item.end) {
      distribution = numberUtil.countRate(
        valuationRate < 0 ? (1 - item.continues.times / item.times) : (item.continues.times / item.times),
        1);
    }
  });
  // 从连续性上看
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
  // 近几天涨跌
  let recentRate5 = numberUtil.countDifferenceRate(valuation, list[4]['net_value']);
  let recentRate10 = numberUtil.countDifferenceRate(valuation, list[9]['net_value']);
  let recentRate15 = numberUtil.countDifferenceRate(valuation, list[14]['net_value']);
  return {
    upAndDownCount,
    maxUpAndDown,
    upAndDownDistribution,
    maxUpIntervalAndMaxDownInterval,
    netValueDistribution,
    recentSlump: [recentRate5, recentRate10, recentRate15],
    result: {
      // 都是上涨的概率
      distribution,
      internal,
      // 是否新低
      isMin: valuation < netValueDistribution[0].netValue,
      // 是否暴跌
      isSlump: recentRate5 < -6 || recentRate10 < -9 || recentRate15 < -12
    }
  };
};

exports.getStrategyList = async function () {
  const funds = await FundProxy.find({});
  let strategy = {};
  funds.forEach((item) => {
    if (item['recent_net_value']) {
      const fundAnalyzeRecent = this.getFundAnalyzeRecent(item);
      const result = fundAnalyzeRecent.result;
      strategy[item.code] = {
        times: 0,
        code: item.code,
        name: item.name,
        rule: [],
        recentSlump: fundAnalyzeRecent.recentSlump
      };
      // 从幅度分布上看
      if (result.distribution > 70) {
        strategy[item.code].times++;
        strategy[item.code].rule.push('distribution');
      }
      // 从连续上看概率
      if (result.internal > 70) {
        strategy[item.code].times++;
        strategy[item.code].rule.push('internal');
      }
      // 是否是历史新低
      if (result.isMin) {
        strategy[item.code].times++;
        strategy[item.code].rule.push('isMin');
      }
      // 是否是暴跌
      if (result.isSlump) {
        strategy[item.code].times++;
        strategy[item.code].rule.push('isSlump');
      }
    }
  });
  let strategyList = [];
  for (let k in strategy) {
    if (strategy[k].times !== 0) {
      strategyList.push(strategy[k])
    }
  }
  strategyList.sort(function (a, b) {
    return b.times - a.times;
  });
  return strategyList;
};

exports.getStrategy = async function (force) {
  const nowDay = moment().format('YYYY-MM-DD');
  let strategyList = null;
  let rawStrategy = null;
  if (force) {
    // 强制更新
    strategyList = await this.getStrategyList();
    rawStrategy = await StrategyProxy.check({
      day: nowDay
    });
  } else {
    // 不是强制
    rawStrategy = await StrategyProxy.findOne({
      day: nowDay
    });
    // 有数据
    if (rawStrategy) {
      // 验证是否超过5分钟
      if (moment(rawStrategy['update_at']).add(5, 'minute').isBefore(moment())) {
        // 重新获取
        strategyList = await this.getStrategyList();
      } else {
        return JSON.parse(rawStrategy.list)
      }
    }
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


