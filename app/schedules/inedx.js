/**
 * Created by xiaobxia on 2018/1/31.
 */
exports.updateFundsBaseInfo = require('./updateFundsBaseInfo');

const env = process.env.NODE_ENV;
const isDev = env === 'dev';
// 阿里云上不执行，因为好买请求数据有问题
if (isDev) {
  exports.updateValuation = require('./updateValuation');
}
