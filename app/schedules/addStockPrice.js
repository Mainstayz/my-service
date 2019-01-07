/**
 * Created by xiaobxia on 2018/2/2.
 */
const schedule = require('node-schedule')
const request = require('request-promise')
const reqlib = require('app-root-path').require
const logger = require('../common/logger')
const config = reqlib('/config/index')
const scheduleService = require('../services/schedule')
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
let rule = new schedule.RecurrenceRule()

// 工作日定时更新估值
rule.dayOfWeek = [new schedule.Range(1, 5)]
rule.hour = [17]
// 执行6次，以防万一
let minute = []
for (let k = 1; k < 60; k += 10) {
  minute.push(k)
}
rule.minute = minute

const codeMap = {
  'chuangye': {
    code: 'sz399006',
    name: '创业',
    mix: true
  },
  'gangtie': {
    code: 'sz399440',
    name: '钢铁'
  },
  'jungong': {
    code: 'sz399959',
    name: '军工'
  },
  'yiyao': {
    code: 'sh000037',
    name: '医药'
  },
  'meitan': {
    code: 'sz399998',
    name: '煤炭'
  },
  'youse': {
    code: 'sh000823',
    name: '有色'
  },
  'jisuanji': {
    code: 'sz399363',
    name: '计算机'
  },
  'baijiu': {
    code: 'sz399997',
    name: '白酒'
  },
  'xinxi': {
    code: 'sh000993',
    name: '信息'
  },
  'xiaofei': {
    code: 'sh000990',
    name: '消费'
  },
  'baoxian': {
    code: 'sz399809',
    name: '保险'
  },
  'wulin': {
    code: 'sh000016',
    name: '50',
    mix: true
  },
  'chuanmei': {
    code: 'sz399971',
    name: '传媒'
  },
  'dianzi': {
    code: 'sz399811',
    name: '电子'
  },
  'yiliao': {
    code: 'sz399989',
    name: '医疗'
  },
  'shengwu': {
    code: 'sz399441',
    name: '生物'
  },
  'sanbai': {
    code: 'sh000300',
    name: '300',
    mix: true
  },
  'wubai': {
    code: 'sh000905',
    name: '500',
    mix: true
  },
  'yinhang': {
    code: 'sz399986',
    name: '银行'
  },
  'dichan': {
    code: 'sz399393',
    name: '地产'
  },
  'huanbao': {
    code: 'sh000827',
    name: '环保'
  },
  'shangzheng': {
    code: 'sh000001',
    name: '上证',
    mix: true
  },
  'zhengquan': {
    code: 'sz399437',
    name: '证券'
  },
  'jijian': {
    code: 'sz399995',
    name: '基建'
  },
  'qiche': {
    code: 'sz399432',
    name: '汽车'
  }
}
const codeList = []
for (let key in codeMap) {
  codeList.push(codeMap[key].code)
}

function addStockPrice () {
  scheduleService.getSchedule('addStockPrice').then((data) => {
    if (data && data.value === 'open') {
      let listTemp = []
      for (let i = 0; i < codeList.length; i++) {
        listTemp.push(codeList[i])
      }
      let flag = parseInt(Math.round() * 10) % 2 === 0
      if (flag) {
        listTemp.reverse()
      }
      for (let i = 0; i < listTemp.length; i++) {
        request({
          method: 'get',
          url: `http://localhost:${config.server.port || 8080}/${config.project.projectName}/webData/addStockPrice?code=${listTemp[i]}`
        }).catch(function (err) {
          logger.error(err)
        })
      }
    }
  })
}

const job = schedule.scheduleJob(rule, addStockPrice)

module.exports = job
