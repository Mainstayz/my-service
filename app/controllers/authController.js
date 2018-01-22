const BaseController = require('baseController');

module.exports = class AuthController extends BaseController {
  /**
   * POST
   * account
   * password
   */
  async login(ctx) {
    const query = ctx.request.body;
    const data = {
      account: query.account,
      password: query.password
    };
    this.validate(ctx, {
      account: {type: 'string', required: true},
      password: {type: 'string', required: true}
    }, data);
    let connection = null;
    try {
      connection = await this.mysqlGetConnection();
      const authService = this.services.authService(connection);
      let user = await authService.login(data.account, data.password);
      let userInfo = {userId: user.userId, userName: user.userName, active: user.active};
      this.setSessionUser(ctx.session, userInfo);
      this.wrapResult(ctx, {data: {login: true, ...userInfo}});
      this.mysqlRelease(connection);
    } catch (error) {
      this.mysqlRelease(connection);
      if (error.type) {
        this.wrapResult(ctx, {data: {msg: error.message, login: false}});
      } else {
        throw error;
      }
    }
  }

  /**
   * GET
   */
  async checkLogin(ctx) {
    let userInfo = this.getSessionUser(ctx.session);
    // session的id一般只有在使用缓存层的时候会用到
    this.wrapResult(ctx, {
      data: {
        isLogin: !!userInfo,
        ...userInfo
      }
    });
  }

  /**
   * GET
   */
  async logout(ctx) {
    const userInfoRaw = this.getSessionUser(ctx.session);
    const userInfo = {
      userId: userInfoRaw.userId,
      userName: userInfoRaw.userName
    };
    if (userInfo) {
      let connection = null;
      try {
        connection = await this.mysqlGetConnection();
        this.mysqlBeginTransaction(connection);
        const authService = this.services.authService(connection);
        await authService.logout(userInfo);
        this.mysqlCommit(connection);
        this.mysqlRelease(connection);
      } catch (error) {
        this.mysqlRollback(connection);
        this.mysqlRelease(connection);
        throw error;
      }
    }
    ctx.session = null;
    this.wrapResult(ctx);
  }
};
