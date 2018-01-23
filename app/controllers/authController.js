exports.login = async function (ctx) {
  const query = ctx.request.body;
  const data = this.validateData({
    account: {type: 'string', required: true},
    password: {type: 'string', required: true}
  }, query);
};

exports.checkLogin = async function (ctx, next) {
  const token = ctx.header.token;
  let user = null;
  try {
    user = ctx.token.verify(token);
    user.isLogin = true;
    ctx.body = ctx.resuccess(user);
  } catch (err) {
    ctx.body = ctx.resuccess({
      isLogin: false
    });
  }
};
