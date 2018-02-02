exports.login = async function (ctx) {
  const query = ctx.request.body;
  try {
    const data = ctx.validateData({
      account: {type: 'string', required: true},
      password: {type: 'string', required: true},
      platform: {type: 'string', required: true, include: ['mobile', 'pc']}
    }, query);
    const userRaw = await ctx.services.auth.login(data.account, data.password);
    const user = {
      name: userRaw.name
    };
    const token = ctx.token.sign(user, 60 * 60);
    ctx.services.log.addLogAudit({
      log_type: 'login',
      platform: data.platform,
      user_id: userRaw._id
    });
    ctx.body = ctx.resuccess({
      token,
      ...user
    });
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};

exports.checkLogin = async function (ctx) {
  const token = ctx.query.token;
  if (token) {
    try {
      const tokenRaw = ctx.token.verify(token);
      ctx.body = ctx.resuccess({
        name: tokenRaw.name,
        isLogin: true,
        token
      });
    } catch (err) {
      ctx.body = ctx.resuccess({
        isLogin: false
      });
    }
  } else {
    ctx.body = ctx.resuccess({
      isLogin: false
    });
  }
};

exports.logout = async function (ctx) {
  const query = ctx.query;
  try {
    const data = ctx.validateData({
      token: {type: 'string', required: false},
      platform: {type: 'string', required: true, include: ['mobile', 'pc']}
    }, query);
    const tokenRaw = ctx.token.verify(data.token);
    const userRaw = await ctx.services.user.getUserByName(tokenRaw.name);
    ctx.services.log.addLogAudit({
      log_type: 'logout',
      platform: data.platform,
      user_id: userRaw._id
    });
    ctx.body = ctx.resuccess();
  } catch (err) {
    ctx.body = ctx.refail(err);
  }
};
