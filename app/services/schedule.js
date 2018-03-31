/**
 * Created by xiaobxia on 2018/3/6.
 */
const moment = require('moment');
const Proxy = require('../proxy');
const fundUtil = require('../util/fundInfo');

const FundProxy = Proxy.Fund;
const ScheduleProxy = Proxy.Schedule;
const OpeningAuditProxy = Proxy.OpeningAudit;

exports.addSchedule = async function (name, describe) {
  return ScheduleProxy.newAndSave({
    name,
    describe
  });
};

exports.deleteSchedule = async function (name) {
  return ScheduleProxy.delete({name});
};

exports.updateSchedule = async function (name, open) {
  return ScheduleProxy.update(name, open);
};

exports.getSchedule = async function (name) {
  return ScheduleProxy.findOne({name});
};

exports.getSchedules = async function () {
  return ScheduleProxy.find({});
};

exports.verifyOpening = async function () {
  const nowDay = moment().format('YYYY-MM-DD');
  const fundData = await fundUtil.getFundsInfo();
  // 如果相同就说明开盘了
  const isToday = nowDay === fundData.valuation_date;
  const record = await OpeningAuditProxy.findOne({now_date: nowDay});
  if (record) {
    // 已经记录开盘了
    if (record.opening === true) {
      return 'over';
    }
    await OpeningAuditProxy.update(nowDay, isToday);
  } else {
    await OpeningAuditProxy.newAndSave({
      now_date: nowDay,
      opening: isToday,
    });
  }
  // 估值日期就是今天
  return isToday;
};
