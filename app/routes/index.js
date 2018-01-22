const Router = require('koa-router');
const controllers = require('../controllers');
const config = require('../../config/index');

const projectName = config.project.projectName;
if (!projectName) {
  console.error('projectName is required');
  process.exit();
}
const router = new Router({
  prefix: `/${projectName}`
});
//登录
router.post('/sys/auth/login', controllers.authController.login());
router.get('/sys/auth/checkLogin', controllers.authController.checkLogin());
router.get('/sys/auth/logout', controllers.authController.logout());
//注册
router.get('/sys/user/register/active', controllers.userController.registerActive());
router.get('/sys/user/register/result', controllers.userController.registerResult());
router.post('/sys/user/register', controllers.userController.register());
router.get('/sys/user/sendActiveEmail', controllers.userController.sendActiveEmail());


module.exports = router;
