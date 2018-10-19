const qiniu = require('qiniu')
/**
 * @param config
 * accessKey
 * secretKey
 * bucketCode
 * fileName
 * bucketHost
 *
 * @returns {{token: *, bucketHost: *, fileName: (*|string)}}
 */
exports.getUploadToken = function (config) {
  // 1.创建鉴权对象
  const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey)
  // 2.创建上传凭证
  const options = {
    // 空间名
    scope: config.bucketCode + ':' + config.fileName,
    expires: 600,
    returnBody: '{"key":"$(key)","hash":"$(etag)","bucket":"$(bucket)","fname":"$(fname)","fsize":"$(fsize)","mimeType":"$(mimeType)"}'
    // callbackBody: '{"key":"$(key)","hash":"$(etag)","bucket":"$(bucket)","fname":"$(fname)","fsize":"$(fsize)","mimeType":"$(mimeType)"}',
    // callbackBodyType: 'application/json'
  }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  const uploadToken = putPolicy.uploadToken(mac)
  return {
    token: uploadToken,
    bucketHost: config.bucketHost,
    fileName: config.fileName
  }
}
/**
 * @param config
 * accessKey
 * secretKey
 * bucketDomain
 * fileName
 * deadline
 *
 * @returns {*}
 */
exports.getPrivateDownloadUrl = function (config) {
  const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey)
  const qiniuConfig = new qiniu.conf.Config()
  const bucketManager = new qiniu.rs.BucketManager(mac, qiniuConfig)
  // deadline 过期的时间戳
  return bucketManager.privateDownloadUrl(config.bucketDomain, config.fileName, config.deadline)
}
/**
 * @param config
 * accessKey
 * secretKey
 * bucketDomain
 * fileName
 *
 * @returns {*}
 */
exports.getPublicDownloadUrl = function (config) {
  const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey)
  const qiniuConfig = new qiniu.conf.Config()
  const bucketManager = new qiniu.rs.BucketManager(mac, qiniuConfig)
  return bucketManager.publicDownloadUrl(config.bucketDomain, config.fileName)
}
/**
 * @param config
 * accessKey
 * secretKey
 * bucketCode
 * fileName
 * zone
 *
 * @returns {Promise}
 */
// 返回的是promise
exports.deconsteFile = function (config) {
  // 1.创建鉴权对象
  const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey)
  // bucket管理对象
  const bucketConfig = new qiniu.conf.Config()
  // 地区
  bucketConfig.zone = qiniu.zone[config.zone]
  const bucketManager = new qiniu.rs.BucketManager(mac, bucketConfig)
  return new Promise(function (resolve, reject) {
    bucketManager.deconste(config.bucketCode, config.fileName, function (err, respBody, respInfo) {
      if (err) {
        reject(err)
      } else {
        // 成功时返回200
        if (+respInfo.statusCode === 200) {
          resolve()
        } else {
          let error = null
          if (respInfo.data && respInfo.data.error) {
            error = new Error(respInfo.data.error)
          } else {
            error = new Error('qiniu error')
          }
          reject(error)
        }
      }
    })
  })
}
