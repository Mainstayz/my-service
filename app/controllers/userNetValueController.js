/**
 * Created by xiaobxia on 2018/4/5.
 */
const moment = require('moment');
const util = require('../util');

const numberUtil = util.numberUtil;
const fundBaseUtil = util.fundBaseUtil;

exports.addUserNetValue = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  const userNetValueService = ctx.services.userNetValue;
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
    await userNetValueService.addUserNetValue(userRaw._id, fund._id, data);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.deleteUserNetValue = async function (ctx) {
  const query = ctx.query;
  const fundService = ctx.services.fund;
  const userNetValueService = ctx.services.userNetValue;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    // 得到基金信息
    const fund = await fundService.getFundBaseByCode({
      code: data.code
    });
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 删除基金用户关系
    await userNetValueService.deleteUserNetValue(userRaw._id, fund._id);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.updateUserNetValue = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  const userNetValueService = ctx.services.userNetValue;
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
    await userNetValueService.updateUserNetValue(userRaw._id, fund._id, data);
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
