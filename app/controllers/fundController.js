/**
 * Created by xiaobxia on 2018/1/26.
 */
const fs = require('fs-extra');
const del = require('del');
const send = require('koa-send');

exports.addUserFund = async function (ctx) {
  const query = ctx.request.body;
  try {
    const tokenRaw = ctx.token.verify(ctx.headers.token || '');
    const data = ctx.validateData({
      fundCode: {type: 'string', required: true},
      fundCount: {type: 'number', required: true}
    }, query);
    // 添加基金
    const fund = await ctx.services.fund.addFund(data.fundCode);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 添加基金用户关系
    await ctx.services.fund.addUserFund(userRaw._id, fund._id, data.fundCount);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.deleteUserFund = async function (ctx) {
  const query = ctx.query;
  try {
    const tokenRaw = ctx.token.verify(ctx.headers.token || '');
    const data = ctx.validateData({
      fundCode: {type: 'string', required: true}
    }, query);
    // 得到基金信息
    const fund = await ctx.services.fund.getFundByCode(data.fundCode);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 删除基金用户关系
    await ctx.services.fund.deleteUserFund(userRaw._id, fund._id, data.fundCount);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getUserFunds = async function (ctx) {
  try {
    const tokenRaw = ctx.token.verify(ctx.headers.token || '');
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 找到用户下的基金
    const userFunds = await ctx.services.fund.getUserFunds(userRaw._id);
    const fundIds = userFunds.map(f => f.fund_id);
    // 得到所有基金的信息
    const funds = await ctx.services.fund.getFundsByIds(fundIds);
    let list = [];
    let totalSum = 0;
    let valuationTotalSum = 0;
    for (let i = 0; i < funds.length; i++) {
      const fund = funds[i];
      for (let j = 0; j < userFunds.length; j++) {
        const userFund = userFunds[j];
        if (userFund['fund_id'].toString() === fund['_id'].toString()) {
          const sum = parseInt((fund.net_value * userFund.count) * 100) / 100;
          const valuationSum = parseInt((fund.valuation * userFund.count) * 100) / 100;
          totalSum += sum;
          valuationTotalSum += valuationSum;
          list.push({
            name: fund.name,
            code: fund.code,
            count: userFund.count,
            // 净值
            net_value: fund.net_value,
            // 估值
            valuation: fund.valuation,
            valuationSource: fund.valuationSource,
            // 持仓净值
            sum,
            valuationSum
          });
          break;
        }
      }
    }
    ctx.body = ctx.resuccess({
      list,
      info: {
        totalSum: parseInt(totalSum),
        valuationTotalSum: parseInt(valuationTotalSum)
      }
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.importMyFund = async function (ctx) {
  const tokenRaw = ctx.token.verify(ctx.headers.token);
  console.log(ctx.req.file);
  const filePath = `${ctx.localConfig.uploadDir}/${ctx.req.file.filename}`;
  const data = await fs.readJson(filePath);
  const funds = data.myFund;
  const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
  if (funds.length > 0 && funds[0].code) {
    for (let k = 0; k < funds.length; k++) {
      const fund = await ctx.services.fund.addFund(funds[k].code);
      await ctx.services.fund.addUserFund(userRaw._id, fund._id, funds[k].count);
    }
    del(filePath);
    ctx.body = ctx.resuccess();
  } else {
    ctx.body = ctx.refail({
      message: 'json数据不正确'
    });
  }
};

exports.exportMyFund = async function (ctx) {
  try {
    const tokenRaw = ctx.token.verify(ctx.headers.token || '');
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
            count: userFund.count
          });
          break;
        }
      }
    }
    ctx.body = {
      list
    }
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.updateFundsInfo = async function (ctx) {
  try {
    // 主要是为了更新单位净值
    await ctx.services.fund.updateFundsInfo();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
