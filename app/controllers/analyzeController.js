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
    await ctx.services.fund.updateBaseInfo();
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

