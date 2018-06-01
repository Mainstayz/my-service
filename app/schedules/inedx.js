/**
 * Created by xiaobxia on 2018/1/31.
 */
// exports.updateFundsBaseInfo = require('./updateFundsBaseInfo');
//
const env = process.env.NODE_ENV;
const isDev = env === 'dev';
if (!isDev) {
  exports.updateValuation = require('./updateValuation');
  exports.closeUpdateValuation = require('./closeUpdateValuation');
  exports.verifyOpening = require('./verifyOpening');
  exports.deleteUnSellFund = require('./deleteUnSellFund');
  exports.updateRate = require('./updateRate');
  exports.closeUpdateRate = require('./closeUpdateRate');
}

