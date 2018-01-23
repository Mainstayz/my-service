const reqlib = require('app-root-path').require;
const localConfig = reqlib('/config');
const localConst = require('./const');
const logger = require('./common/logger');
const mailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Parameter = require('./common/validate');

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
  app.context.sendMail = function (option) {
    // 防止timeout
    let transporter = mailer.createTransport(emailConfig.senderAccount);
    return new Promise((resolve, reject) => {
      transporter.sendMail(option, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });
  };
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
  app.context.refail = function (message, code, data) {
    return {
      code: code || -1,
      success: false,
      message: message || codeMap[code || '-1'] || codeMap['-1'],
      data: data || null
    };
  };
  // 获取session
  app.context.getSessionUser = function (session) {
    return session[localConst.SESSION_USER_KEY];
  };
  // 设置session
  app.context.setSessionUser = function (session, data) {
    session[localConst.SESSION_USER_KEY] = data;
  };
  // 接口
  app.context.validateData = function (rule, data) {
    let fake = {};
    for (let key in rule) {
      if (rule.hasOwnProperty(key)) {
        if (!rule[key].type) {
          rule[key].type = 'string';
        }
        fake[key] = data[key];
      }
    }
    let msgList = p.validate(rule, fake);
    if (msgList !== undefined) {
      let msg = msgList[0];
      throw new Error(msg.field + ' ' + msg.message);
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
};
