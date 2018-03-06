/**
 * Created by xiaobxia on 2018/3/6.
 */
const Proxy = require('../proxy');

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
