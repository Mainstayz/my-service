/**
 * Created by xiaobxia on 2017/7/26.
 */
const path = require('path');
module.exports = {
  project: {
    //务必修改
    projectName: "",
    remoteAddress: 'http://localhost:4000/#'
  },
  server: {
    //默认
    debug: true,
    root: path.resolve(__dirname, '../'),
    port: 8080,
    //务必修改
    session_secret: "secret"
  },
  //mysql配置
  mysql: {
    //默认
    connectionLimit: 10,
    dateStrings: true,
    //务必修改
    host: "",
    user: "",
    password: "",
    database: "",

  },
  logger: {
    //默认
    dir: path.resolve(__dirname, '../logs/'),
    fileName: 'cheese.log',
    debugLogLevel: 'ALL',
    productLogLevel: 'ERROR'
  },
  qiniu: {
    //例子：华南就填写'Zone_z2'
    zone: ''
  },
  //务必修改
  //只有在debug为false时开启
  email: {
    senderAccount: {
      //阿里邮箱的例子:host: smtp.mxhichina.com, port: 25
      host: '',
      //使用ssl
      //secureConnection: true, // use SSL
      //port: 465, // port for secure SMTP

      //不适用ssl
      port: 25,
      //secure: true, // use TLS
      auth: {
        //邮箱地址
        user: '',
        //邮箱密码
        pass: ''
      },
      ignoreTLS: true,
    },
    adminAccount: {
      //管理人员的邮箱地址
      user: ''
    }
  }
};
