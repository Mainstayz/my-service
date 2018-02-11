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

exports.User = require('./user');
exports.LogAudit = require('./log_audit');
exports.Fund = require('./fund');
exports.UserFund = require('./user_fund');
exports.Strategy = require('./strategy');
exports.fields_table = require('./fields_table');
