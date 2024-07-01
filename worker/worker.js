const amqplib = require('amqplib');
const dotenv = require('dotenv');
const { Client } = require('@elastic/elasticsearch');
const pool = require('../models_RDS/databasePool');
const mail = require('../utils/mail');

dotenv.config();

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    apiKey: process.env.ELASTICSEARCH_APIKEY,
  },
});

const amqpUser = process.env.AMQP_USER;
const amqpPassword = process.env.AMQP_PASSWORD;
const serverIp = process.env.AMQP_SERVERIP;
const heartbeatInterval = 60;
const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}?heartbeat=${heartbeatInterval}`;

const checkIsFirstAndSetAlert = async (payLoad) => {
  try {
    const [rows] = await pool.query(
      'select u.name, u.email, p.alertFirst, p.name AS projectName from projects AS p INNER JOIN access AS a ON p.id = a.projectId INNER JOIN users AS u ON u.id = a.userId WHERE p.token = ?',
      [payLoad.accessToken],
    );

    if (rows[0].alertFirst === 'off') {
      return;
    }

    const checkIsFirstError = await client.search({
      index: payLoad.accessToken,
      body: {
        size: 100,
        query: {
          bool: {
            must: [
              {
                term: {
                  'errMessage.keyword': payLoad.errMessage,
                },
              },
            ],
          },
        },
      },
    });
    const docNum = checkIsFirstError.hits.total.value;
    if (docNum !== 0) {
      return;
    }

    for (const user of rows) {
      await mail.sendFirstErrorEmail(
        user.email,
        user.name,
        user.projectName,
        payLoad,
      );
    }
  } catch (error) {
    console.error('Error querying the database:', error);
  }
};

const insertAlertQueue = async (ch, message) => {
  try {
    const queue = 'alert';
    await ch.assertQueue(queue);
    ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  } catch (err) {
    console.log(err);
  }
};

const storeData = async (payLoad) => {
  await client.index({
    index: payLoad.accessToken,
    body: payLoad,
  });
  console.log('Worker just process 1 log');
};

const connectAndConsume = async () => {
  console.log('Listening for jobs...');
  const queue = 'job';
  const conn = await amqplib.connect(rabbitmqServer);
  const ch = await conn.createChannel();
  await ch.assertQueue(queue);
  try {
    ch.consume(queue, async (msg) => {
      if (msg !== null) {
        const payLoad = JSON.parse(msg.content.toString());
        console.log(payLoad);

        const headersObj = {};
        for (let i = 0; i < payLoad.filteredReqObj.headers.length; i += 2) {
          headersObj[payLoad.filteredReqObj.headers[i]] =
            payLoad.filteredReqObj.headers[i + 1];
        }
        payLoad.filteredReqObj.headers = headersObj;

        await checkIsFirstAndSetAlert(payLoad);
        await insertAlertQueue(ch, payLoad);
        await storeData(payLoad);
        ch.ack(msg);
      } else {
        console.log('Consumer cancelled by server');
      }
      conn.on('error', (err) => {
        console.error('Connection error:', err);
        setTimeout(connectAndConsume, 5000);
      });

      conn.on('close', () => {
        console.error('Connection closed, retrying...');
        setTimeout(connectAndConsume, 5000);
      });
    });
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err);
    setTimeout(connectAndConsume, 5000);
  }
};

connectAndConsume();
