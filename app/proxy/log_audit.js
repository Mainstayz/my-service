/**
 * Created by xiaobxia on 2018/1/23.
 */
const models = require('../models');

const LogAuditModel = models.LogAudit;

exports.LogAuditModel = LogAuditModel;

exports.newAndSave = function (logType, userId, platform) {
  const log = new LogAuditModel({
    log_type: logType,
    user_id: userId,
    platform: platform,
  });
  return log.save();
};
