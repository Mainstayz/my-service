/**
 * Created by xiaobxia on 2017/7/17.
 */

module.exports = async function (ctx, next) {
  const originalUrl = ctx.originalUrl;
  const projectName = ctx.localConfig.project.projectName;
  const filterPath = ['/auth', '/analyze', '/schedule'];
  let ifFilter = false;
  for (let k = 0; k < filterPath.length; k++) {
    if (originalUrl.startsWith(`/${projectName}${filterPath[k]}`)) {
      ifFilter = true;
      break;
    }
  }
  if (ifFilter) {
    ctx.logger.trace('in filter route');
    await next();
  } else {
    ctx.logger.trace('in check route');
    const token = ctx.header.token || '';
    try {
      ctx.tokenRaw = ctx.token.verify(token);
    } catch (err) {
      ctx.logger.trace('in token error');
      ctx.body = ctx.refail({
        code: '401'
      });
      return;
    }
    await next();
  }
};
