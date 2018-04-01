/**
 * Created by xiaobxia on 2018/4/1.
 */
const fs = require('fs-extra');
const del = require('del');
const moment = require('moment');
// 导入基金，所有基金手动添加或导入
exports.importFunds = async function (ctx) {
  console.log(ctx.req.file);
  // 获取上传数据
  const filePath = `${ctx.localConfig.uploadDir}/${ctx.req.file.filename}`;
  const data = await fs.readJson(filePath);
  try {
    const funds = data.funds;
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


// 导入基金，如果基金不存在，就添加
exports.importMyFunds = async function (ctx) {
  const tokenRaw = ctx.tokenRaw;
  const fundService = ctx.services.fund;
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
        let fund = await fundService.checkFundByQuery({
          code: funds[k].code
        });
        if (fund) {
          // 检查是否已经添加
          const record = await fundService.checkUserFundByQuery({
            user: userRaw._id,
            fund: fund._id
          });
          if (record) {
            optionList.push(fundService.updateUserFund(userRaw._id, fund._id, funds[k].count));
          } else {
            optionList.push(fundService.addUserFund(userRaw._id, fund._id, funds[k].count));
          }
        } else {
          fund = await fundService.addFund(funds[k].code);
          optionList.push(fundService.addUserFund(userRaw._id, fund._id, funds[k].count));
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


