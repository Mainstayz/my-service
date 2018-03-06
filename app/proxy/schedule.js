/**
 * Created by xiaobxia on 2018/3/6.
 */
const models = require('../models');

const ScheduleModel = models.Schedule;

exports.ScheduleModel = ScheduleModel;

exports.newAndSave = function (data) {
  const Schedule = new ScheduleModel(data);
  return Schedule.save();
};

exports.delete = function (query) {
  return ScheduleModel.remove(query);
};

exports.update = function (name, open) {
  return ScheduleModel.update({
    name
  }, {
    $set: {
      open
    }
  });
};

exports.findById = function (ScheduleId) {
  return ScheduleModel.findById(ScheduleId);
};

exports.find = function (query, opt) {
  return ScheduleModel.find(query, {}, opt);
};

exports.findOne = function (query) {
  return ScheduleModel.findOne(query);
};

exports.check = function (query, opt) {
  return ScheduleModel.findOne(query, '_id', opt);
};
