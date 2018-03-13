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

// 获取近期分析数据
exports.getFundAnalyzeRecent = async function (ctx) {
  const query = ctx.query;
  const fundService = ctx.services.fund;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    const fund = await fundService.getFundByCode(data.code);
    if (fund && fund['recent_net_value']) {
      ctx.body = ctx.resuccess(
        ctx.services.analyze.getFundAnalyzeRecent(fund)
      );
    } else {
      ctx.body = ctx.refail({
        message: '暂无数据分析'
      });
    }
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 更新低费率基金
exports.updateLowRateFund = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  try {
    const funds = JSON.parse(query.funds);
    funds.forEach(function (code) {
      fundService.updateFundByCode(code, {lowRate: true});
    });
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.regressionTest = async function (ctx) {
  try {
    await ctx.services.analyze.regressionTest();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};


exports.getRegressionSlump = async function (ctx) {
  try {
    const result = await ctx.services.analyze.getRegressionSlump();
    ctx.body = ctx.resuccess({
      result: JSON.parse(result)
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
