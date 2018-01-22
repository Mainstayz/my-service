/**
 * Created by xiaobxia on 2017/10/31.
 */
const AuthService = require('./sys/authService');
const UserService = require('./sys/userService');
module.exports = {
  authService(connection){
    return new AuthService(connection);
  },
  userService(connection) {
    return new UserService(connection);
  }
};
