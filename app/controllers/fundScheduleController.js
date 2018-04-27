/**
 * Created by xiaobxia on 2018/4/1.
 */

// 更新基本信息
exports.updateBaseInfo = async function (ctx) {
  try {
    // 主要是为了更新单位净值
    await ctx.services.fund.updateBaseInfo();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 更新估值
exports.updateValuation = async function (ctx) {
  try {
    await ctx.services.fund.updateValuation();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

//计算涨幅
exports.updateRise = async function (ctx) {
  try {
    await ctx.services.fund.updateRise();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 统计估值准确
exports.betterValuation = async function (ctx) {
  try {
    // 主要是为了更新单位净值
    await ctx.services.fund.betterValuation();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 添加新的涨跌数据
exports.addRecentNetValue = async function (ctx) {
  try {
    await ctx.services.fund.addRecentNetValue();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 获取净值涨跌数据
exports.updateRecentNetValue = async function (ctx) {
  try {
    await ctx.services.fund.updateRecentNetValue();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

//开市记录
exports.verifyOpening = async function (ctx) {
  try {
    const isOpening = await ctx.services.fund.verifyOpening();
    ctx.body = ctx.resuccess({
      isOpening
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 更新低费率基金
exports.updateLowRateFund = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  try {
    const codes = JSON.parse(query.codes);
    await fundService.updateLowRateFund(codes);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

/**
 * 删除不在售基金
 */
exports.deleteUnSellFund = async function (ctx) {
  try {
    await ctx.services.fund.deleteUnSellFund();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 删除高费率基金
exports.deleteHighRateFund = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  try {
    const codes = JSON.parse(query.codes);
    await fundService.deleteHighRateFund(codes);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

