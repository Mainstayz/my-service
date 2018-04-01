/**
 * Created by xiaobxia on 2018/2/2.
 */
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
