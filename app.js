const Koa = require('koa');
const bluebird = require('bluebird');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const base = require('./app/base');
const router = require('./app/routes/index');
const log = require('./app/common/logger');
const config = require('./config/index');

global.Promise = bluebird;
const env = process.env.NODE_ENV;
const isDev = env === 'dev';

const app = new Koa();
// 加入全局信息
base(app);

// session
const session_secret = config.server.session_secret;
app.keys = [session_secret];
const CONFIG = {
  key: session_secret,
  maxAge: 1000 * 60 * 20,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: true,
};
app.use(session(CONFIG, app));

// post
app.use(bodyParser());

// 路由，默认拥有404
app.use(router.routes());

// 错误处理
app.on('error', (err, ctx) => {
  log.error(err);
});

// 监听
const port = config.server.port || 8080;
app.listen(port, () => {
  console.log(`server started at localhost:${port}`);
  console.log(`当前环境是:${env || 'dev'}`)
});
