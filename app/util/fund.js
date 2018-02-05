/**
 * Created by xiaobxia on 2018/1/31.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const Iconv = require('iconv-lite');
const logger = require('../common/logger');

// 天天得到单个基金的信息
exports.getFundInfo = function (code) {
  return request({
    method: 'get',
    url: `http://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`,
    encoding: 'utf-8'
  }).then((body) => {
    const jsonData = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
    return JSON.parse(jsonData);
  }).catch(function (err) {
    logger.error(err);
  });
};

// 天天得到所有基金的信息
exports.getFundsInfo = function () {
  return request({
    method: 'get',
    url: `http://fund.eastmoney.com/fundguzhi.html`,
    encoding: null,
    transform: function (body) {
      return cheerio.load(Iconv.decode(body, 'gb2312').toString());
    }
  }).then(($) => {
    // 预估涨跌幅
    const items = $('#oTable tbody tr');
    let funds = [];
    items.each(function () {
      const cols = $(this).find('td');
      // 是可购的
      if (cols.eq(4).text() !== '---' && cols.eq(9).text() !== '---') {
        funds.push({
          code: cols.eq(2).text(),
          name: cols.eq(3).find('a').eq(0).text(),
          valuation: parseFloat(cols.eq(4).text()),
          net_value: parseFloat(cols.eq(9).text()),
          sell: cols.eq(-1).hasClass('bi')
        });
      }
    });
    return {
      netValueDate: $('#oTable thead tr').eq(0).find('th').eq(7).text().substring(0, 10),
      funds,
      valuationDate: $('#oTable thead tr').eq(0).find('th').eq(4).text().substring(0, 10)
    };
  }).catch(function (err) {
    logger.error(err);
  });
};

// 好买得到所有基金的估值信息
exports.getFundsInfoHaomai = function () {
  return request({
    method: 'get',
    url: `http://www.howbuy.com/fund/valuation/index.htm`,
    transform: function (body) {
      return cheerio.load(body);
    }
  }).then(($) => {
    const tbody = $('#nTab2_Con1 tbody');
    const texts = $('#nTab2_Con1 textarea');
    texts.each(function () {
      tbody.append($(this).text());
    });
    // 预估涨跌幅
    const items = $('#nTab2_Con1 tbody tr');
    let funds = [];
    items.each(function () {
      const cols = $(this).find('td');
      // 是可购的
      funds.push({
        code: cols.eq(2).text(),
        valuation: parseFloat(cols.eq(4).text())
      });
    });
    return {
      netValueDate: $('#nTab2_Con1 thead tr').eq(0).find('td').eq(7).text().substring(0, 10),
      funds,
      valuationDate: $('#nTab2_Con1 thead tr').eq(0).find('td').eq(4).text().substring(0, 10)
    };
  }).catch(function (err) {
    logger.error(err);
  });
};

exports.getRecentNetValue = function (code, days) {
  return request({
    method: 'get',
    url: `http://api.fund.eastmoney.com/f10/lsjz?callback=jQuery18306565218995177082_${Date.now()}&fundCode=${code}&pageIndex=1&pageSize=${days || 260}&startDate=&endDate=&_=${Date.now()}`,
    encoding: 'utf-8',
    headers: {
      Referer: `http://fund.eastmoney.com/f10/jjjz_${code}.html`
    }
  }).then((body) => {
    const jsonData = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
    const list = JSON.parse(jsonData).Data.LSJZList;
    let list2 = [];
    list.forEach(function (item) {
      list2.push({
        // 净值增长率
        JZZZL: parseFloat(item.JZZZL || 0),
        // 日期
        FSRQ: item.FSRQ,
        // 单位净值
        DWJZ: parseFloat(item.DWJZ || 0),
      });
    });
    return list2;
  }).catch(function (err) {
    logger.error(err);
  });
};

