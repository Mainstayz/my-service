/**
 * Created by xiaobxia on 2017/11/2.
 */
const sysConsts = require('./sysConsts');
const errorConsts = require('./errorConsts');
const emailTemplate = require('./emailTemplate');
module.exports = {
  ...sysConsts,
  ...errorConsts,
  ...emailTemplate
};
