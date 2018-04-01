/**
 * Created by xiaobxia on 2018/3/6.
 */
/**
 * 添加定时任务
 */
exports.addSchedule = async function (ctx) {
  const query = ctx.request.body;
  const scheduleService = ctx.services.schedule;
  try {
    const data = ctx.validateData({
      key: {type: 'string', required: true},
      describe: {type: 'string', required: true},
      value: {required: true, include: ['open', 'close']}
    }, query);
    // 添加任务
    await scheduleService.addSchedule(data.key, data.describe, data.value);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

/**
 * 删除定时任务
 */
exports.deleteSchedule = async function (ctx) {
  const query = ctx.query;
  const scheduleService = ctx.services.schedule;
  try {
    const data = ctx.validateData({
      key: {type: 'string', required: true}
    }, query);
    await scheduleService.deleteSchedule(data.key);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

/**
 * 更新定时任务
 */
exports.updateSchedule = async function (ctx) {
  const query = ctx.query;
  const scheduleService = ctx.services.schedule;
  try {
    const data = ctx.validateData({
      key: {type: 'string', required: true},
      describe: {required: true},
      value: {required: true, include: ['open', 'close']}
    }, query);
    await scheduleService.updateSchedule(data.key, data.describe, data.value);
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getSchedules = async function (ctx) {
  try {
    const data = ctx.validateData({
      current: {type: 'int', required: true},
      pageSize: {type: 'int', required: true}
    }, query);
    let paging = ctx.paging(data.current, data.pageSize);
    const schedules = await ctx.services.schedule.getSchedulesByPaging(data, paging);
    ctx.body = ctx.resuccess({
      list: schedules
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

/**
 * --------------------------------------具体的任务-------------------------------------------------------
 */

exports.verifyOpening = async function (ctx) {
  try {
    const isOpening = await ctx.services.schedule.verifyOpening();
    ctx.body = ctx.resuccess({
      isOpening
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 更新估值
exports.updateValuation = async function (ctx) {
  try {
    await ctx.services.analyze.updateValuation();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 更新基本信息
exports.updateBaseInfo = async function (ctx) {
  try {
    // 主要是为了更新单位净值
    await ctx.services.analyze.updateBaseInfo();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 获取净值涨跌数据
exports.updateRecentNetValue = async function (ctx) {
  try {
    await ctx.services.analyze.updateRecentNetValue();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 统计估值准确
exports.betterValuation = async function (ctx) {
  try {
    // 主要是为了更新单位净值
    await ctx.services.analyze.betterValuation();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

// 添加新的涨跌数据
exports.addRecentNetValue = async function (ctx) {
  try {
    await ctx.services.analyze.addRecentNetValue();
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
