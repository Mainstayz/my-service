/**
 * Created by xiaobxia on 2018/2/12.
 */
exports.getStrategy = async function (ctx) {
  const query = ctx.query;
  const tokenRaw = ctx.tokenRaw;
  try {
    const data = ctx.validateData({
      sort: {type: 'string', required: true}
    }, query);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const strategy  = await ctx.services.strategy.getStrategy(userRaw._id, data.sort);
    ctx.body = ctx.resuccess({
      strategy
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

//我的基金的情况
exports.getMyStrategy = async function (ctx) {
  const tokenRaw = ctx.tokenRaw;
  try {
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const strategy = await ctx.services.strategy.getMyStrategy(userRaw._id);
    ctx.body = ctx.resuccess({
      strategy
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

//得到低费率基金的情况
exports.getLowRateStrategy = async function (ctx) {
  const tokenRaw = ctx.tokenRaw;
  try {
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const strategy = await ctx.services.strategy.getLowRateStrategy(userRaw._id);
    ctx.body = ctx.resuccess({
      strategy
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
