/**
 * Created by xiaobxia on 2018/1/26.
 */
const fs = require('fs-extra');
const del = require('del');
const moment = require('moment');

//手动添加基金
exports.addFund = async function (ctx) {
  const query = ctx.request.body;
  try {
    const data = ctx.validateData({
      code: {required: true}
    }, query);
    const fund = await ctx.services.fund.getFundByCode(data.code);
    if (!fund) {
      await ctx.services.fund.addFund(data.code);
    }
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
// 删除基金
exports.deleteFund = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      code: {required: true}
    }, query);
    await ctx.services.fund.deleteFund(data.code);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 得到所有基金信息
exports.getFunds = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      current: {type: 'int', required: true},
      pageSize: {type: 'int', required: true}
    }, query);
    let paging = ctx.paging(data.current, data.pageSize);
    const opt = {
      skip: paging.start,
      limit: paging.offset,
      sort: '-create_at'
    };
    const funds = await ctx.services.fund.getFundsByPaging({}, opt);
    paging.total = funds.count;
    ctx.body = ctx.resuccess({
      list: funds.list,
      page: paging
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.addUserFund = async function (ctx) {
  const query = ctx.request.body;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      fundCode: {type: 'string', required: true},
      fundCount: {type: 'number', required: true}
    }, query);
    // 添加基金
    let fund = await ctx.services.fund.getFundByCode(data.fundCode);
    if (!fund) {
      fund = await ctx.services.fund.addFund(data.fundCode);
    }
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
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      fundCode: {type: 'string', required: true}
    }, query);
    // 得到基金信息
    const fund = await ctx.services.fund.getFundByCode(data.fundCode);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 删除基金用户关系
    await ctx.services.fund.deleteUserFund(userRaw._id, fund._id);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getUserFunds = async function (ctx) {
  try {
    const tokenRaw = ctx.tokenRaw;
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 找到用户下的基金
    const userFunds = await ctx.services.fund.getUserFunds(userRaw._id);
    // 找到分析
    const fundAnalyzes = await ctx.services.analyze.getFundAnalyzesBase();
    let list = [];
    let totalSum = 0;
    let valuationTotalSum = 0;
    for (let i = 0; i < userFunds.length; i++) {
      const userFund = userFunds[i];
      const fund = userFund.fund;
      // 持仓金额
      const sum = parseInt((fund.net_value * userFund.count) * 100) / 100;
      totalSum += sum;
      let result = {
        name: fund.name,
        code: fund.code,
        count: userFund.count,
        // 净值
        netValue: fund.net_value,
        // 持仓净值
        sum
      };
      // 填充分析
      for (let j = 0; j < fundAnalyzes.length; j++) {
        const fundAnalyze = fundAnalyzes[j];
        if (fund['fund_analyze'].toString() === fundAnalyze['_id'].toString()) {
          // 判断是否有数据
          let haomaiCount = 0;
          let tiantianCount = 0;
          //统计
          if (fundAnalyze['better_count']) {
            const betterCount = JSON.parse(fundAnalyze['better_count']).data;
            betterCount.forEach(function (item) {
              if (item.type === 'tiantian') {
                tiantianCount++;
              } else {
                haomaiCount++;
              }
            })
          }
          // 填充数据
          if (haomaiCount > tiantianCount) {
            result.valuationSource = 'haomai';
            result.valuation = fundAnalyze['valuation_haomai'];
          } else {
            result.valuationSource = 'tiantian';
            result.valuation = fundAnalyze['valuation_tiantian'];
          }
          result.valuationSum = parseInt((result.valuation * userFund.count) * 100) / 100;
          valuationTotalSum += result.valuationSum;
        }
      }
      list.push(result);
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

// 导入基金，所有基金手动添加或导入
exports.importFund = async function (ctx) {
  console.log(ctx.req.file);
  // 获取上传数据
  const filePath = `${ctx.localConfig.uploadDir}/${ctx.req.file.filename}`;
  const data = await fs.readJson(filePath);
  try {
    const funds = data.fund;
    // 添加
    if (funds.length > 0 && funds[0].code) {
      await ctx.services.fund.importFund(funds);
      ctx.body = ctx.resuccess();
    } else {
      ctx.body = ctx.refail({
        message: 'json数据不正确'
      });
    }
  } catch (err) {
    ctx.body = ctx.refail({
      message: 'json数据不正确'
    });
  } finally {
    del(filePath);
  }
};

// 导入基金，如果基金不存在，就添加
exports.importMyFund = async function (ctx) {
  const tokenRaw = ctx.tokenRaw;
  console.log(ctx.req.file);
  // 获取上传数据
  const filePath = `${ctx.localConfig.uploadDir}/${ctx.req.file.filename}`;
  const data = await fs.readJson(filePath);
  try {
    const funds = data.myFund;
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 添加
    if (funds.length > 0 && funds[0].code) {
      let optionList = [];
      for (let k = 0; k < funds.length; k++) {
        // 检查是否在基金库中
        let fund = await ctx.services.fund.getFundByCode(funds[k].code);
        if (fund) {
          // 检查是否已经添加
          const record = await ctx.services.fund.getUserFund(userRaw._id, fund._id);
          if (record) {
            optionList.push(ctx.services.fund.updateUserFund(userRaw._id, fund._id, funds[k].count));
          } else {
            optionList.push(ctx.services.fund.addUserFund(userRaw._id, fund._id, funds[k].count));
          }
        } else {
          fund = await ctx.services.fund.addFund(funds[k].code);
          optionList.push(ctx.services.fund.addUserFund(userRaw._id, fund._id, funds[k].count));
        }
      }
      await Promise.all(optionList);
      ctx.body = ctx.resuccess();
    } else {
      ctx.body = ctx.refail({
        message: 'json数据不正确'
      });
    }
  } catch (err) {
    ctx.body = ctx.refail();
  } finally {
    del(filePath);
  }
};

// 导出我的基金
exports.exportMyFund = async function (ctx) {
  try {
    const tokenRaw = ctx.tokenRaw;
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
