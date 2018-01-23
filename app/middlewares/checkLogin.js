/**
 * Created by xiaobxia on 2017/7/17.
 */

module.exports = async function (ctx, next) {
  const token = ctx.header.token;
  let user = null;
  try {
    user = ctx.token.verify(token);
  } catch (err) {
    next(err);
  }
  // if (user) {
  //   ctx.requestUser = user;
  //   next();
  // } else {
  //   const originalUrl = ctx.originalUrl;
  //   const projectName = ctx.localConfig.server.projectName;
  //   const filterPath = ['/auth'];
  //   let ifFilter = false;
  //   for (let k = 0; k < filterPath.length; k++) {
  //     if (originalUrl.startsWith(`/${projectName}${filterPath[k]}`)) {
  //       ifFilter = true;
  //       break;
  //     }
  //   }
  //   if (ifFilter) {
  //     next();
  //   } else {
  //     next();
  //   }
  // }
};
