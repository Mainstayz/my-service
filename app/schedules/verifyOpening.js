/**
 * Created by xiaobxia on 2018/3/6.
 */
const schedule = require('node-schedule');
const request = require('request-promise');
const reqlib = require('app-root-path').require;
const logger = require('../common/logger');
const config = reqlib('/config/index');
const scheduleService = require('../services/schedule');
const fundService = require('../services/fund');
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

rule.dayOfWeek = [new schedule.Range(1, 5)];
// 平时不用
rule.hour = [10, 13];

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
            scheduleService.updateSchedule('updateValuation', {
              value: 'open'
            }).then(()=>{
            });
          }).catch(function (err) {
            logger.error(err);
          });
        }
      });
    }
  });
}

const job = schedule.scheduleJob(rule, verifyOpening);

module.exports = job;
