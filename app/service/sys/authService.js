const moment = require('moment');
const BaseService = require('../baseService');


module.exports = class LoginService extends BaseService {
  constructor(connection) {
    super(connection);
  }

  async login(account, password) {
    const errorMessage = this.localConst.errorMessage;
    const userORM = this.ORMs.userORM(this.connection);
    let dbResult = await userORM.getUserRawByAccount(account);
    this.checkDBResult(dbResult, errorMessage.ACCOUNT_OR_PWD_ERROR);
    let user = dbResult[0];
    const isForceLogin = user['forceLogin'] === 'Y';
    let isLockBefore = user['isLocked'] === 'Y';
    //强制登录
    if(isForceLogin) {
      return user;
    }
    //判断解锁
    if (isLockBefore) {
      if (moment().isAfter(user['unlockDate'])) {
        await userORM.updateUserByUserId(user['userId'], {
          loginFail: 0,
          isLocked: 'N',
          unLockDate: null
        });
        //得到用户新状态
        dbResult = await userORM.getUserByUserId(user['userId']);
        user = dbResult[0];
      } else {
        this.throwError(errorMessage.LOCK_USER);
      }
    }
    //验证密码
    if (user['password'] === password) {
      //清空尝试，之前没锁定并且失败数不为0
      if (!isLockBefore && user['loginFail'] !==0) {
        await userORM.updateUserByUserId(user['userId'], {
          loginFail: 0,
          isLocked: 'N',
          unlockDate: null
        });
      }
      const logAuditORM = this.ORMs.logAuditORM(this.connection);
      await logAuditORM.addLog({
        logType: 'login',
        userId: user['userId'],
        userName: user['userName']
      });
      return user;
    } else {
      //密码不匹配
      let updateData = null;
      if (user['loginFail'] > 6) {
        //失败大于6次
        updateData = {
          isLocked: 'Y',
          unlockDate: moment().add(3, 'minutes').format('YYYY-M-D HH:mm:ss')
        };
      } else {
        updateData = {
          loginFail: 1 + user['loginFail']
        };
      }
      await userORM.updateUserByUserId(user['userId'], updateData);
      this.throwError(errorMessage.ACCOUNT_OR_PWD_ERROR);
    }
  }

  async logout(userInfo) {
    const logAuditORM = this.ORMs.logAuditORM(this.connection);
    await logAuditORM.addLog({
      logType: 'logout',
      ...userInfo
    });
  }
};
