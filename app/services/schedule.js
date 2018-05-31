/**
 * Created by xiaobxia on 2018/3/6.
 */
const Proxy = require('../proxy');

const DictionariesProxy = Proxy.Dictionaries;

/**
 * 添加定时任务
 */
exports.addSchedule = async function (data) {
  const schedule = await DictionariesProxy.check({key: data.key});
  if (schedule) {
    throw new Error('定时任务已存在');
  }
  return DictionariesProxy.newAndSave({
    type: 'schedule',
    ...data
  });
};

/**
 * 删除定时任务
 */
exports.deleteSchedule = async function (key) {
  const schedule = await DictionariesProxy.check({key});
  if (!schedule) {
    throw new Error('定时任务不存在');
  }
  return DictionariesProxy.delete({key});
};

/**
 * 更新定时任务
 */
exports.updateSchedule = async function (key, data) {
  const schedule = await DictionariesProxy.check({key});
  if (!schedule) {
    throw new Error('定时任务不存在');
  }
  return DictionariesProxy.update({key}, data);
};

/**
 * 获取单个定时任务
 */
exports.getSchedule = async function (key) {
  return DictionariesProxy.findOne({type: 'schedule', key});
};

/**
 * 获取所有定时任务
 */
exports.getSchedules = async function () {
  return DictionariesProxy.find({type: 'schedule'});
};

/**
 * 分页获取定时任务
 */
exports.getSchedulesByPaging = async function (query, paging) {
  const opt = {
    skip: paging.start,
    limit: paging.offset,
    sort: '-create_at'
  };
  const queryOption = {type: 'schedule'};
  const data = await Promise.all([DictionariesProxy.find(queryOption, opt), DictionariesProxy.count(queryOption)]);
  return {list: data[0], count: data[1]};
};
