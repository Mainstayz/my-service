/**
 * Created by xiaobxia on 2018/3/6.
 */
const moment = require('moment');
const Proxy = require('../proxy');
const fundUtil = require('../util/fundInfo');

const FundProxy = Proxy.Fund;
const DictionariesProxy = Proxy.Dictionaries;
const OpeningAuditProxy = Proxy.OpeningAudit;

/**
 * 添加定时任务
 */
exports.addSchedule = async function (key, describe, value) {
  const schedule = await DictionariesProxy.check({key});
  if (schedule) {
    throw new Error('定时任务已存在');
  }
  return DictionariesProxy.newAndSave({
    key,
    describe,
    type: 'schedule',
    //默认关闭
    value
  });
};

/**
 * 删除定时任务
 */
exports.deleteSchedule = async function (key) {
  const schedule = await DictionariesProxy.check({key});
  if (!schedule) {
    throw new Error('定时任务不存在');
  }
  return DictionariesProxy.delete({key});
};

/**
 * 更新定时任务
 */
exports.updateSchedule = async function (key, describe, value) {
  const schedule = await DictionariesProxy.check({key});
  if (!schedule) {
    throw new Error('定时任务不存在');
  }
  return DictionariesProxy.update({key}, {describe, value});
};

/**
 * 获取定时任务
 */
exports.getSchedulesByPaging = async function (query, paging) {
  const opt = {
    skip: paging.start,
    limit: paging.offset,
    sort: '-create_at'
  };
  const queryOption = {type: 'schedule'};
  const data = await Promise.all([DictionariesProxy.findBase(queryOption, opt), DictionariesProxy.count(queryOption)]);
  return {list: data[0], count: data[1]};
};




exports.verifyOpening = async function () {
  const nowDay = moment().format('YYYY-MM-DD');
  const fundData = await fundUtil.getFundsInfo();
  // 如果相同就说明开盘了
  const isToday = nowDay === fundData.valuation_date;
  const record = await OpeningAuditProxy.findOne({now_date: nowDay});
  if (record) {
    // 已经记录开盘了
    if (record.opening === true) {
      return 'over';
    }
    await OpeningAuditProxy.update(nowDay, isToday);
  } else {
    await OpeningAuditProxy.newAndSave({
      now_date: nowDay,
      opening: isToday,
    });
  }
  // 估值日期就是今天
  return isToday;
};


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
