const amqplib = require('amqplib');
const dotenv = require('dotenv');
const pool = require('../models_RDS/databasePool');
const mail = require('../utils/mail');
const redis = require('./alert_redis');

dotenv.config();

const amqpUser = process.env.AMQP_USER;
const amqpPassword = process.env.AMQP_PASSWORD;
const serverIp = process.env.AMQP_SERVERIP;
const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}`;

const getEmailAndProjectRules = async (token) => {
  const result = await pool.query(
    `select u.name, u.email, p.name AS projectName, p.timeWindow, p.quota, p.reactivate, p.notification
      from projects AS p 
      INNER JOIN access AS a ON p.id = a.projectId 
      INNER JOIN users AS u ON u.id = a.userId 
      WHERE p.token = ?`,
    [token],
  );
  return result[0];
};
const isMute = async (key) => {
  const result = await redis.get(key);
  if (!isNaN(Number(result)) || result === '0' || result === 'resolve') {
    return false;
  }
  return true;
};
const isResolve = async (key) => {
  const result = await redis.get(key);
  return result === 'resolve';
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

const connectAndConsume = async () => {
  const queue = 'alert';
  const conn = await amqplib.connect(rabbitmqServer);
  const ch = await conn.createChannel();
  await ch.assertQueue(queue);
  console.log('Listening for alert...');
  try {
    ch.consume(queue, async (msg) => {
      if (msg !== null) {
        const payLoad = JSON.parse(msg.content.toString());
        const data = await getEmailAndProjectRules(payLoad.accessToken);
        console.log(data);
        if (!data[0]) {
          console.log('Project has been deleted!');
          console.log('Alert worker just process one alert');
          ch.ack(msg);
          return;
        }
        if (data[0].notification === 'off') {
          console.log('Notification function not on!');
          console.log('Alert worker just process one alert');
          ch.ack(msg);
          return;
        }

        const key = `${payLoad.accessToken}-${payLoad.errMessage}`;

        if (await isMute(key)) {
          console.log('this error is muted');
          console.log('Alert worker just process one alert');
          ch.ack(msg);
          return;
        }

        if (await isResolve(key)) {
          if (data[0].reactivate === 'off') {
            console.log('Reactivate function not on!');
            return;
          }
          console.log('Reactivate resolved error!');
          await redis.set(key, 0, 'EX', 60);
          for (const row of data) {
            await mail.sendAnomalyEmail(row, payLoad);
            console.log('sending');
          }
          ch.ack(msg);
          return;
        }

        if (data[0].timeWindow === 'off') {
          console.log('Anamoly detection function not on!');
          console.log('Alert worker just process one alert');
          ch.ack(msg);
          return;
        }
        const isExcess = await isExcessQuota(key, data[0]);
        if (isExcess) {
          for (const row of data) {
            await mail.sendAnomalyEmail(row, payLoad);
            console.log('sending');
          }
        }

        console.log('Alert worker just process one alert');
        ch.ack(msg);
      } else {
        console.log('Consumer cancelled by server');
      }
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      setTimeout(connectAndConsume, 5000);
    });

    conn.on('close', () => {
      console.error('Connection closed, retrying...');
      setTimeout(connectAndConsume, 5000);
    });
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err);
    setTimeout(connectAndConsume, 5000);
  }
};

connectAndConsume();
