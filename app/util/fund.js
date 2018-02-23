/**
 * Created by xiaobxia on 2018/1/31.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const Iconv = require('iconv-lite');
const axios = require('axios');
const logger = require('../common/logger');

const env = process.env.NODE_ENV;
const isDev = env === 'dev';

// 天天得到单个基金的信息
exports.getFundInfo = function (code) {
  if (isDev) {
    return request({
      method: 'get',
      url: `http://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`,
      encoding: 'utf-8'
    }).then((body) => {
      const jsonData = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
      const data = JSON.parse(jsonData);
      return {
        code: data.fundcode,
        name: data.name,
        net_value: data.dwjz,
        net_value_date: data.jzrq,
        valuation: data.gsz,
        valuation_date: data.gztime,
        valuation_rate: data.gszzl
      };
    }).catch(function (err) {
      logger.error(err);
    });
  }
  return axios.get(`http://localhost:3006/fundData/getFundInfo?code=${code}`).then((res) => {
    return res.data;
  });
};

// 天天得到所有基金的信息
exports.getFundsInfo = function () {
  if (isDev) {
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
        net_value_date: $('#oTable thead tr').eq(0).find('th').eq(7).text().substring(0, 10),
        funds,
        valuation_date: $('#oTable thead tr').eq(0).find('th').eq(4).text().substring(0, 10)
      };
    }).catch(function (err) {
      logger.error(err);
    });
  }
  return axios.get('http://localhost:3006/fundData/getFundsInfo').then((res) => {
    return res.data;
  });
};

// 好买得到所有基金的估值信息
exports.getFundsInfoHaomai = function () {
  if (isDev) {
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
        net_value_date: $('#nTab2_Con1 thead tr').eq(0).find('td').eq(7).text().substring(0, 10),
        funds,
        valuation_date: $('#nTab2_Con1 thead tr').eq(0).find('td').eq(4).text().substring(0, 10)
      };
    }).catch(function (err) {
      logger.error(err);
    });
  }
  return axios.get('http://localhost:3006/fundData/getFundsInfoHaomai').then((res) => {
    return res.data;
  });
};

exports.getRecentNetValue = function (code, days) {
  if (isDev) {
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
          valuation_rate: parseFloat(item.JZZZL || 0),
          // 日期
          net_value_date: item.FSRQ,
          // 单位净值
          net_value: parseFloat(item.DWJZ || 0),
        });
      });
      return list2;
    }).catch(function (err) {
      logger.error(err);
    });
  }
  return axios.get(`http://localhost:3006/fundData/getFundsInfoHaomai?code=${code}&days=${days}`).then((res) => {
    return res.data;
  });
};

