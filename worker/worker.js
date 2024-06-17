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

const checkIndexAndStoreData = async (payLoad) => {
  const indexResponse = await client.indices.exists({
    index: payLoad.accessToken,
  });
  if (indexResponse.body) {
    await client.index({
      index: payLoad.accessToken,
      body: payLoad,
    });
    return;
  }

  await client.indices.create({
    index: payLoad.accessToken,
  });
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
