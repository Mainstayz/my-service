/**
 * Created by xiaobxia on 2017/7/24.
 */
function getTag(obj) {
  if (obj === null) {
    return obj + "";
  }
  return typeof obj === "object" || typeof obj === "function" ?
    obj.constructor.name.toLowerCase() || "object" :
    typeof obj;
}
function isEmpty(value) {
  let empty = false;
  if (value) {
    let type = getTag(value);
    switch (type) {
      case 'string': {
        empty = value.trim() === '';
        break;
      }
      case 'array': {
        empty = !value.length;
        break;
      }
      case 'object': {
        empty = !Object.keys(value).length;
        break;
      }
      default: {
        break;
      }
    }
  } else {
    empty = value === '' || isNaN(value) || value === undefined || value === null;
  }
  return empty;
}
//'',' ',NaN,undefined,null,[],{}
module.exports = isEmpty;
