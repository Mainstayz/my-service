/**
 * Created by xiaobxia on 2018/3/13.
 */
const redis = require('redis')
const bluebird = require('bluebird')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const client = redis.createClient({
  host: '127.0.0.1',
  port: 6379
})

module.exports = client
