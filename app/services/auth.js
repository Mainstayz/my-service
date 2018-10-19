/**
 * Created by xiaobxia on 2018/1/23.
 */
const Proxy = require('../proxy')
const UserProxy = Proxy.User
exports.login = async function (account, password) {
  const user = await UserProxy.findOne({ name: account })
  if (!user) {
    throw new Error('用户不存在')
  }
  if (user.password === password) {
    return user
  } else {
    throw new Error('账户名或密码不正确')
  }
}
