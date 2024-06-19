const amqplib = require('amqplib');
const dotenv = require('dotenv');
const { Client } = require('@elastic/elasticsearch');

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
const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}`;

const insertAlertQueue = async (message) => {
  try {
    const queue = 'alert';
    const conn = await amqplib.connect(rabbitmqServer);
    const ch = await conn.createChannel();
    await ch.assertQueue(queue);
    ch.sendToQueue(queue, Buffer.from(message));

    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: err.message });
  }
};

const checkIndexAndStoreData = async (payLoad) => {
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

  if (checkIsFirstError.hits[total][value] === 0) {
    insertAlertQueue(payLoad);
  }
  await client.index({
    index: payLoad.accessToken,
    body: payLoad,
  });
};

(async () => {
  const queue = 'job';
  const conn = await amqplib.connect(rabbitmqServer);
  const ch = await conn.createChannel();
  await ch.assertQueue(queue);

  ch.consume(queue, (msg) => {
    if (msg !== null) {
      const payLoad = JSON.parse(msg.content.toString());
      const headersObj = {};
      for (let i = 0; i < payLoad.filteredReqObj.headers.length; i += 2) {
        headersObj[payLoad.filteredReqObj.headers[i]] = payLoad.filteredReqObj.headers[i + 1];
      }
      payLoad.filteredReqObj.headers = headersObj;
      checkIndexAndStoreData(payLoad);
      console.log('Worker just process one log');
      ch.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });
})();
