const amqplib = require('amqplib');
const dotenv = require('dotenv');
const { Client } = require('@opensearch-project/opensearch');

dotenv.config();

const openSearchClient = new Client({
  node: 'https://search-errorlog-sjbarfvt6la3sff7iuqqkov6x4.ap-southeast-2.es.amazonaws.com',
  auth: {
    username: process.env.OPENSEARCH_USER,
    password: process.env.OPENSEARCH_PASS,
  },
});

const amqpUser = process.env.AMQP_USER;
const amqpPassword = process.env.AMQP_PASSWORD;
const serverIp = process.env.AMQP_SERVERIP;
const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}`;

const checkIndexAndStoreData = async (payLoad) => {
  const indexResponse = await openSearchClient.indices.exists({
    index: payLoad.accessToken,
  });
  if (indexResponse.body) {
    await openSearchClient.index({
      index: payLoad.accessToken,
      body: payLoad,
    });
    return;
  }

  await openSearchClient.indices.create({
    index: payLoad.accessToken,
  });
  await openSearchClient.index({
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
