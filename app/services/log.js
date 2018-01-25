/**
 * Created by xiaobxia on 2018/1/25.
 */
const Proxy = require('../proxy');
const LogAuditProxy = Proxy.LogAudit;

exports.addLogAudit = async function (log) {
  return LogAuditProxy.newAndSave(log.logType, log.userId, log.platform);
};
