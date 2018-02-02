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
      netValueDate: $('#oTable thead tr').eq(0).find('th').eq(7).text(),
      funds,
      valuationDate: $('#oTable thead tr').eq(0).find('th').eq(4).text().substring(0, 9)
    };
  }).catch(function (err) {
    logger.error(err);
  });
};

// 好买得到所有基金的估值信息
exports.getFundsInfoHaomai = function () {
  return request({
    method: 'get',
    url: `https://www.howbuy.com/fund/valuation/index.htm`,
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
    console.log({
      netValueDate: $('#nTab2_Con1 thead tr').eq(0).find('th').eq(7).text().substring(0, 9),
      valuationDate: $('#nTab2_Con1 thead tr').eq(0).find('th').eq(4).text().substring(0, 9)
    })
    return {
      netValueDate: $('#nTab2_Con1 thead tr').eq(0).find('th').eq(7).text().substring(0, 9),
      funds,
      valuationDate: $('#nTab2_Con1 thead tr').eq(0).find('th').eq(4).text().substring(0, 9)
    };
  }).catch(function (err) {
    logger.error(err);
  });
};

this.getFundsInfoHaomai()

