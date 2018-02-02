/**
 * Created by xiaobxia on 2018/1/23.
 */
const models = require('../models');

const LogAuditModel = models.LogAudit;

exports.LogAuditModel = LogAuditModel;

exports.newAndSave = function (data) {
  const log = new LogAuditModel(data);
  return log.save();
};
