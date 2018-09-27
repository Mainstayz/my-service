const reqlib = require('app-root-path').require;
const sendMail = require('../common/email');
const config = reqlib('/config/index');
const emailTemplate = require('../const/emailTemplate');

exports.testEmail = async function (ctx) {
  try {
    await sendMail(emailTemplate.verifyOpeningErrorTemplate({
      sender: config.email.senderAccount.auth.user,
      userEmail: config.email.adminAccount.user
    }));
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
