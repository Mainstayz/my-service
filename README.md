## 功能

- ✔ 用户管理
- ✔ 角色管理
- ✔ 权限管理
- ✔ 参数管理
- ✔ 日志审计
- ✔ 文件上传
- ✔ 图片管理
- ✔ APP管理
- ✔ APP版本管理

## 准备

1. mysql数据库：执行sql文件夹下的脚本

## 配置

把config文件夹下的index.default.js文件重命名为index.js，并修改文件中的配置。

## 启动

``` shell
npm install
#开发
npm run server
#部署
npm run prod
#部署多核
npm run prod -- -i <number>
```
## 停止
``` shell
#部署环境下
#找到进程
pm2 list
#停止
pm2 delete <id|name>
#停止所有
pm2 delete all
```
## 上传文件

上传文件功能的配置不在配置文件中添加，而是在app中添加，进入app后你需要：
1. 添加文件桶 
2. 添加参数QINIU_SECRET_KEY、QINIU_ACCESS_KEY（分别对应你的七牛secretKey和accessKey）
3. 在配置文件中添加七牛的地区（zone）
