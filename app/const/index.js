/**
 * Created by xiaobxia on 2017/11/2.
 */
const sysConsts = require('./sysConsts')
const errorConsts = require('./errorConsts')
const emailTemplate = require('./emailTemplate')
const fundConsts = require('./fundConsts')
module.exports = {
  ...sysConsts,
  ...errorConsts,
  ...emailTemplate,
  ...fundConsts
}
