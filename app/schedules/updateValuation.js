/**
 * Created by xiaobxia on 2018/2/2.
 */
const schedule = require('node-schedule');
const request = require('request-promise');
const reqlib = require('app-root-path').require;
const logger = require('../common/logger');
const config = reqlib('/config/index');
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
//工作日早上6点执行
rule.dayOfWeek = [new schedule.Range(1, 5)];
rule.hour = [9, 10, 11, 13, 14, 15];
let minute = [];
for (let k = 0; k < 60; k += 20) {
  minute.push(k);
}
rule.minute = minute;

function updateValuation() {
  request({
    method: 'get',
    url: `http://localhost:${config.server.port || 8080}/myService/analyze/updateValuation`
  }).catch(function (err) {
    logger.error(err);
  });
  logger.info(`于${new Date().toLocaleString()}执行更新基金估值`);
}

const job = schedule.scheduleJob(rule, updateValuation);

module.exports = job;
