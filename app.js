const Koa = require('koa')
const bluebird = require('bluebird')
const cors = require('koa-cors')
const bodyParser = require('koa-bodyparser')
const base = require('./app/base')
const checkLogin = require('./app/middlewares/checkLogin')
const error = require('./app/middlewares/error')
const requestLog = require('./app/middlewares/requestLog')
const router = require('./app/routes/index')
const config = require('./config/index')

global.Promise = bluebird
const env = process.env.NODE_ENV

const app = new Koa()
// 加入全局信息
base(app)

// 跨域
app.use(cors({
  methods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  credentials: true,
  maxAge: 2592000
}))
// 每个next都需要await
// 请求日志
app.use(requestLog)
// 检查登录中间件
app.use(checkLogin)

// post
app.use(bodyParser())

// 路由，默认拥有404
app.use(router.routes())

// 错误处理
app.on('error', error)

// 监听
const port = config.server.port || 8080

app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
  console.log(`当前环境是:${env || 'dev'}`)
})
