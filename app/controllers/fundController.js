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
  const tokenRaw = ctx.tokenRaw;
  try {
    const data = ctx.validateData({
      keyword: {required: false},
      current: {type: 'int', required: true},
      pageSize: {type: 'int', required: true}
    }, query);
    let paging = ctx.paging(data.current, data.pageSize);
    //分页获取
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const result = await Promise.all([
      ctx.services.userFund.getUserFundsByUserId(userRaw._id),
      ctx.services.fund.getFundsBaseByPaging(data, paging)
    ]);
    const userFunds = result[0];
    const funds = result[1];
    paging.total = funds.count;
    //估值获取
    funds.list.forEach((fund) => {
      const valuationInfo = fundBaseUtil.getBetterValuation(fund);
      fund.valuation = valuationInfo.valuation;
      fund.valuationSource = valuationInfo.sourceName;
      fund.better_count = '';
      for (let j = 0; j < userFunds.length; j++) {
        if (userFunds[j].fund.toString() === fund._id.toString()) {
          fund.has = true;
          break;
        }
      }
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
  const tokenRaw = ctx.tokenRaw;
  try {
    const data = ctx.validateData({
      sort: {required: false},
      current: {type: 'int', required: true},
      pageSize: {type: 'int', required: true},
      lowRate: {type: 'int', required: false}
    }, query);
    let paging = ctx.paging(data.current, data.pageSize);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    const result = await Promise.all([
      ctx.services.userFund.getUserFundsByUserId(userRaw._id),
      ctx.services.fund.getMarket(data.sort, paging, data.lowRate)
    ]);
    const userFunds = result[0];
    const funds = result[1];
    paging.total = funds.count;
    console.log(userFunds[0].fund)
    //估值获取
    let list = [];
    funds.list.forEach((fund) => {
      fund = {
        code: fund.code,
        lowRate: fund.lowRate,
        name: fund.name,
        net_value: fund.net_value,
        rate: fund.rate,
        sell: fund.sell,
        _id: fund._id
      };
      for (let j = 0; j < userFunds.length; j++) {
        if (userFunds[j].fund.toString() === fund._id.toString()) {
          fund.has = true;
          break;
        }
      }
      list.push(fund)
    });
    ctx.body = ctx.resuccess({
      list: list,
      page: paging
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getMarketInfo = async function (ctx) {
  try {
    const info = await ctx.services.fund.getMarketInfo();
    ctx.body = ctx.resuccess({
      info
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

/**
 * 更新基金的概念主题
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.updateFundTheme = async function (ctx) {
  const query = ctx.request.body;
  try {
    const data = ctx.validateData({
      code: {type: 'string', required: true},
      theme: {type: 'string', required: true}
    }, query);
    await ctx.services.fund.updateFundTheme(data.code, data.theme);
    ctx.body = ctx.resuccess({});
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
