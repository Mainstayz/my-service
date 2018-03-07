/**
 * Created by xiaobxia on 2018/3/6.
 */
const moment = require('moment');
const Proxy = require('../proxy');
const fundUtil = require('../util/fund');

const FundProxy = Proxy.Fund;
const ScheduleProxy = Proxy.Schedule;

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
  // 估值日期就是今天
  return nowDay === fundData.valuation_date;
};
