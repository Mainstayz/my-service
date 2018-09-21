/**
 * Created by xiaobxia on 2018/3/6.
 */
const schedule = require('node-schedule');
const request = require('request-promise');
const reqlib = require('app-root-path').require;
const logger = require('../common/logger');
const sendMail = require('../common/email');
const config = reqlib('/config/index');
const scheduleService = require('../services/schedule');
const fundService = require('../services/fund');
const emailTemplate = require('../const/emailTemplate');
/**
 * cron风格的
 *    *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │    |
 │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    │    └───── month (1 - 12)
 │    │    │    └────────── day of month (1 - 31)
 │    │    └─────────────── hour (0 - 23)
 │    └──────────────────── minute (0 - 59)
 └───────────────────────── second (0 - 59, OPTIONAL)
 */
let rule = new schedule.RecurrenceRule();

//工作日，检验是否开盘
rule.dayOfWeek = [new schedule.Range(1, 5)];
rule.hour = [10, 11, 13];

function verifyOpening() {
  scheduleService.getSchedule('verifyOpening').then((data) => {
    if (data && data.value === 'open') {
      fundService.verifyOpening().then((opening) => {
        if (opening === 'over') {
          return false;
        } else if (opening === true) {
          // 更新净值
          request({
            method: 'get',
            url: `http://localhost:${config.server.port || 8080}/${config.project.projectName}/schedule/updateBaseInfo`
          }).then(() => {
            // 更好的估值源
            return request({
              method: 'get',
              url: `http://localhost:${config.server.port || 8080}/${config.project.projectName}/schedule/betterValuation`
            });
          }).then(() => {
            // 添加净值记录
            return request({
              method: 'get',
              url: `http://localhost:${config.server.port || 8080}/${config.project.projectName}/schedule/addRecentNetValue`
            });
          }).then(() => {
            // 开启估值更新
            return scheduleService.updateSchedule('updateValuation', {
              value: 'open'
            });
          }).then(()=>{
            // 开启涨幅更新
            return scheduleService.updateSchedule('updateRate', {
              value: 'open'
            });
          }).then(()=>{
            return sendMail(emailTemplate.verifyOpeningSuccessTemplate({
              sender: config.email.senderAccount.auth.user,
              userEmail: config.email.adminAccount.user
            }));
          }).catch(function (err) {
            logger.error(err);
            sendMail(emailTemplate.verifyOpeningErrorTemplate({
              sender: config.email.senderAccount.auth.user,
              userEmail: config.email.adminAccount.user
            }));
          });
        }
      });
    }
  });
}

const job = schedule.scheduleJob(rule, verifyOpening);

module.exports = job;
