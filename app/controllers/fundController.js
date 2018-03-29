/**
 * Created by xiaobxia on 2018/1/26.
 */
const fs = require('fs-extra');
const del = require('del');
const moment = require('moment');
const util = require('../util');

const numberUtil = util.numberUtil;
const analyzeUtil = util.analyzeUtil;

//手动添加基金
exports.addFund = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  try {
    const data = ctx.validateData({
      code: {required: true}
    }, query);
    const fund = await fundService.checkFundByQuery({code: data.code});
    if (!fund) {
      await fundService.addFund(data.code);
    }
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
// 删除基金
exports.deleteFund = async function (ctx) {
  const query = ctx.query;
  const fundService = ctx.services.fund;
  try {
    const data = ctx.validateData({
      code: {required: true}
    }, query);
    // 验证基金是否以被用
    const fund = await fundService.checkFundByQuery({code: data.code});
    const userFund = await fundService.checkUserFundByQuery({fund: fund._id});
    if (userFund) {
      ctx.body = ctx.refail({
        message: '被使用'
      });
    } else {
      await fundService.deleteFundByCode(data.code);
      ctx.body = ctx.resuccess();
    }
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getFundSimple = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    const fund = await ctx.services.fund.getFundSimpleByCode(data.code);
    ctx.body = ctx.resuccess(fund);
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getFundBase = async function (ctx) {
  const query = ctx.query;
  const fundService = ctx.services.fund;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    const fund = await fundService.getFundBaseByCode(data.code);
    const valuationInfo = analyzeUtil.getBetterValuation(fund);
    const result = {
      code: fund.code,
      name: fund.name,
      net_value: fund.net_value,
      net_value_date: fund.net_value_date,
      sell: fund.sell,
      valuation_date: fund.valuation_date,
      valuation_haomai: fund.valuation_haomai,
      valuation_tiantian: fund.valuation_tiantian,
      valuation: valuationInfo.valuation,
      valuationSource: valuationInfo.sourceName
    };
    ctx.body = ctx.resuccess(result);
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 得到基金分页
exports.getFunds = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      keyword: {required: false},
      current: {type: 'int', required: true},
      pageSize: {type: 'int', required: true}
    }, query);
    let paging = ctx.paging(data.current, data.pageSize);
    const opt = {
      skip: paging.start,
      limit: paging.offset,
      sort: '-create_at'
    };
    let queryOption = {};
    if (data.keyword) {
      const keyExp = new RegExp(data.keyword, 'i');
      queryOption = {
        $or: [
          {code: keyExp},
          {name: keyExp}]
      }
    }
    const funds = await ctx.services.fund.getSimpleFundsByPaging(queryOption, opt);
    paging.total = funds.count;
    ctx.body = ctx.resuccess({
      list: funds.list,
      page: paging
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 导入基金，所有基金手动添加或导入
exports.importFunds = async function (ctx) {
  console.log(ctx.req.file);
  // 获取上传数据
  const filePath = `${ctx.localConfig.uploadDir}/${ctx.req.file.filename}`;
  const data = await fs.readJson(filePath);
  try {
    const funds = data.fund;
    // 添加
    await ctx.services.fund.importFunds(funds);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail({
      message: 'json数据不正确'
    });
  } finally {
    del(filePath);
  }
};
