/**
 * Created by xiaobxia on 2018/4/1.
 */
const fs = require('fs-extra');
const del = require('del');

/**
 * 导入基金，所有基金手动添加或导入
 * @param ctx
 * @returns {Promise.<void>}
 */
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


