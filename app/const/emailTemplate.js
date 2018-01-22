/**
 * Created by xiaobxia on 2017/11/15.
 */
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

module.exports = {
  registerVerifyTemplate
};
