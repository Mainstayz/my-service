/**
 * Created by xiaobxia on 2018/2/2.
 */
// 更新估值
exports.updateValuation = async function (ctx) {
  try {
    await ctx.services.analyze.updateValuation();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 更新基本信息
exports.updateBaseInfo = async function (ctx) {
  try {
    // 主要是为了更新单位净值
    await ctx.services.analyze.updateBaseInfo();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 获取净值涨跌数据
exports.updateRecentNetValue = async function (ctx) {
  try {
    await ctx.services.analyze.updateRecentNetValue();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 统计估值准确
exports.betterValuation = async function (ctx) {
  try {
    // 主要是为了更新单位净值
    await ctx.services.analyze.betterValuation();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 添加新的涨跌数据
exports.addRecentNetValue = async function (ctx) {
  try {
    await ctx.services.analyze.addRecentNetValue();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 获取基本分析数据
exports.getFundAnalyzeBase = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    let fundAnalyze = await ctx.services.analyze.getFundAnalyzeBase({code: data.code});
    // 判断是否有数据
    let haomaiCount = 0;
    let tiantianCount = 0;
    //统计
    if (fundAnalyze['better_count']) {
      const betterCount = JSON.parse(fundAnalyze['better_count']).data;
      betterCount.forEach(function (item) {
        if (item.type === 'tiantian') {
          tiantianCount++;
        } else {
          haomaiCount++;
        }
      })
    }
    let result = {
      valuation_tiantian: fundAnalyze['valuation_tiantian'],
      valuation_haomai: fundAnalyze['valuation_haomai'],
      code: fundAnalyze.code,
      valuation_date: fundAnalyze['valuation_date']
    };
    // 填充数据
    if (haomaiCount > tiantianCount) {
      result.valuationSource = '好买';
      result.valuation = fundAnalyze['valuation_haomai'];
    } else {
      result.valuationSource = '天天';
      result.valuation = fundAnalyze['valuation_tiantian'];
    }
    ctx.body = ctx.resuccess(result);
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 获取近期分析数据
exports.getFundAnalyzeRecent = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    const fund = await ctx.services.fund.getFundByCode(data.code);
    const fundAnalyze = await ctx.services.analyze.getFundAnalyzeByCode(data.code);
    if (fundAnalyze && fundAnalyze['recent_net_value']) {
      const list = JSON.parse(fundAnalyze['recent_net_value']).data;
      // 获取估值
      let haomaiCount = 0;
      let tiantianCount = 0;
      list.forEach(function (item) {
        if (item.type === 'tiantian') {
          tiantianCount++;
        } else {
          haomaiCount++;
        }
      });
      let valuation = 0;
      if (haomaiCount > tiantianCount) {
        valuation = fundAnalyze['valuation_haomai'];
      } else {
        valuation = fundAnalyze['valuation_tiantian'];
      }
      const valuationRate = 100 * (valuation - fund['net_value']) / fund['net_value'];
      const upAndDownCount = await ctx.services.analyze.getUpAndDownCount(list);
      const maxUpAndDown = await ctx.services.analyze.getMaxUpAndDown(list);
      const upAndDownDistribution = await ctx.services.analyze.getUpAndDownDistribution(list);
      const maxUpIntervalAndMaxDownInterval = await ctx.services.analyze.getMaxUpIntervalAndMaxDownInterval(list);
      // 从涨跌分布上看
      let distribution = 0;
      console.log(valuationRate)
      upAndDownDistribution.list.forEach(function (item) {
        if (item.start <= valuationRate && valuationRate < item.end) {
          distribution = parseInt(10000 * (item.continues.times / item.times)) / 100;
        }
      });
      let day = ctx.services.analyze.continueDays(valuationRate, list);
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
        if (day > key) {
          rateDays += internalData[key].times;
        }
      }
      const internal = parseInt(10000 * (rateDays / allInterDays)) / 100;
      ctx.body = ctx.resuccess({
        upAndDownCount,
        maxUpAndDown,
        upAndDownDistribution,
        maxUpIntervalAndMaxDownInterval,
        result: {
          distribution,
          internal
        }
      });
    } else {
      ctx.body = ctx.refail({
        message: '暂无数据分析'
      });
    }
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
