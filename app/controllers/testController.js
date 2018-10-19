const reqlib = require('app-root-path').require
const sendMail = require('../common/email')
const config = reqlib('/config/index')
const emailTemplate = require('../const/emailTemplate')

exports.testEmail = async function (ctx) {
  try {
    await sendMail(emailTemplate.verifyOpeningSuccessTemplate({
      sender: config.email.senderAccount.auth.user,
      userEmail: config.email.adminAccount.user,
      openMsg: '开盘'
    }))
    ctx.body = ctx.resuccess()
  } catch (err) {
    ctx.body = ctx.refail(err)
  }
}
