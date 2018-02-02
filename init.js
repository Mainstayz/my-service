/**
 * Created by xiaobxia on 2018/1/24.
 */
const proxys = require('./app/proxy/index');
// 通过类创建
proxys.User.newAndSave({name: 'xiaobxia'}, {password: '3f71b00f7ad3aa3d676b188628702fc4'}).then((doc) => {
  console.log(doc);
});
