const mongoose = require('mongoose');
const reqlib = require('app-root-path').require;
const config = reqlib('/config/index');

mongoose.Promise = Promise;
mongoose.connect(config.db, {
  server: {
    poolSize: 20
  }
}, (err) => {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});

//模型
exports.User = require('./user').model;
exports.LogAudit = require('./log_audit').model;
exports.Fund = require('./fund').model;
exports.UserNetValue = require('./user_net_value').model;
exports.UserFund = require('./user_fund').model;
exports.FocusFund = require('./focus_fund').model;
exports.OptionalFund = require('./optional_fund').model;
exports.Dictionaries = require('./dictionaries').model;

//字段
exports.fields_table = require('./fields_table');

