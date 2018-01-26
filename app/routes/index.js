const Router = require('koa-router');
const controllers = require('../controllers');
const reqlib = require('app-root-path').require;
const config = reqlib('/config/index');

const projectName = config.project.projectName;
if (!projectName) {
  console.error('projectName is required');
  process.exit();
}
const router = new Router({
  prefix: `/${projectName}`
});

//登录
router.post('/auth/login', controllers.authController.login);
router.get('/auth/checkLogin', controllers.authController.checkLogin);
router.get('/auth/logout', controllers.authController.logout);

//基金
router.post('/fund/addUserFund', controllers.fundController.addUserFund);
router.get('/fund/getUserFunds', controllers.fundController.getUserFunds);

module.exports = router;
