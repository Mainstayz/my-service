/**
 * Created by xiaobxia on 2018/4/1.
 */
const Proxy = require('../proxy')
const Dictionaries = Proxy.Dictionaries

/**
 * 通过键获取字典
 * @param key
 * @returns {Promise.<void>}
 */
exports.getByKey = async function (key) {
  return Dictionaries.findOne({ key })
}

/**
 * 获取关于基金分析的字典
 * @returns {Promise.<{}>}
 */
exports.getAnalyzeValue = async function () {
  const data = await Dictionaries.find({ type: 'analyze' })
  let mapData = {}
  data.forEach((item) => {
    mapData[item.key] = parseFloat(item.value)
  })
  return mapData
}

/**
 * 更新关于基金分析的字典
 * @returns {Promise.<{}>}
 */
exports.updateAnalyzeValue = async function (list) {
  let optionList = []
  for (let i = 0; i < list.length; i++) {
    optionList.push(Dictionaries.update({
      key: list[i].key,
      type: 'analyze'
    },
    { value: list[i].value }))
  }
  return Promise.all(optionList)
}
