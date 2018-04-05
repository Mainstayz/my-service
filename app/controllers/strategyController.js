/**
 * Created by xiaobxia on 2018/2/12.
 */
exports.getStrategy = async function (ctx) {
  const query = ctx.query;
  const tokenRaw = ctx.tokenRaw;
  try {
    const data = ctx.validateData({
      force: {required: false}
    }, query);
    const strategy = await ctx.services.strategy.getStrategy(data.force);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const userFunds = await ctx.services.fund.getUserFundsByUserId(userRaw._id);
    strategy.forEach(function (item) {
      item.has = false;
      for (let k = 0; k < userFunds.length; k++) {
        if (item._id.toString() === userFunds[k].fund.toString()) {
          item.has = userFunds[k].count > 0;
          break;
        }
      }
    });
    ctx.body = ctx.resuccess({
      strategy
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

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
