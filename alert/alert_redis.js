const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();
console.log(process.env.REDIS_PASS);

const redis = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASS,
});
