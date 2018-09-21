const reqlib = require('app-root-path').require;
const localConfig = reqlib('/config');
const localConst = require('./const');
const logger = require('./common/logger');
const services = require('./services');
const sendMail = require('./common/email');
const jwt = require('jsonwebtoken');
const fs = require('fs-extra');
const Parameter = require('./common/validate');
const schedules = require('./schedules/inedx');

const p = new Parameter();
const emailConfig = localConfig.email;
const codeMap = {
  '-1': 'fail',
  '200': 'success',
  '401': 'token expired',
  '500': 'server error',
  '10001': 'params error'
};

module.exports = function (app) {
  app.context.localConfig = localConfig;
  app.context.localConst = localConst;
  app.context.logger = logger;
  // 发邮件
  app.context.sendMail = sendMail;
  // 成功
  app.context.resuccess = function (data) {
    return {
      code: 200,
      success: true,
      message: codeMap['200'],
      data: data || null
    };
  };
  // 失败
  app.context.refail = function (err, data) {
    logger.warn(err);
    const message = err.message;
    const code = err.code || '-1';
    return {
      code: parseInt(code),
      success: false,
      message: message || codeMap[code || '-1'] || codeMap['-1'],
      data: data || null
    };
  };
  // 接口
  app.context.validateData = function (rule, data) {
    let fake = {};
    for (let key in rule) {
      if (rule.hasOwnProperty(key)) {
        if (rule[key].type === 'int') {
          fake[key] = parseInt(data[key], 10);
        } else if (rule[key].type === 'number') {
          fake[key] = parseFloat(data[key]);
        } else {
          if (!rule[key].type) {
            rule[key].type = 'string';
          }
          fake[key] = data[key];
        }
      }
    }
    let msgList = p.validate(rule, fake);
    if (msgList !== undefined) {
      let msg = msgList[0];
      let err = new Error(msg.field + ' ' + msg.message);
      err.code = '10001';
      throw err;
    } else {
      return fake;
    }
  };
  app.context.token = {};
  app.context.token.sign = function (data, expiresIn) {
    const tokenConfig = localConfig.server.token;
    return jwt.sign(data, tokenConfig.key, {expiresIn: expiresIn || tokenConfig.expiresIn});
  };

  app.context.token.verify = function (token) {
    const tokenConfig = localConfig.server.token;
    return jwt.verify(token, tokenConfig.key);
  };

  app.context.services = services;

  app.context.createJsonFile = function (fileName, fileData) {
    return fs.ensureFile(fileName).then(() => {
      return fs.writeJson(fileName, fileData, {spaces: 2});
    });
  };

  app.context.schedules = schedules;

  app.context.paging = function(current, pageSize, defaultValue) {
    let defaultCurrent = 1,
      defaultPageSize = 10;
    if (defaultValue) {
      defaultCurrent = defaultValue.current || defaultCurrent;
      defaultPageSize = defaultValue.pageSize || defaultPageSize;
    }
    //得是个整数
    let currentT = parseInt(current, 10),
      pageSizeT = parseInt(pageSize, 10),
      index = isNaN(currentT) ? defaultCurrent : currentT,
      size = isNaN(pageSizeT) ? defaultPageSize : pageSizeT;
    return {
      current: index,
      pageSize: size,
      start: (index - 1) * size,
      offset: size
    };
  };
};
