/**
 * Created by xiaobxia on 2018/1/23.
 */
module.exports = async function (ctx, next) {
  console.log(ctx.originalUrl)
  await next()
}
