/**
 * Created by xiaobxia on 2018/2/9.
 */
exports.countRate = function (numerator, denominator) {
  return Math.round(10000 * (numerator / denominator)) / 100;
};

exports.keepTwoDecimals = function (number) {
  return Math.round(100 * number) / 100;
};
