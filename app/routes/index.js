const Router = require('koa-router');
const multer = require('koa-multer');
const controllers = require('../controllers');
const reqlib = require('app-root-path').require;
const config = reqlib('/config/index');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({storage: storage});

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
router.get('/fund/getFundSimple', controllers.fundController.getFundSimple);
router.get('/fund/getFundBase', controllers.fundController.getFundBase);
router.get('/fund/getFunds', controllers.fundController.getFunds);
router.get('/fund/deleteFund', controllers.fundController.deleteFund);
router.post('/fund/addFund', controllers.fundController.addFund);

//用户基金
router.post('/fund/addUserFund', controllers.fundController.addUserFund);
router.get('/fund/getUserFunds', controllers.fundController.getUserFunds);
router.get('/fund/deleteUserFund', controllers.fundController.deleteUserFund);
router.post('/fund/updateUserFund', controllers.fundController.updateUserFund);

//关注基金
router.post('/focusFund/addFocusFund', controllers.focusFundController.addFocusFund);
router.get('/focusFund/getFocusFunds', controllers.focusFundController.getFocusFunds);
router.get('/focusFund/deleteFocusFund', controllers.focusFundController.deleteFocusFund);

//策略
router.get('/strategy/getStrategy', controllers.strategyController.getStrategy);
router.get('/strategy/getMyStrategy', controllers.strategyController.getMyStrategy);
router.get('/strategy/getLowRateStrategy', controllers.strategyController.getLowRateStrategy);

//分析路由
router.get('/analyze/getFundAnalyzeRecent', controllers.analyzeController.getFundAnalyzeRecent);
router.get('/analyze/updateBaseInfo', controllers.analyzeController.updateBaseInfo);
router.get('/analyze/updateValuation', controllers.analyzeController.updateValuation);
router.get('/analyze/updateRecentNetValue', controllers.analyzeController.updateRecentNetValue);
router.get('/analyze/betterValuation', controllers.analyzeController.betterValuation);
router.get('/analyze/addRecentNetValue', controllers.analyzeController.addRecentNetValue);
router.post('/analyze/updateLowRateFund', controllers.analyzeController.updateLowRateFund);
//文件上传
router.post('/upload/importFund', upload.single('fundFile'), controllers.fundController.importFunds);
router.post('/upload/importMyFund', upload.single('fundFile'), controllers.fundController.importMyFunds);
router.post('/upload/importFocusFund', upload.single('fundFile'), controllers.focusFundController.importFocusFund);

//文件下载
router.post('/download/exportMyFund', controllers.fundController.exportMyFunds);

//定时任务
router.post('/schedule/addSchedule', controllers.scheduleController.addSchedule);
router.get('/schedule/getSchedules', controllers.scheduleController.getSchedules);
router.get('/schedule/updateSchedule', controllers.scheduleController.updateSchedule);
router.get('/schedule/deleteSchedule', controllers.scheduleController.deleteSchedule);
router.get('/schedule/verifyOpening', controllers.scheduleController.verifyOpening);

module.exports = router;
