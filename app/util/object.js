/**
 * Created by xiaobxia on 2017/7/20.
 */
exports.clone = function (target, filterFun) {
  let tempData = {};
  for (let key in target) {
    if (target.hasOwnProperty(key) && filterFun ? filterFun(key, target) : true) {
      tempData[key] = target[key];
    }
  }
  return tempData;
};
