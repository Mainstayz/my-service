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
  data.forEach((item)=>{
    mapData[item.key] = parseFloat(item.value);
  });
  return mapData;
};
