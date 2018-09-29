/**
 * Created by xiaobxia on 2018/1/24.
 */
const proxys = require('./app/proxy/index');
// 通过类创建
proxys.User.newAndSave({
  name: 'xiaobxia',
  password: '3f71b00f7ad3aa3d676b188628702fc4'
}).then((doc) => {
  console.log(doc);
});
proxys.Dictionaries.newAndSave({
  "key" : "verifyOpening",
  "describe" : "定时检查是否开盘",
  "type" : "schedule",
  "value" : "close"
}).then((doc) => {
  console.log(doc);
});
proxys.Dictionaries.newAndSave({
  "key" : "updateValuation",
  "describe" : "定时更新估值",
  "type" : "schedule",
  "value" : "close",
}).then((doc) => {
  console.log(doc);
});
proxys.Dictionaries.newAndSave({
  "key" : "closeUpdateValuation",
  "describe" : "定时关闭更新估值任务",
  "type" : "schedule",
  "value" : "close"
}).then((doc) => {
  console.log(doc);
});
proxys.Dictionaries.newAndSave({
  "key" : "monthSlumpValue",
  "type" : "analyze",
  "value" : "-8"
}).then((doc) => {
  console.log(doc);
});
proxys.Dictionaries.newAndSave({
  "key" : "halfMonthSlumpValue",
  "type" : "analyze",
  "value" : "-7"
}).then((doc) => {
  console.log(doc);
});
proxys.Dictionaries.newAndSave({
  "key" : "monthBoomValue",
  "type" : "analyze",
  "value" : "5"
}).then((doc) => {
  console.log(doc);
});
proxys.Dictionaries.newAndSave({
  "key" : "halfMonthBoomValue",
  "type" : "analyze",
  "value" : "4"
}).then((doc) => {
  console.log(doc);
});
proxys.Dictionaries.newAndSave({
  "key" : "updateRate",
  "describe" : "定时更新涨幅",
  "type" : "schedule",
  "value" : "close"
}).then((doc) => {
  console.log(doc);
});
proxys.Dictionaries.newAndSave({
  "key" : "closeUpdateRate",
  "describe" : "定时关闭更新涨幅任务",
  "type" : "schedule",
  "value" : "close"
}).then((doc) => {
  console.log(doc);
});
proxys.Dictionaries.newAndSave({
  "key" : "lastUpdateValuationTime",
  "value" : "2018-09-27 15:58:14"
}).then((doc) => {
  console.log(doc);
});
proxys.Dictionaries.newAndSave({
  "key" : "opening_records",
  "value" : "[\"2018-09-28\"]"
}).then((doc) => {
  console.log(doc);
});
