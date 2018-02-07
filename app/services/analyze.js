/**
 * Created by xiaobxia on 2018/2/2.
 */
const moment = require('moment');
const Proxy = require('../proxy');
const fundUtil = require('../util/fund');
const logger = require('../common/logger');

const FundProxy = Proxy.Fund;
const FundAnalyzeProxy = Proxy.FundAnalyze;

// 分析前，需要确定表中有数据了
exports.updateValuation = async function () {
  // 只更新表中已经有的
  const funds = await FundAnalyzeProxy.find({});
  const fetchList = Promise.all([
    fundUtil.getFundsInfo(),
    fundUtil.getFundsInfoHaomai(),
    // 估值时间以招商白酒为基准
    fundUtil.getFundInfo('161725')
  ]);
  const fetchData = await fetchList;
  logger.warn('request end');
  const tiantianData = fetchData[0];
  const haomaiData = fetchData[1];
  // 估值时间
  const valuationDate = fetchData[2].gztime;
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
        updateList.push(FundAnalyzeProxy.updateByCode(funds[k].code, {
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

exports.getFundAnalyzesBase = async function (query) {
  return FundAnalyzeProxy.findBase(query || {});
};

exports.getFundAnalyzeByIds = async function (ids) {
  return FundAnalyzeProxy.find({_id: {$in: ids}});
};

// 记录最新一次的估值哪个更准
exports.betterValuation = async function () {
  const funds = await FundAnalyzeProxy.find({});
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
    const fundTemp = await FundProxy.getByCode(fund.code);
    // 验证估值和净值是不是同一天
    if (!moment(fund['valuation_date']).isSame(fundTemp['net_value_date'], 'day')) {
      continue;
    }
    // 相同的时候也取天天
    if (Math.abs(fund['valuation_tiantian'] - fundTemp['net_value']) > Math.abs(fund['valuation_haomai'] - fundTemp['net_value'])) {
      type = 'haomai';
    } else {
      type = 'tiantian';
    }
    // 添加数据
    betterCount.unshift({
      type,
      date: fundTemp['net_value_date']
    });
    // 超过15天数据就截掉
    if (betterCount.length > 15) {
      betterCount = betterCount.slice(0, 15)
    }
    // 更新数据
    await FundAnalyzeProxy.updateByCode(funds[k].code, {
      better_count: JSON.stringify({
        data: betterCount
      })
    })
  }
};

// 产生近期涨跌数据，一般只有第一次产生数据时用
exports.updateRecentNetValue = async function () {
  const funds = await FundAnalyzeProxy.find({});
  for (let k = 0; k < funds.length; k++) {
    // 近一年的数据
    const data = await fundUtil.getRecentNetValue(funds[k].code, 260);
    // 直接覆盖不验证，因为这个只在地产次造数据时候用
    await FundAnalyzeProxy.updateByCode(funds[k].code, {
      recent_net_value: JSON.stringify({data})
    })
  }
};

// 添加近期涨跌数据，在执行这个之前要保证fund中的数据是最新的
exports.addRecentNetValue = async function () {
  const funds = await FundAnalyzeProxy.find({});
  for (let k = 0; k < funds.length; k++) {
    const fund = funds[k];
    let recentNetValue = [];
    const fundTemp = await FundProxy.getByCode(fund.code);
    let newData = {};
    // 检查是否存在
    if (fund['recent_net_value']) {
      recentNetValue = JSON.parse(fund['recent_net_value']).data;
      // 检查是否添加过
      if (moment(recentNetValue[0].FSRQ).isSame(fundTemp['net_value_date'], 'day')) {
        break;
      }
      newData.JZZZL = parseInt(((fundTemp['net_value'] / recentNetValue[0].DWJZ) - 1) * 10000) / 100
    } else {
      newData.JZZZL = 0;
    }
    newData.DWJZ = fundTemp['net_value'];
    newData.FSRQ = moment(fundTemp['net_value_date']).format('YYYY-MM-DD');
    // 添加数据
    recentNetValue.unshift(newData);
    // 超过260天数据就截掉
    if (recentNetValue.length > 260) {
      recentNetValue = recentNetValue.slice(0, 260)
    }
    await FundAnalyzeProxy.updateByCode(funds[k].code, {
      recent_net_value: JSON.stringify({data: recentNetValue})
    });
  }
};

// 更新基本信息
exports.updateBaseInfo = async function () {
  // 得到基金，有的才更新
  const funds = await FundProxy.find({});
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
          net_value_date: fundsInfo.netValueDate,
          sell: info.sell,
        }));
        break;
      }
    }
  }
  return Promise.all(optionList);
};
