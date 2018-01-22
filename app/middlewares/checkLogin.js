/**
 * Created by xiaobxia on 2017/7/17.
 */
const sessionConst = require('../model/const/session');
const config = require('../../config/index');
const BaseResult = require('../model/result/baseResult');
const basePath = config.project.projectName;
module.exports = function (req, res, next) {
  if (req.session[sessionConst.SESSION_LOGIN_USER]) {  // 判断用户是否登录
    next();
  } else {
    // 解析用户请求的路径
    let arr = req.url.split('/');
    // 去除 GET 请求路径上携带的参数
    for (let i = 0, length = arr.length; i < length; i++) {
      arr[i] = arr[i].split('?')[0];
    }
    // 判断请求路径是否为根、登录、注册、登出，如果是不做拦截
    if (arr.length > 2 && arr[1] === basePath) {
      if (arr[3] === 'isLogin' || arr[3] === 'login' || arr[3] === 'logout') {
        next();
      } else {
        // 记录请求的来源
        // req.session.originalUrl = req.originalUrl ? req.originalUrl : null;
        // 是没登录还是登录过时了，会有isLogin接口判断
        let result = new BaseResult();
        result.setSuccess(false);
        result.setErrorCode('USER_SESSION_TIMEOUT');
        res.json(result);
      }
    } else {
      next();
    }
  }
};
