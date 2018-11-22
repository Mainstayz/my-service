const Router = require('koa-router')
const multer = require('koa-multer')
const controllers = require('../controllers')
const reqlib = require('app-root-path').require
const config = reqlib('/config/index')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})
const upload = multer({ storage: storage })

const projectName = config.project.projectName
if (!projectName) {
  console.error('projectName is required')
  process.exit()
}
const router = new Router({
  prefix: `/${projectName}`
})

/**
 * 登陆模块
 */
// 登陆
router.post('/auth/login', controllers.authController.login)
// 检查登陆
router.get('/auth/checkLogin', controllers.authController.checkLogin)
// 退出登录
router.get('/auth/logout', controllers.authController.logout)

/**
 * 基金模块
 */
router.post('/fund/addFund', controllers.fundController.addFund)
router.get('/fund/deleteFund', controllers.fundController.deleteFund)
router.get('/fund/getFundBase', controllers.fundController.getFundBase)
router.get('/fund/getFunds', controllers.fundController.getFunds)
router.get('/fund/getFundAnalyzeRecent', controllers.fundController.getFundAnalyzeRecent)
router.get('/fund/getMarket', controllers.fundController.getMarket)
router.get('/fund/getMarketInfo', controllers.fundController.getMarketInfo)
router.get('/fund/getRank', controllers.fundController.getRank)
router.post('/fund/updateFundTheme', controllers.fundController.updateFundTheme)
router.get('/fund/getFundsByTheme', controllers.fundController.getFundsByTheme)
router.post('/fund/updateFundThemeByKeyword', controllers.fundController.updateFundThemeByKeyword)
/**
 * 用户基金模块
 */
router.post('/fund/addUserFund', controllers.userFundController.addUserFund)
router.get('/fund/deleteUserFund', controllers.userFundController.deleteUserFund)
router.post('/fund/updateUserFund', controllers.userFundController.updateUserFund)
router.post('/fund/addUserFundPosition', controllers.userFundController.addUserFundPosition)
router.post('/fund/cutUserFundPosition', controllers.userFundController.cutUserFundPosition)
router.get('/fund/initUserFundPosition', controllers.userFundController.initUserFundPosition)
router.get('/fund/getUserFunds', controllers.userFundController.getUserFunds)
router.get('/fund/getUserFundsNormal', controllers.userFundController.getUserFundsNormal)
/**
 * 用户净值记录
 */
router.post('/fund/addUserNetValue', controllers.userNetValueController.addUserNetValue)
router.get('/fund/deleteUserNetValue', controllers.userNetValueController.deleteUserNetValue)
router.post('/fund/updateUserNetValue', controllers.userNetValueController.updateUserNetValue)
router.get('/fund/getUserNetValues', controllers.userNetValueController.getUserNetValues)
router.get('/fund/getUserNetValuesAll', controllers.userNetValueController.getUserNetValuesAll)
router.get('/fund/getUserNetValuesRecent', controllers.userNetValueController.getUserNetValuesRecent)
router.get('/fund/getUserNetValueMonthRate', controllers.userNetValueController.getUserNetValueMonthRate)
/**
 * 关注基金模块
 */
router.post('/fund/addFocusFund', controllers.focusFundController.addFocusFund)
router.get('/fund/getFocusFunds', controllers.focusFundController.getFocusFunds)
router.get('/fund/deleteFocusFund', controllers.focusFundController.deleteFocusFund)
router.get('/fund/checkFocusFund', controllers.focusFundController.checkFocusFund)
/**
 * 策略
 */
router.get('/strategy/getStrategy', controllers.strategyController.getStrategy)
router.get('/strategy/getMyStrategy', controllers.strategyController.getMyStrategy)
router.get('/strategy/getAverageStrategy', controllers.strategyController.getAverageStrategy)
router.get('/strategy/getLowRateStrategy', controllers.strategyController.getLowRateStrategy)
router.post('/strategy/updateAnalyzeValue', controllers.strategyController.updateAnalyzeValue)
router.get('/strategy/getAnalyzeValue', controllers.strategyController.getAnalyzeValue)
router.get('/strategy/getFundsMaxMinDistribution', controllers.strategyController.getFundsMaxMinDistribution)
/**
 * 文件上传模块
 */
router.post('/upload/importFund', upload.single('fundFile'), controllers.uploadController.importFunds)

/**
 * 文件下载模块
 */
router.post('/download/exportMyFund', controllers.exportController.exportMyFunds)

/**
 * 定时任务模块
 */
router.post('/schedule/addSchedule', controllers.scheduleController.addSchedule)
router.get('/schedule/deleteSchedule', controllers.scheduleController.deleteSchedule)
router.post('/schedule/updateSchedule', controllers.scheduleController.updateSchedule)
router.post('/schedule/changeScheduleStatus', controllers.scheduleController.changeScheduleStatus)
router.get('/schedule/getSchedules', controllers.scheduleController.getSchedules)
router.get('/schedule/getScheduleValue', controllers.scheduleController.getScheduleValue)

router.get('/schedule/verifyOpening', controllers.fundScheduleController.verifyOpening)
router.get('/schedule/updateBaseInfo', controllers.fundScheduleController.updateBaseInfo)
router.get('/schedule/updateValuation', controllers.fundScheduleController.updateValuation)
router.get('/schedule/updateRate', controllers.fundScheduleController.updateRate)
router.get('/schedule/updateRecentNetValue', controllers.fundScheduleController.updateRecentNetValue)
router.get('/schedule/betterValuation', controllers.fundScheduleController.betterValuation)
router.get('/schedule/addRecentNetValue', controllers.fundScheduleController.addRecentNetValue)
router.get('/schedule/deleteUnSellFund', controllers.fundScheduleController.deleteUnSellFund)
router.post('/schedule/updateLowRateFund', controllers.fundScheduleController.updateLowRateFund)
router.post('/schedule/deleteHighRateFund', controllers.fundScheduleController.deleteHighRateFund)

/**
 * 网络数据
 */
router.get('/webData/getWebStockdaybar', controllers.webDataController.getWebStockdaybar)
router.get('/webData/getWebStockdaybarAllZhongjin', controllers.webDataController.getWebStockdaybarAllZhongjin)
router.get('/webData/getWebStockdaybarAllGushitong', controllers.webDataController.getWebStockdaybarAllGushitong)
router.get('/webData/getWebStockdaybarTodayZhongjin', controllers.webDataController.getWebStockdaybarTodayZhongjin)
router.get('/webData/getWebStockdaybarDongfang', controllers.webDataController.getWebStockdaybarDongfang)
router.get('/webData/getWebStockdaybarTodayDongfang', controllers.webDataController.getWebStockdaybarTodayDongfang)
router.get('/webData/getLastTradingDay', controllers.webDataController.getLastTradingDay)

/**
 * 测试
 */
router.get('/test/testEmail', controllers.testController.testEmail)

module.exports = router
