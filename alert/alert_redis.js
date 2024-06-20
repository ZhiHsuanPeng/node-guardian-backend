const Redis = require('ioredis');
const dotenv = require('dotenv');

const redis = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASS,
});

module.exports = redis;
