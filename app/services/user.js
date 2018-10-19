/**
 * Created by xiaobxia on 2018/1/25.
 */
const Proxy = require('../proxy')
const UserProxy = Proxy.User

exports.getUserByName = async function (name) {
  const user = await UserProxy.findOne({ name: name })
  if (!user) {
    throw new Error('用户不存在')
  }
  return user
}
