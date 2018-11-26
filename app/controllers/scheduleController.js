/**
 * Created by xiaobxia on 2018/3/6.
 */

/**
 * 添加定时任务
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.addSchedule = async function (ctx) {
  const query = ctx.request.body
  const scheduleService = ctx.services.schedule
  try {
    const data = ctx.validateData({
      key: { type: 'string', required: true },
      describe: { type: 'string', required: true },
      value: { required: true, include: ['open', 'close'] }
    }, query)
    // 添加任务
    await scheduleService.addSchedule(data)
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 删除定时任务
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.deleteSchedule = async function (ctx) {
  const query = ctx.query
  const scheduleService = ctx.services.schedule
  try {
    const data = ctx.validateData({
      key: { type: 'string', required: true }
    }, query)
    await scheduleService.deleteSchedule(data.key)
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 更新定时任务
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.updateSchedule = async function (ctx) {
  const query = ctx.request.body
  const scheduleService = ctx.services.schedule
  try {
    const data = ctx.validateData({
      key: { type: 'string', required: true },
      describe: { required: true },
      value: { required: true, include: ['open', 'close'] }
    }, query)
    await scheduleService.updateSchedule(data.key, {
      describe: data.describe,
      value: data.value
    })
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 更新定时任务的状态
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.changeScheduleStatus = async function (ctx) {
  const query = ctx.request.body
  const scheduleService = ctx.services.schedule
  try {
    const data = ctx.validateData({
      key: { type: 'string', required: true },
      value: { required: true, include: ['open', 'close'] }
    }, query)
    await scheduleService.updateSchedule(data.key, {
      value: data.value
    })
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取定时任务
 * @param ctx
 * @returns {Promise.<void>}
 */
exports.getSchedules = async function (ctx) {
  try {
    const schedules = await ctx.services.schedule.getSchedules()
    ctx.body = ctx.resuccess({
      list: schedules
    })
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}

/**
 * 获取定时任务的值
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getScheduleValue = async function (ctx) {
  const query = ctx.query
  const dictionariesService = ctx.services.dictionaries
  try {
    const data = ctx.validateData({
      key: { type: 'string', required: true }
    }, query)
    const value = await dictionariesService.getByKey(data.key)
    ctx.body = ctx.resuccess(value)
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}
