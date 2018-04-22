/**
 * Created by xiaobxia on 2018/3/29.
 */
const moment = require('moment');
const util = require('../util');

const numberUtil = util.numberUtil;
const fundBaseUtil = util.fundBaseUtil;

exports.addUserFund = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  const userFundService = ctx.services.userFund;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      code: {type: 'string', required: true},
      shares: {required: true},
      strategy: {required: true},
      cost: {required: true},
      buy_date: {required: true},
      target_net_value: {required: true},
    }, query);
    // 添加基金
    let fund = await fundService.addFundByCode(data.code);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    await userFundService.addUserFund(userRaw._id, fund._id, data);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.deleteUserFund = async function (ctx) {
  const query = ctx.query;
  const fundService = ctx.services.fund;
  const userFundService = ctx.services.userFund;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    // 得到基金信息
    const fund = await fundService.getFundBaseByCode(data.code);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 删除基金用户关系
    await userFundService.deleteUserFund(userRaw._id, fund._id);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.updateUserFund = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  const userFundService = ctx.services.userFund;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      code: {required: true},
      shares: {required: false},
      strategy: {required: false},
      cost: {required: false},
      buy_date: {required: false},
      target_net_value: {required: false},
    }, query);
    // 验证基金
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const fund = await fundService.getFundBaseByCode(data.code);
    // 更新基金用户关系
    delete data.code;
    await userFundService.updateUserFund(userRaw._id, fund._id, data);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getUserFunds = async function (ctx) {
  const dictionariesService = ctx.services.dictionaries;
  const userFundService = ctx.services.userFund;
  try {
    const tokenRaw = ctx.tokenRaw;
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 找到用户下的基金
    const userFunds = await userFundService.getUserFundsByUserIdWithFund(userRaw._id);
    let records = await dictionariesService.getByKey(ctx.localConst.OPENING_RECORDS_REDIS_KEY);
    //如果有记录
    records = JSON.parse(records.value);
    let list = [];
    let totalSum = 0;
    let costTotalSum = 0;
    let valuationTotalSum = 0;
    for (let i = 0; i < userFunds.length; i++) {
      const userFund = userFunds[i];
      const fund = userFund.fund;
      // 持仓金额
      const sum = fund.net_value * userFund.shares;
      totalSum += sum;
      const costSum = userFund.cost * userFund.shares;
      costTotalSum += costSum;
      const valuationInfo = fundBaseUtil.getBetterValuation(fund);
      const buyDate = moment(userFund.buy_date).format('YYYY-MM-DD');
      let result = {
        name: fund.name,
        code: fund.code,
        shares: userFund.shares,
        strategy: userFund.strategy,
        cost: userFund.cost,
        buy_date: buyDate,
        has_days: records.indexOf(buyDate),
        target_net_value: userFund.target_net_value,
        // 净值
        netValue: fund.net_value,
        // 持仓净值
        sum: numberUtil.keepTwoDecimals(sum),
        costSum:  numberUtil.keepTwoDecimals(costSum),
        valuation: valuationInfo.valuation,
        valuationSource: valuationInfo.sourceName
      };
      result.valuationSum = numberUtil.keepTwoDecimals(result.valuation * userFund.shares);
      valuationTotalSum += result.valuationSum;
      list.push(result);
    }
    list.sort(function (a, b) {
      return b.sum - a.sum;
    });
    ctx.body = ctx.resuccess({
      list,
      info: {
        costTotalSum: numberUtil.keepTwoDecimals(costTotalSum),
        totalSum: numberUtil.keepTwoDecimals(totalSum),
        valuationTotalSum: numberUtil.keepTwoDecimals(valuationTotalSum),
        valuationDate: userFunds[0] ? moment(userFunds[0].fund['valuation_date']).format('YYYY-MM-DD HH:mm:ss') : ''
      }
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getMyAsset = async function (ctx) {
  const userFundService = ctx.services.userFund;
  try {
    const tokenRaw = ctx.tokenRaw;
    // 验证基金
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    await userFundService.getMyAsset(userRaw._id);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

