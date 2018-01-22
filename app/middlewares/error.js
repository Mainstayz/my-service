/**
 * Created by xiaobxia on 2017/7/12.
 */
const BaseResult = require('../model/result/baseResult');
const email = require('../common/email');
const config = require('../../config/index');
const logger = require('../common/logger');
const debug = config.server.debug;
module.exports = function (error, req, res, next) {
  if (debug) {
    console.log(error.stack);
  }
  let result = new BaseResult();
  result.setSuccess(false);
  if (error.type === 'user') {
    result.setErrorCode(error.code);
    result.setErrorMessage(error.message);
    res.json(result);
  } else if (error.type === 'parameter') {
    result.setErrorCode('BAD REQUEST');
    result.setErrorMessage('请求参数错误');
    res.status(400).json(result);
  } else {
    if (!debug) {
      email.sendError(error.stack, function (error, info) {
        if (error) {
          logger.error(error);
        } else {
          logger.trace(info);
        }
      });
    }
    result.setErrorCode('SERVER ERROR');
    result.setErrorMessage('服务器出错');
    res.status(500).json(result);
  }
};
