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

const getEmailAndProjectRules = async (token) => {
  const result = await pool.query(
    'select u.email, p.timeWindow, p.quota from projects AS p INNER JOIN access AS a ON p.id = a.projectId INNER JOIN users AS u ON u.id = a.userId WHERE p.token = ?',
    [token],
  );
  return result[0];
};

const isExcessQuota = async (key, data) => {
  const results = await redis
    .multi()
    .set(key, 0, 'EX', data.timeWindow * 1, 'NX')
    .incr(key)
    .exec();
  const count = results?.[1][1];
  if (typeof count === 'number' && count > data.quota) {
    await redis.set(key, 0, 'EX', data.timeWindow * 1);
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
      const data = await getEmailAndProjectRules(payLoad.accessToken);
      console.log(data);
      if (data[0].timeWindow === 'off') {
        console.log('Alert function not on!');
        return;
      }
      const key = `${payLoad.accessToken}-${payLoad.errMessage}`;
      const isExcess = await isExcessQuota(key, data[0]);
      if (isExcess) {
        for (const row of data) {
          await mail.sendAnomalyEmail(row.email);
        }
      }

      console.log('Alert worker just process one alert');
      ch.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });
})();
