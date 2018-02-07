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
//工作日早上4点执行
rule.dayOfWeek = [new schedule.Range(1, 5)];
rule.hour = 4;

// 实际上，净值要到第二天早上才有
function updateFundsBaseInfo() {
  request({
    method: 'get',
    url: `http://localhost:${config.server.port || 8080}/myService/analyze/updateBaseInfo`
  }).catch(function (err) {
    logger.error(err);
  });
  logger.info(`于${new Date().toLocaleString()}执行更新基金单位净值`);
}

//用于更新基金净值
const job = schedule.scheduleJob(rule, updateFundsBaseInfo);

module.exports = job;


