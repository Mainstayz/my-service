/**
 * Created by xiaobxia on 2018/1/25.
 */
const Proxy = require('../proxy');
const UserProxy = Proxy.User;
exports.getUserByName = async function (account, password) {
  const user = await UserProxy.getByName(account);
  if (!user) {
    throw new Error('用户不存在');
  }
  return user;
};
