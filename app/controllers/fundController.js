/**
 * Created by xiaobxia on 2018/1/26.
 */
exports.addUserFund = async function (ctx) {
  const query = ctx.request.body;
  try {
    const data = ctx.validateData({
      token: {type: 'string', required: true},
      fundCode: {type: 'string', required: true},
      fundCount: {type: 'number', required: true}
    }, query);
    const tokenRaw = ctx.token.verify(data.token);
    const fund = await ctx.services.fund.addFund(data.fundCode);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    await ctx.services.fund.addUserFund(userRaw._id, fund._id, data.fundCount);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getUserFunds = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      token: {type: 'string', required: true},
    }, query);
    const tokenRaw = ctx.token.verify(data.token);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const userFunds = await ctx.services.fund.getUserFunds(userRaw._id);
    const fundIds = userFunds.map(f => f.fund_id);
    const funds = await ctx.services.fund.getFundsByIds(fundIds);
    let list = [];
    for (let i = 0; i < funds.length; i++) {
      const fund = funds[i];
      for (let j = 0; j < userFunds.length; j++) {
        const userFund = userFunds[j];
        if (userFund['fund_id'].toString() === fund['_id'].toString()) {
          list.push({
            name: fund.name,
            code: fund.code,
            count: userFund.count,
            net_value: fund.net_value,
            valuation: fund.valuation,
          });
          break;
        }
      }
    }
    ctx.body = ctx.resuccess({
      list
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
