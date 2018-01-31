const schedule = require('node-schedule');
const request = require('request-promise');
const reqlib = require('app-root-path').require;
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
rule.hour = 6;

const job = schedule.scheduleJob(rule, function(){
  request({
    method: 'get',
    url: `http://localhost:${config.server.port || 8080}/myService/fund/updateFundsInfo`
  });
});

module.exports = job;
