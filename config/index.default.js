/**
 * Created by xiaobxia on 2017/7/26.
 */
const path = require('path');

const root = path.resolve(__dirname, '../');
function resolveRoot(dir) {
  return path.resolve(root, dir);
}
module.exports = {
  root: path.resolve(__dirname, '../'),
  project: {
    projectName: "myService"
  },
  server: {
    port: 3002,
    token: {
      key: 'xiaobxia',
      expiresIn: 60 * 60 * 24
    }
  },
  logger: {
    dir: resolveRoot('logs'),
    fileName: 'cheese.log',
    debugLogLevel: 'all',
    productLogLevel: 'info'
  },
  uploadDir: 'uploads',
  db: 'mongodb://127.0.0.1:27017/myService',
  qiniu: {
    zone: 'Zone_z2'
  },
  //只有在debug为false时开启
  email: {
    senderAccount: {
      host: 'smtp.mxhichina.com',
      port: 25,
      //secure: true, // use TLS
      auth: {
        user: 'chenlingjie@cd121.com',
        pass: 'CLJclj214'
      },
      ignoreTLS: true,
    },
    adminAccount: {
      user: '673806687@qq.com'
    }
  }
};
