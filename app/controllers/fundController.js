/**
 * Created by xiaobxia on 2018/1/26.
 */
const util = require('../util');

const fundBaseUtil = util.fundBaseUtil;

/**
 * 手动添加基金
 */
exports.addFund = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  try {
    const data = ctx.validateData({
      code: {required: true}
    }, query);
    await fundService.addFundByCode(data.code);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
/**
 * 删除基金
 */
exports.deleteFund = async function (ctx) {
  const query = ctx.query;
  const fundService = ctx.services.fund;
  try {
    const data = ctx.validateData({
      code: {required: true}
    }, query);
    await fundService.deleteFundByCode(data.code);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
/**
 * 基金基本信息
 */
exports.getFundBase = async function (ctx) {
  const query = ctx.query;
  const fundService = ctx.services.fund;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    const fund = await fundService.getFundBaseByCode(data.code);
    if (fund) {
      const valuationInfo = fundBaseUtil.getBetterValuation(fund);
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
    } else {
      ctx.body = ctx.refail({
        message: '基金不存在'
      });
    }
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
    //分页获取
    const funds = await ctx.services.fund.getFundsBaseByPaging(data, paging);
    paging.total = funds.count;
    //估值获取
    funds.list.forEach((fund) => {
      const valuationInfo = fundBaseUtil.getBetterValuation(fund);
      fund.valuation = valuationInfo.valuation;
      fund.valuationSource = valuationInfo.sourceName;
    });
    ctx.body = ctx.resuccess({
      list: funds.list,
      page: paging
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
