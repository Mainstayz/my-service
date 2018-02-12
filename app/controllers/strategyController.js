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
    const strategy = await ctx.services.analyze.getStrategy(data.force);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const userFunds = await ctx.services.fund.getUserFundsByUserId(userRaw._id);
    strategy.forEach(function (item) {
      for (let k = 0; k < userFunds.length; k++) {
        if (item._id.toString() === userFunds[k].fund.toString()) {
          item.has = true;
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
    const strategy = await ctx.services.analyze.getMyStrategy(userRaw._id);
    ctx.body = ctx.resuccess({
      strategy
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
