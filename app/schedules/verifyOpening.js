/**
 * Created by xiaobxia on 2018/3/6.
 */
const schedule = require('node-schedule');
const request = require('request-promise');
const reqlib = require('app-root-path').require;
const logger = require('../common/logger');
const config = reqlib('/config/index');
const scheduleService = require('../services/schedule');
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
rule.hour = [9];
let minute = [];
for (let k = 0; k < 60; k += 5) {
  minute.push(k);
}
rule.minute = minute;

function verifyOpening() {
  scheduleService.getSchedule('verifyOpening').then((data) => {
    if (data.open) {
      scheduleService.verifyOpening().then((opening) => {
        if (opening) {
          // 更新净值
          request({
            method: 'get',
            url: `http://localhost:${config.server.port || 8080}/myService/analyze/updateBaseInfo`
          }).then(() => {
            // 更好的估值源
            return request({
              method: 'get',
              url: `http://localhost:${config.server.port || 8080}/myService/analyze/betterValuation`
            });
          }).then(() => {
            // 添加净值记录
            return request({
              method: 'get',
              url: `http://localhost:${config.server.port || 8080}/myService/analyze/addRecentNetValue`
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