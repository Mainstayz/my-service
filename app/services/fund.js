/**
 * Created by xiaobxia on 2018/1/26.
 */
const Proxy = require('../proxy');
const fundWebDataUtil = require('../util/fundWebData');
const localConst = require('../const');
const moment = require('moment');
const util = require('../util');

const numberUtil = util.numberUtil;
const fundBaseUtil = util.fundBaseUtil;
const keepTwoDecimals = numberUtil.keepTwoDecimals;
const countRate = numberUtil.countRate;
const countDifferenceRate = numberUtil.countDifferenceRate;

const FundProxy = Proxy.Fund;
const UserFundProxy = Proxy.UserFund;
const FocusFundProxy = Proxy.FocusFund;
const OptionalFundProxy = Proxy.OptionalFund;
const DictionariesProxy = Proxy.Dictionaries;


/**
 * 添加基金
 */
exports.addFundByCode = async function (code) {
  //检验是否存在
  let fund = await FundProxy.check({code});
  if (fund) {
    return fund;
  }
  //获取网络数据
  const fetchData = await Promise.all([
    fundWebDataUtil.getFundInfo(code),
    fundWebDataUtil.getRecentNetValue(code, localConst.RECENT_NET_VALUE_DAYS)
  ]);
  // 基本数据
  const data = fetchData[0];
  // 近一年的涨跌数据
  const dataRecent = fetchData[1];
  // 添加数据
  return FundProxy.newAndSave({
    code: data.code,
    name: data.name,
    net_value: data.net_value,
    net_value_date: data.net_value_date,
    sell: true,
    valuation_tiantian: data.valuation,
    valuation_date: data.valuation_date,
    recent_net_value: JSON.stringify({data: dataRecent})
  })
};

/**
 * 删除基金
 */
exports.deleteFundByCode = async function (code) {
  //检查是否被占用
  const queryList = await Promise.all([
    OptionalFundProxy.find({code}),
    FocusFundProxy.find({code}),
    UserFundProxy.find({code})
  ]);
  for (let i = 0; i < queryList.length; i++) {
    if (queryList[i].length !== 0) {
      throw new Error('基金已被使用，无法删除');
    }
  }
  //检查是否存在
  const fund = await FundProxy.check({code});
  if (!fund) {
    throw new Error('基金不存在');
  }
  //删除
  return FundProxy.delete({code})
};

/**
 * 获取基金基本信息
 */
exports.getFundBaseByCode = async function (code) {
  return FundProxy.findOneBase({code});
};

/**
 * 获取基金所有信息
 */
exports.getFundByCode = async function (code) {
  return FundProxy.findOne({code});
};


/**
 * 分页获取基金基本信息
 */
exports.getFundsBaseByPaging = async function (query, paging) {
  const opt = {
    skip: paging.start,
    limit: paging.offset,
    sort: '-create_at'
  };
  let queryOption = {};
  if (query.keyword) {
    const keyExp = new RegExp(query.keyword, 'i');
    queryOption = {
      $or: [
        {code: keyExp},
        {name: keyExp}]
    }
  }
  const data = await Promise.all([FundProxy.findBase(queryOption, opt), FundProxy.count(queryOption)]);
  return {list: data[0], count: data[1]};
};


/**
 * 批量添加基金，要提前验证code
 * @param codeList
 * @returns {Promise.<*>}
 */
exports.addFunds = async function (codeList) {
  // 获取基金信息
  let requestList = [
    fundWebDataUtil.getFundsInfo()
  ];
  // 获取基金近期信息
  codeList.forEach(function (item) {
    requestList.push(fundWebDataUtil.getRecentNetValue(item, localConst.RECENT_NET_VALUE_DAYS));
  });
  const fetchData = await Promise.all(requestList);
  // 基本数据
  const data = fetchData[0];
  const dataFunds = data.funds;
  let optionList = [];
  codeList.forEach(function (item, index) {
    let fundData = {};
    // 找到匹配的数据
    for (let k = 0; k < dataFunds.length; k++) {
      if (dataFunds[k].code === item) {
        fundData = dataFunds[k];
        break;
      }
    }
    optionList.push(FundProxy.newAndSave({
      code: fundData.code,
      name: fundData.name,
      net_value: fundData.net_value,
      net_value_date: data.net_value_date,
      valuation_tiantian: fundData.valuation,
      valuation_date: data.valuation_date,
      sell: fundData.sell,
      recent_net_value: JSON.stringify({data: fetchData[index + 1]})
    }));
  });
  return Promise.all(optionList);
};

/**
 * 导入基金
 * @param funds
 * @returns {Promise}
 */
exports.importFunds = async function (funds) {
  const fundsTemp = await FundProxy.findBase({});
  let codeList = [];
  // 把没导入过的导入
  funds.forEach(function (item) {
    let has = false;
    for (let k = 0; k < fundsTemp.length; k++) {
      if (fundsTemp[k].code === item.code) {
        has = true;
        break;
      }
    }
    if (!has) {
      codeList.push(item.code);
    }
  });
  return this.addFunds(codeList);
};

/**
 * 验证开市
 * @returns {Promise.<*>}
 */
exports.verifyOpening = async function () {
  const nowDay = moment().format('YYYY-MM-DD');
  const fundData = await fundWebDataUtil.getFundsInfo();
  // 如果相同就说明开盘了
  const isToday = nowDay === fundData.valuation_date;
  let result = await DictionariesProxy.findOne({key: localConst.OPENING_RECORDS_REDIS_KEY});
  let records = [];
  //如果有记录
  if (result) {
    records = JSON.parse(result.value);
    // 没开市，就不会有记录
    if (records[0] === nowDay) {
      return 'over';
    } else {
      //是，就加记录
      if (isToday) {
        records.unshift(nowDay);
      }
    }
  } else {
    //是，就加记录
    if (isToday) {
      records = [nowDay];
    }
  }
  records = records.slice(0, 260);
  await DictionariesProxy.update({key: localConst.OPENING_RECORDS_REDIS_KEY}, {
    value: JSON.stringify(records)
  });
  return isToday;
};


/**
 * 更新估值
 * @returns {Promise.<*>}
 */
exports.updateValuation = async function () {
  // 获取基金
  const funds = await FundProxy.findBase({});
  // 抓取数据
  const fetchList = Promise.all([
    fundWebDataUtil.getFundsInfo(),
    fundWebDataUtil.getFundsInfoHaomai(),
    // 估值时间以招商白酒为基准
    fundWebDataUtil.getFundInfo('161725')
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
        updateList.push(FundProxy.update({code: funds[k].code}, {
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

/**
 * 更新涨幅
 * @returns {Promise.<*>}
 */
exports.updateRate = async function () {
  const funds = await FundProxy.findBase({});
  let updateList = [];
  for (let k = 0; k < funds.length; k++) {
    const fund = funds[k];
    // 获取估值
    const valuationInfo = fundBaseUtil.getBetterValuation(fund);
    // 目前估值
    const valuation = valuationInfo.valuation;
    // 当日幅度
    const valuationRate = countRate((valuation - fund['net_value']), fund['net_value']);
    // 更新数据
    updateList.push(FundProxy.update({code: fund.code}, {
      rate: valuationRate
    }));
  }
  return Promise.all(updateList);
};

/**
 * 更新估值准确记录
 * @returns {Promise.<*>}
 */
exports.betterValuation = async function () {
  const funds = await FundProxy.findBase({});
  let updateList = [];
  for (let k = 0; k < funds.length; k++) {
    const fund = funds[k];
    let betterCount = [];
    //如果有之前的记录
    if (fund['better_count']) {
      betterCount = JSON.parse(fund['better_count']).data;
      // 如果当天的被添加过了，那就跳过
      if (moment(fund['valuation_date']).isSame(betterCount[0].date, 'day')) {
        continue;
      }
    }
    let type = '';
    // 估值和净值是不是同一天，那就跳过
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
    updateList.push(FundProxy.update({code: fund.code}, {
      better_count: JSON.stringify({
        data: betterCount
      })
    }));
  }
  return Promise.all(updateList);
};

/**
 * 一般只有第一次产生数据时用
 * 产生所有的近期涨跌数据
 * @returns {Promise.<*>}
 */
exports.updateRecentNetValue = async function () {
  const funds = await FundProxy.find({});
  let requestList = [];
  funds.forEach(function (fund) {
    requestList.push(fundWebDataUtil.getRecentNetValue(fund.code, localConst.RECENT_NET_VALUE_DAYS).then((item) => {
      return FundProxy.update({code: fund.code}, {
        recent_net_value: JSON.stringify({data: item})
      })
    }));
  });
  return Promise.all(requestList);
};

/**
 * 添加涨跌数据，在执行这个之前要保证fund中的数据是最新的
 * @returns {Promise.<void>}
 */
exports.addRecentNetValue = async function () {
  const funds = await FundProxy.find({});
  for (let k = 0; k < funds.length; k++) {
    const fund = funds[k];
    let recentNetValue = [];
    let newData = {};
    // 如果有记录
    if (fund['recent_net_value']) {
      recentNetValue = fundBaseUtil.getNetValueList(fund);
      // 添加过那就跳过
      if (moment(recentNetValue[0]['net_value_date']).isSame(fund['net_value_date'], 'day')) {
        continue;
      }
      // 拿最新净值和前一天净值对比，计算增长率
      newData.valuation_rate = countRate(fund['net_value'] - recentNetValue[0].net_value, recentNetValue[0].net_value);
    } else {
      newData.valuation_rate = 0;
    }
    newData.net_value = fund['net_value'];
    newData['net_value_date'] = moment(fund['net_value_date']).format('YYYY-MM-DD');
    // 添加数据
    recentNetValue.unshift(newData);
    // 超过260天数据就截掉
    if (recentNetValue.length > localConst.RECENT_NET_VALUE_DAYS) {
      recentNetValue = recentNetValue.slice(0, localConst.RECENT_NET_VALUE_DAYS)
    }
    await FundProxy.update({code: funds[k].code}, {
      recent_net_value: JSON.stringify({data: recentNetValue})
    });
  }
};

/**
 * 更新基金的基本信息
 * @returns {Promise.<*>}
 */
exports.updateBaseInfo = async function () {
  // 得到基金，有的才更新
  const funds = await FundProxy.findBase({});
  // 得到基金信息
  const fundsInfo = await fundWebDataUtil.getFundsInfo();
  const fundInfos = fundsInfo.funds;
  let optionList = [];
  for (let k = 0; k < funds.length; k++) {
    const temp = funds[k];
    for (let i = 0; i < fundInfos.length; i++) {
      const info = fundInfos[i];
      if (temp.code === info.code) {
        optionList.push(FundProxy.update({code: temp.code}, {
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

/**
 * 删除不在售的基金
 * @returns {Promise.<*>}
 */
exports.deleteUnSellFund = async function () {
  //获取不售的
  const funds = await FundProxy.findBase({sell: false});
  let optionList = [];
  for (let i = 0; i < funds.length; i++) {
    const id = funds[i]._id;
    const queryList = await Promise.all([
      OptionalFundProxy.findOne({fund: id}),
      FocusFundProxy.findOne({fund: id}),
      UserFundProxy.findOne({fund: id})
    ]);
    let use = false;
    for (let i = 0; i < queryList.length; i++) {
      if (queryList[i]) {
        use = true;
      }
    }
    if (!use) {
      optionList.push(FundProxy.delete({code}));
    }
  }
  return Promise.all(optionList);
};

/**
 * 更新基金是不是低费率的标记
 * @param codes
 * @returns {Promise.<*>}
 */
exports.updateLowRateFund = async function (codes) {
  const funds = await FundProxy.findBase({});
  let optionList = [];
  funds.forEach((fund) => {
    if (codes.indexOf(fund.code) === -1) {
      optionList.push(FundProxy.update({code: fund.code}, {
        lowRate: false
      }));
    } else {
      optionList.push(FundProxy.update({code: fund.code}, {
        lowRate: true
      }));
    }
  });
  return Promise.all(optionList);
};

/**
 * 删除不是低费率的基金
 * @param codes
 * @returns {Promise.<*>}
 */
exports.deleteHighRateFund = async function (codes) {
  //传进来的都是低和中等费率的
  const funds = await FundProxy.findBase({});
  let optionList = [];
  for (let i = 0; i < funds.length; i++) {
    const code = funds[i].code;
    //不是低和中等费率的
    if (codes.indexOf(code) === -1) {
      const queryList = await Promise.all([
        OptionalFundProxy.find({code}),
        FocusFundProxy.find({code}),
        UserFundProxy.find({code})
      ]);
      let use = false;
      for (let i = 0; i < queryList.length; i++) {
        if (queryList[i].length !== 0) {
          use = true;
        }
      }
      if (!use) {
        optionList.push(FundProxy.delete({code}));
      }
    }
  }
  return Promise.all(optionList);
};

/**
 * 获取基金当天涨跌幅排名
 * @param sort
 * @param paging
 * @returns {Promise.<{list: *, count: *}>}
 */
exports.getMarket = async function (sort, paging, lowRate) {
  const opt = {
    skip: paging.start,
    limit: paging.offset,
    sort: sort === 'up' ? '-rate' : 'rate'
  };
  let queryOption = lowRate ? {lowRate: true} : {};
  const data = await Promise.all([
    FundProxy.findBase(queryOption, opt),
    FundProxy.count(queryOption)
  ]);
  return {list: data[0], count: data[1]};
};

/**
 * 获取市场涨跌统计信息
 * @returns {Promise.<{rate, upCount: number, downCount: number, upAverage, downAverage, distribution: {>3: number, 2~3: number, 1~2: number, 0~1: number, -1~0: number, -2~-1: number, -3~-2: number, <-3: number}}>}
 */
exports.getMarketInfo = async function () {
  const funds = await FundProxy.findBase({});
  let allRate = 0;
  let upCount = 0;
  let downCount = 0;
  let upAll = 0;
  let downAll = 0;
  let distribution = {
    '>3': 0,
    '2~3': 0,
    '1~2': 0,
    '0~1': 0,
    '-1~0': 0,
    '-2~-1': 0,
    '-3~-2': 0,
    '<-3': 0
  };
  for (let i = 0; i < funds.length; i++) {
    const rate = funds[i].rate || 0;
    if (rate >= 0) {
      if (rate<1) {
        distribution['0~1']++;
      }
      if (rate>=1 && rate<2) {
        distribution['1~2']++;
      }
      if (rate>=2 && rate<3) {
        distribution['2~3']++;
      }
      if (rate>=3) {
        distribution['>3']++;
      }
      upCount++;
      upAll += rate;
    } else {
      if (rate>-1) {
        distribution['-1~0']++;
      }
      if (rate<=-1 && rate>-2) {
        distribution['-2~-1']++;
      }
      if (rate<=-2 && rate>-3) {
        distribution['-3~-2']++;
      }
      if (rate<=-3) {
        distribution['<-3']++;
      }
      downCount++;
      downAll += rate;
    }
    allRate += rate;
  }
  return {
    rate: keepTwoDecimals(allRate/ funds.length),
    upCount,
    downCount,
    upAverage: keepTwoDecimals(upAll / (upCount || 1)),
    downAverage: keepTwoDecimals(downAll / (downCount || 1)),
    distribution
  };
};

/**
 * 获取一定天数内，基金的涨跌幅排名
 * @param day
 * @returns {Promise.<Array>}
 */
exports.getRank = async function (day) {
  const funds = await FundProxy.find({});
  let fundList = [];
  for (let i = 0; i < funds.length; i++) {
    let fund = funds[i];
    const list = fundBaseUtil.getNetValueList(fund);
    // 获取估值
    const valuationInfo = fundBaseUtil.getBetterValuation(fund);
    const valuation = valuationInfo.valuation;
    let lastDayIndex = list.length >= day? day : list.length;
    const lastNetValue = list[lastDayIndex - 1]['net_value'];
    fundList.push({
      name: fund.name,
      code: fund.code,
      net_value: fund.net_value,
      net_value_date: fund.net_value_date,
      sell: fund.sell,
      rate: fund.rate,
      lowRate: fund.lowRate,
      valuation_tiantian: fund.valuation_tiantian,
      valuation_haomai: fund.valuation_haomai,
      valuation_date: fund.valuation_date,
      theme: fund.theme,
      valuation,
      recentRate: countDifferenceRate(valuation, lastNetValue)
    });
  }
  fundList.sort(function (a, b) {
    return a.recentRate - b.recentRate;
  });
  return fundList;
};

/**
 * 更新基金的概念主题
 * @param code
 * @param theme
 * @returns {Promise.<void>}
 */
exports.updateFundTheme = async function (code, theme) {
  return FundProxy.update({code: code}, {
    theme: theme
  });
};

exports.getFundsByTheme = async function (theme) {
  return FundProxy.findBase({theme});
};


