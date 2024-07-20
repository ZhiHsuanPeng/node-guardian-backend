const Redis = require('ioredis');

const elasticache = process.env.ELASTICACHE_ENDPOINT;
const localhost = process.env.REDIS_HOST;

const redis = new Redis({
  port: process.env.REDIS_PORT,
  host: elasticache || localhost,
  username: elasticache ? '' : process.env.REDIS_USER,
  password: elasticache ? '' : process.env.REDIS_PASS,
});

module.exports = redis;
