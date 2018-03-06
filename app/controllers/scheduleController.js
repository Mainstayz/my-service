/**
 * Created by xiaobxia on 2018/3/6.
 */
exports.addSchedule = async function (ctx) {
  const query = ctx.request.body;
  const scheduleService = ctx.services.schedule;
  try {
    const data = ctx.validateData({
      name: {type: 'string', required: true},
      describe: {type: 'string', required: true}
    }, query);
    // 添加任务
    let schedule= await scheduleService.getSchedule(data.name);
    if (!schedule) {
      await scheduleService.addSchedule(data.name, data.describe);
    }
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.deleteSchedule = async function (ctx) {
  const query = ctx.query;
  const scheduleService = ctx.services.schedule;
  try {
    const data = ctx.validateData({
      name: {type: 'string', required: true}
    }, query);
    const schedule = await scheduleService.getSchedule({
      name: data.name
    });
    if (schedule) {
      await scheduleService.deleteSchedule(data.name);
    }
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.updateSchedule = async function (ctx) {
  const query = ctx.query;
  const scheduleService = ctx.services.schedule;
  try {
    const data = ctx.validateData({
      name: {type: 'string', required: true},
      open: {required: true},
    }, query);
    const schedule = await scheduleService.getSchedule(data.name);
    if (schedule) {
      await scheduleService.updateSchedule(data.name, data.open);
    }
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.getSchedules = async function (ctx) {
  try {
    const schedules = await ctx.services.schedule.getSchedules();
    ctx.body = ctx.resuccess({
      list: schedules
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
