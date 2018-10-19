/**
 * Created by xiaobxia on 2017/7/20.
 */
exports.clone = function (target, filterFun) {
  let tempData = {}
  for (let key in target) {
    if (target.hasOwnProperty(key) && filterFun ? filterFun(key, target) : true) {
      tempData[key] = target[key]
    }
  }
  return tempData
}
exports.merge = function (target, value) {
  let tempData = {}
  for (let key in target) {
    if (target.hasOwnProperty(key)) {
      tempData[key] = target[key]
    }
  }
  for (let key in value) {
    if (value.hasOwnProperty(key)) {
      tempData[key] = value[key]
    }
  }
  return tempData
}
