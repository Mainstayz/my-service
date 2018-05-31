/**
 * Created by xiaobxia on 2017/11/1.
 */
module.exports = {
  /**
   * 连字符转驼峰
   * @param str
   * @returns {string}
   */
  hyphenToCamelCase(str) {
    let strArr = str.split('_');
    strArr[0] = strArr[0].toLowerCase();
    for (let i = 1, len2 = strArr.length; i < len2; i++) {
      let strTemp = strArr[i].toLowerCase();
      strArr[i] = strTemp.charAt(0).toUpperCase() + strTemp.substring(1);
    }
    return strArr.join('');
  },
  /**
   * 驼峰转连字符
   * @param str
   * @returns {string}
   */
  camelCaseToHyphen(str) {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
  }
};
