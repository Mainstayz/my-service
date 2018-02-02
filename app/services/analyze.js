/**
 * Created by xiaobxia on 2018/2/2.
 */
const Proxy = require('../proxy');
const fundUtil = require('../util/fund');

const FundProxy = Proxy.Fund;
const FundAnalyzeProxy = Proxy.FundAnalyze;

// 分析前，需要确定表中有数据了
exports.updateValuation = async function () {
  // 只更新表中已经有的
  const funds = await FundProxy.find({});
  const fetchList = Promise.all([
    fundUtil.getFundsInfo(),
    fundUtil.getFundsInfoHaomai()
  ]);
  const fetchData = await fetchList;
  let updateList = [];
  for (let k = 0; k < funds.length; k++) {
    let tiantian = 0;
    let haomai = 0;
    for (let i = 0; i < fetchData[0].length; i++) {
      if (fetchData[0][i].code === funds[k].code) {
        tiantian = fetchData[0][i].valuation;
        break;
      }
    }
    for (let i = 0; i < fetchData[1].length; i++) {
      if (fetchData[1][i].code === funds[k].code) {
        haomai = fetchData[1][i].valuation;
        break;
      }
    }
    updateList.push(FundAnalyzeProxy.updateByCode(funds[k].code,{
      valuation_tiantian: tiantian,
      valuation_haomai: haomai || tiantian,
    }))
  }
  return Promise.all(updateList);
};

exports.getFundAnalyzeByIds = async function (ids) {
  return FundAnalyzeProxy.find({_id: {$in: [...ids]}});
};

exports.betterValuation = async function () {

};
