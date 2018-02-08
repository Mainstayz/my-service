/**
 * Created by xiaobxia on 2018/1/29.
 */
// 获去连续相同正负的信息
function getSame(list, index) {
  let end = index;
  let start = index;
  let values = [list[index]];
  if (list[index]['JZZZL'] > 0 || list[index]['JZZZL'] === 0) {
    for (let k = index + 1; k < list.length; k++) {
      if (list[k]['JZZZL'] > 0 || list[k]['JZZZL'] === 0) {
        values.push(list[k]);
        end = k;
      } else {
        break;
      }
    }
    for (let k = index - 1; k >= 0; k--) {
      if (list[k]['JZZZL'] > 0 || list[k]['JZZZL'] === 0) {
        values.unshift(list[k]);
        start = k;
      } else {
        break;
      }
    }
  } else {
    for (let k = index + 1; k < list.length; k++) {
      if (list[k]['JZZZL'] < 0 || list[k]['JZZZL'] === 0) {
        values.push(list[k]);
        end = k;
      } else {
        break;
      }
    }
    for (let k = index - 1; k >= 0; k--) {
      if (list[k]['JZZZL'] < 0 || list[k]['JZZZL'] === 0) {
        values.unshift(list[k]);
        start = k;
      } else {
        break;
      }
    }
  }
  return {
    start,
    end,
    values
  };
}

// 删除头尾的脏数据
function deleteStartAndEnd(list) {
  let start = getSame(list, 0).end + 1;
  let end = getSame(list, list.length - 1).start;
  return list.slice(start, end);
}

// 计算涨跌的个数各是多少
exports.getUpAndDownCount = function (list) {
  let up = 0;
  let down = 0;
  let equal = 0;
  for (let i = 0; i < list.length; i++) {
    let a = list[i]['JZZZL'];
    if (a > 0) {
      up++;
    } else if (a === 0) {
      equal++;
    } else {
      down++;
    }
  }
  return {
    total: list.length,
    //涨的天数
    up,
    //平的天数
    equal,
    //跌的天数
    down
  };
};

// 获取涨跌值分布
exports.getUpAndDownDistribution = function (list) {
  const step = 0.5;
  let map = {};
  for (let i = 0; i < list.length; i++) {
    let ratio = list[i]['JZZZL'];
    for (let k = 0; k < 20; k++) {
      const start = k * step;
      const end = (k + 1) * step;
      // 正的, 不包括0
      if (start < ratio && (ratio <= end)) {
        const key = `${start}~${end}`;
        // 在某一区间出现次数
        if (map[key]) {
          // 记录
          map[key].times++;
          map[key].values.push(ratio);
        } else {
          map[key] = {
            start,
            end,
            times: 1,
            values: [ratio],
            continues: {
              times: 0,
              values: []
            }
          };
        }
        if (list[i + 1] && list[i + 1]['JZZZL'] > 0) {
          if (map[key].continues) {
            map[key].continues.times++;
            map[key].continues.values.push(list[i + 1]['JZZZL']);
          }
        }
        break;
        // 负的，包括零
      } else if (-end < ratio && ratio <= -start) {
        const key = `-${end}~-${start}`;
        if (map[key]) {
          map[key].times++;
          map[key].values.push(ratio);
        } else {
          map[key] = {
            start: -end,
            end: -start,
            times: 1,
            values: [ratio],
            continues: {
              times: 0,
              values: []
            }
          };
        }
        if (list[i + 1] && list[i + 1]['JZZZL'] < 0) {
          if (map[key].continues) {
            map[key].continues.times++;
            map[key].continues.values.push(list[i + 1]['JZZZL']);
          }
        }
        break;
      }
    }
  }
  let list1 = [];
  let len = 0;
  for (let k in map) {
    len += map[k].times;
    list1.push({
      range: k,
      values: map[k].values,
      times: map[k].times,
      continues: map[k].continues
    });
  }
  if (len !== list.length) {
    console.error('数据丢失');
  }
  list1.sort(function (a, b) {
    return parseFloat(a.range.split('~')[0]) - parseFloat(b.range.split('~')[0]);
  });
  return {
    list: list1,
    map
  };
};

// 获取单日最大跌涨幅
exports.getMaxUpAndDown = function (list) {
  let newList = [];
  for (let i = 0; i < list.length; i++) {
    newList.push(list[i]);
  }
  // 大的在右边
  newList.sort(function (a, b) {
    return parseFloat(a['JZZZL']) - parseFloat(b['JZZZL'])
  });
  return {
    // 单日最大涨幅
    maxUp: newList[newList.length - 1]['JZZZL'],
    // 单日最大跌幅
    maxDown: newList[0]['JZZZL']
  };
};
// 连涨和连跌天数
exports.getMaxUpIntervalAndMaxDownInterval = function (list) {
  let newList = [];
  // 翻转
  for (let i = list.length - 1; i >= 0; i--) {
    newList.push(list[i]);
  }
  let maxUpInterval = 0;
  let maxUpTemp = 0;
  let maxDownInterval = 0;
  let maxDownTemp = 0;
  let upInterval = {};
  let downInterval = {};

  let index = 0;
  // 涨
  for (let i = 0; i < newList.length; i++) {
    if (i === index) {
      // console.log(index)
      // 包括0
      if (newList[i]['JZZZL'] > 0 || newList[i]['JZZZL'] === 0) {
        maxUpTemp = 1;
        let sum = newList[i]['JZZZL'];
        for (let j = i + 1; j < newList.length; j++) {
          index = j;
          if (newList[j]['JZZZL'] > 0 || newList[j]['JZZZL'] === 0) {
            sum += newList[j]['JZZZL'];
            maxUpTemp++;
          } else {
            break;
          }
        }
        sum = parseInt(sum * 100) / 100;
        if (upInterval[maxUpTemp]) {
          upInterval[maxUpTemp].times++;
          upInterval[maxUpTemp].rates.push(sum);
        } else {
          upInterval[maxUpTemp] = {};
          upInterval[maxUpTemp].times = 1;
          upInterval[maxUpTemp].rates = [sum];
        }
        if (maxUpInterval < maxUpTemp) {
          maxUpInterval = maxUpTemp;
        }
      }

      if (newList[i]['JZZZL'] < 0 || newList[i]['JZZZL'] === 0) {
        maxDownTemp = 1;
        let sum = newList[i]['JZZZL'];
        for (let j = i + 1; j < newList.length; j++) {
          index = j;
          if (newList[j]['JZZZL'] < 0 || newList[j]['JZZZL'] === 0) {
            sum += newList[j]['JZZZL'];
            maxDownTemp++;
          } else {
            break;
          }
        }
        sum = parseInt(sum * 100) / 100;
        if (downInterval[maxDownTemp]) {
          downInterval[maxDownTemp].times++;
          downInterval[maxDownTemp].rates.push(sum);
        } else {
          downInterval[maxDownTemp] = {};
          downInterval[maxDownTemp].times = 1;
          downInterval[maxDownTemp].rates = [sum];
        }
        if (maxDownInterval < maxDownTemp) {
          maxDownInterval = maxDownTemp
        }
      }
    }
  }
  return {
    days: newList.length,
    // 最多连涨天数
    maxUpInterval,
    // 最多连跌天数
    maxDownInterval,
    // 涨的天数的分布统计
    upInterval,
    // 跌的天数的分布统计
    downInterval
  };
};

//获得已经延续的天数
exports.continueDays = function (now, list) {
  let maxUpTemp = 0;
  maxUpTemp = 1;
  if (now > 0 || now === 0) {
    for (let j = 0; j < list.length; j++) {
      if (list[j]['JZZZL'] > 0 || list[j]['JZZZL'] === 0) {
        maxUpTemp++;
      } else {
        break;
      }
    }
  } else {
    for (let j = 0; j < list.length; j++) {
      if (list[j]['JZZZL'] < 0 || list[j]['JZZZL'] === 0) {
        maxUpTemp++;
      } else {
        break;
      }
    }
  }
  return maxUpTemp;
};