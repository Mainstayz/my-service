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
      fund.better_count = '';
    });
    ctx.body = ctx.resuccess({
      list: funds.list,
      page: paging
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 获取近期分析数据
exports.getFundAnalyzeRecent = async function (ctx) {
  const query = ctx.query;
  const fundService = ctx.services.fund;
  const dictionariesService = ctx.services.dictionaries;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    const fund = await fundService.getFundByCode(data.code);
    if (fund && fund['recent_net_value']) {
      const analyzeValue = await dictionariesService.getAnalyzeValue();
      ctx.body = ctx.resuccess(
        ctx.services.analyze.getFundAnalyzeRecent(fund, analyzeValue, true)
      );
    } else {
      ctx.body = ctx.refail({
        message: '暂无数据分析'
      });
    }
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

//得到行情
exports.getMarket = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      sort: {required: false},
      current: {type: 'int', required: true},
      pageSize: {type: 'int', required: true}
    }, query);
    let paging = ctx.paging(data.current, data.pageSize);
    //分页获取
    const funds = await ctx.services.fund.getMarket(data.sort, paging);
    paging.total = funds.count;
    ctx.body = ctx.resuccess({
      list: funds.list,
      page: paging
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getAverageValuationRate = async function (ctx) {
  try {
    //分页获取
    const rate = await ctx.services.fund.getAverageValuationRate();
    ctx.body = ctx.resuccess({
      rate
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getRank = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      day: {type: 'int', required: true}
    }, query);
    const funds = await ctx.services.fund.getRank(data.day);
    ctx.body = ctx.resuccess({
      list: funds
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
