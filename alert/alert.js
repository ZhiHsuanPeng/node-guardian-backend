const amqplib = require('amqplib');
const dotenv = require('dotenv');
const pool = require('../models_RDS/databasePool');
const mail = require('../utils/alert_mail');
const redis = require('./alert_redis');

dotenv.config();

const amqpUser = process.env.AMQP_USER;
const amqpPassword = process.env.AMQP_PASSWORD;
const serverIp = process.env.AMQP_SERVERIP;
const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}`;

const getProjectRules = async (token) => {
  const result = await pool.query('SELECT timeWindow, quota FROM projects WHERE token = ?', [token]);
  return result[0][0];
};

const isExcessQuota = async (key, rules) => {
  const results = await redis
    .multi()
    .set(key, 0, 'EX', rules.timeWindow * 1, 'NX')
    .incr(key)
    .exec();
  const count = results?.[1][1];
  console.log(count);
  console.log(typeof count);
  console.log(typeof rules.quota);
  if (typeof count === 'number' && count > rules.quota) {
    await redis.set(key, 0, 'EX', rules.timeWindow * 1);
    return true;
  }
  return false;
};

(async () => {
  const queue = 'alert';
  const conn = await amqplib.connect(rabbitmqServer);
  const ch = await conn.createChannel();
  await ch.assertQueue(queue);

  ch.consume(queue, async (msg) => {
    if (msg !== null) {
      const payLoad = JSON.parse(msg.content.toString());
      const rules = await getProjectRules(payLoad.accessToken);
      if (rules.timeWindow === 'off') {
        console.log('Alert function not on!');
        return;
      }
      const key = `${payLoad.accessToken}-${payLoad.errMessage}`;
      console.log(rules);
      const isExcess = await isExcessQuota(key, rules);
      if (isExcess) {
        console.log('Sending email!');
      }

      console.log('Alert worker just process one alert');
      ch.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });
})();
