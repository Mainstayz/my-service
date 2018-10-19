const reqlib = require('app-root-path').require
const mailer = require('nodemailer')
const localConfig = reqlib('/config')
const emailConfig = localConfig.email
function sendMail (option) {
  // 防止timeout
  let transporter = mailer.createTransport(emailConfig.senderAccount)
  return new Promise((resolve, reject) => {
    transporter.sendMail(option, (err, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(info)
      }
    })
  })
}
module.exports = sendMail
