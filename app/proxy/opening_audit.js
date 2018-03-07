/**
 * Created by xiaobxia on 2018/3/7.
 */
const models = require('../models');

const OpeningAuditModel = models.OpeningAudit;

exports.OpeningAuditModel = OpeningAuditModel;

exports.newAndSave = function (data) {
  const log = new OpeningAuditModel(data);
  return log.save();
};

exports.update = function (nowDate, opening) {
  return OpeningAuditModel.update({
    now_date: nowDate
  }, {
    $set: {
      opening
    }
  });
};

exports.findOne = function (query) {
  return OpeningAuditModel.findOne(query);
};
