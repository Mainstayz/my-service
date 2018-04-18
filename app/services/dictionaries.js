/**
 * Created by xiaobxia on 2018/4/1.
 */
const Proxy = require('../proxy');
const Dictionaries = Proxy.Dictionaries;

exports.getByKey = async function (key) {
  return Dictionaries.findOne({key});
};

exports.getAnalyzeValue = async function () {
  const data = await Dictionaries.find({type: 'analyze'});
  let mapData = {};
  data.forEach((item) => {
    mapData[item.key] = parseFloat(item.value);
  });
  return mapData;
};

exports.updateAnalyzeValue = async function (list) {
  let optionList = [];
  for (let i = 0; i < list.length; i++) {
    optionList.push(Dictionaries.update({
        key: list[i].key,
        type: 'analyze'
      },
      {value: list[i].value}))
  }
  return Promise.all(optionList);
};
