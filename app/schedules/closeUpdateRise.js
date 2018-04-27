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
//工作日，17点关闭定时更新估值
rule.dayOfWeek = [new schedule.Range(1, 5)];
rule.hour = [17];

function closeUpdateRise() {
  scheduleService.getSchedule('closeUpdateRise').then((data)=>{
    if (data && data.value === 'open') {
      scheduleService.updateSchedule('updateRise', {
        value: 'close'
      }).then(()=>{
      });
    }
  });
}

const job = schedule.scheduleJob(rule, closeUpdateRise);

module.exports = job;
