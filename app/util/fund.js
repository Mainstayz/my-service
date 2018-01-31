/**
 * Created by xiaobxia on 2018/1/31.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const Iconv = require('iconv-lite');

exports.getFundInfo = function (code) {
  return request({
    method: 'get',
    url: `http://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`,
    encoding: 'utf-8'
  }).then((body) => {
    const jsonData = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
    return JSON.parse(jsonData);
  });
};

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
      if (cols.eq(-1).hasClass('bi') && cols.eq(4).text() !== '---' && cols.eq(9).text() !== '---') {
        funds.push({
          code: cols.eq(2).text(),
          name: cols.eq(3).find('a').eq(0).text(),
          valuation: parseFloat(cols.eq(4).text()),
          net_value: parseFloat(cols.eq(9).text())
        });
      }
    });
    return funds;
  });
};
