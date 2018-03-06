/**
 * Created by xiaobxia on 2018/3/5.
 */
const fs = require('fs-extra');
const del = require('del');

exports.addFocusFund = async function (ctx) {
  const query = ctx.request.body;
  const fundService = ctx.services.fund;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    // 添加基金
    let fund = await fundService.checkFundByQuery({code: data.code});
    if (!fund) {
      fund = await fundService.addFund(data.code);
    }
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 添加基金用户关系
    const focusFund = await fundService.checkFocusFundByQuery({
      user: userRaw._id,
      fund: fund._id
    });
    if (!focusFund) {
      await fundService.addFocusFund(userRaw._id, fund._id);
    }
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.deleteFocusFund = async function (ctx) {
  const query = ctx.query;
  const fundService = ctx.services.fund;
  try {
    const tokenRaw = ctx.tokenRaw;
    const data = ctx.validateData({
      code: {type: 'string', required: true}
    }, query);
    // 得到基金信息
    const fund = await fundService.checkFundByQuery({
      code: data.code
    });
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 删除基金用户关系
    await fundService.deleteFocusFund(userRaw._id, fund._id);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getFocusFunds = async function (ctx) {
  try {
    const tokenRaw = ctx.tokenRaw;
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 找到基金
    const strategy = await ctx.services.analyze.getFocusStrategy(userRaw._id);
    ctx.body = ctx.resuccess({
      list: strategy
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 导入基金，如果基金不存在，就添加
exports.importFocusFund = async function (ctx) {
  const tokenRaw = ctx.tokenRaw;
  const fundService = ctx.services.fund;
  console.log(ctx.req.file);
  // 获取上传数据
  const filePath = `${ctx.localConfig.uploadDir}/${ctx.req.file.filename}`;
  const data = await fs.readJson(filePath);
  try {
    const funds = data.funds;
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    // 添加
    if (funds.length > 0) {
      let optionList = [];
      for (let k = 0; k < funds.length; k++) {
        // 检查是否在基金库中
        let fund = await fundService.checkFundByQuery({
          code: funds[k]
        });
        if (fund) {
          // 检查是否已经添加
          const record = await fundService.checkFocusFundByQuery({
            user: userRaw._id,
            fund: fund._id
          });
          if (!record) {
            optionList.push(fundService.addFocusFund(userRaw._id, fund._id));
          }
        } else {
          fund = await fundService.addFund(funds[k]);
          optionList.push(fundService.addFocusFund(userRaw._id, fund._id));
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
