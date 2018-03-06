/**
 * Created by xiaobxia on 2018/2/2.
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
// 10-12,13-16
rule.hour = [10, 11, 13, 14, 15];
let minute = [];
for (let k = 0; k < 60; k += 3) {
  minute.push(k);
}
rule.minute = minute;

function updateValuation() {
  scheduleService.getSchedule('updateValuation').then((data)=>{
    if (data.open) {
      request({
        method: 'get',
        url: `http://localhost:${config.server.port || 8080}/myService/analyze/updateValuation`
      }).catch(function (err) {
        logger.error(err);
      });
    }
  });
}

const job = schedule.scheduleJob(rule, updateValuation);

module.exports = job;
