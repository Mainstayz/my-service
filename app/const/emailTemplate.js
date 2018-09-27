/**
 * Created by xiaobxia on 2017/11/15.
 */
const moment = require('moment');

const registerVerifyTemplate = (option) => {
  return {
    //格式 name<mail>,发件人的名字<邮箱>
    from: `"Xiaobxia" <${option.sender}>`,
    //发送的
    to: option.userEmail,
    //标题
    subject: '注册验证邮箱',
    //html
    html: `<div><p>如果链接无法跳转，请复制以下链接地址至浏览器中打开</p><a href="${option.address}?code=${option.verifyCode}">${option.address}?code=${option.verifyCode}</a></div>`
  };
};

const verifyOpeningSuccessTemplate = (option) => {
  const nowTime = moment().format('YYYY-MM-DD HH:mm:ss');
  return {
    //格式 name<mail>,发件人的名字<邮箱>
    from: `"Xiaobxia" <${option.sender}>`,
    //发送的
    to: option.userEmail,
    //标题
    subject: '开盘验证成功',
    //html
    html: `<div>
            <h3 style="color: rgb(62, 179, 121)">开盘验证成功! ✌</h3>
            <p>确认${option.openMsg}</p>
            <p>完成于${nowTime}</p>
           </div>`
  };
};

const verifyOpeningErrorTemplate = (option) => {
  const nowTime = moment().format('YYYY-MM-DD HH:mm:ss');
  return {
    //格式 name<mail>,发件人的名字<邮箱>
    from: `"Xiaobxia" <${option.sender}>`,
    //发送的
    to: option.userEmail,
    //标题
    subject: '开盘验证失败',
    //html
    html: `<div>
            <h3 style="color: rgb(244, 51, 60)">开盘验证失败! 💔</h3>
            <p>发生错误，错误信息：</p>
            <p>${option.errorMsg}</p>
            <p>完成于${nowTime}</p>
           </div>`
  };
};

module.exports = {
  registerVerifyTemplate,
  verifyOpeningSuccessTemplate,
  verifyOpeningErrorTemplate
};
