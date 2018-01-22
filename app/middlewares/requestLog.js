/**
 * Created by xiaobxia on 2017/7/6.
 */
const logger = require('../common/logger');

module.exports = function (req, res, next) {
  let ip = req.ip;
  if (ip) {
    logger.trace('ip: ' + ip);
  }
  logger.trace('path: ' + req.path);
  next();
};

