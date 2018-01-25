/**
 * Created by xiaobxia on 2018/1/24.
 */
const models = require('./app/models/index');
// 通过类创建
models.User.updateOne({name: 'xiaobxia'}, {password: '3f71b00f7ad3aa3d676b188628702fc4'}).then((doc) => {
  console.log(doc);
});
