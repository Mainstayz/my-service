/**
 * Created by xiaobxia on 2018/4/5.
 */
const moment = require('moment');
const util = require('../util');

const numberUtil = util.numberUtil;
const fundBaseUtil = util.fundBaseUtil;

exports.addUserNetValue = async function (ctx) {
  const query = ctx.request.body;
  const userNetValueService = ctx.services.userNetValue;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      shares: {required: true},
      asset: {required: true},
      net_value_date: {required: true},
    }, query);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    await userNetValueService.addUserNetValue(userRaw._id, query.net_value_date, {
      shares: data.shares,
      asset: data.asset,
      net_value: numberUtil.keepFourDecimals(data.asset / data.shares)
    });
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.deleteUserNetValue = async function (ctx) {
  const query = ctx.query;
  const userNetValueService = ctx.services.userNetValue;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      net_value_date: {required: true},
    }, query);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    await userNetValueService.deleteUserNetValue(userRaw._id, data.net_value_date);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.updateUserNetValue = async function (ctx) {
  const query = ctx.request.body;
  const userNetValueService = ctx.services.userNetValue;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      shares: {required: true},
      asset: {required: true},
      net_value_date: {required: true},
    }, query);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    await userNetValueService.updateUserNetValue(userRaw._id, query.net_value_date, {
      shares: data.shares,
      asset: data.asset,
      net_value: numberUtil.keepFourDecimals(data.asset / data.shares)
    });
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 分页
exports.getUserNetValues = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      current: {type: 'int', required: true},
      pageSize: {type: 'int', required: true}
    }, query);
    let paging = ctx.paging(data.current, data.pageSize);
    //分页获取
    const userNetValues = await ctx.services.userNetValue.getUserNetValueByPaging(data, paging);
    paging.total = userNetValues.count;
    ctx.body = ctx.resuccess({
      list: userNetValues.list,
      page: paging
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
