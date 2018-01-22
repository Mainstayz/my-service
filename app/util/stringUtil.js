/**
 * Created by xiaobxia on 2017/11/1.
 */
module.exports = {
  hyphenToCamelCase(str) {
    let strArr = str.split('_');
    strArr[0] = strArr[0].toLowerCase();
    for (let i = 1, len2 = strArr.length; i < len2; i++) {
      let strTemp = strArr[i].toLowerCase();
      strArr[i] = strTemp.charAt(0).toUpperCase() + strTemp.substring(1);
    }
    return strArr.join('');
  },
  camelCaseToHyphen(str) {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
  }
};
