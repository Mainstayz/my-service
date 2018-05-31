/**
 * Created by xiaobxia on 2018/4/1.
 */
// 导出我的基金
exports.exportMyFunds = async function (ctx) {
  try {
    const tokenRaw = ctx.tokenRaw;
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const userFunds = await ctx.services.fund.getUserFundsByUserIdWithFundBase(userRaw._id);
    let list = [];
    for (let i = 0; i < userFunds.length; i++) {
      const fund = userFunds[i].fund;
      list.push({
        name: fund.name,
        code: fund.code,
        count: userFunds[i].count
      });
    }
    ctx.body = {
      list
    }
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
