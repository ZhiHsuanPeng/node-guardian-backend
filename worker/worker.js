const amqplib = require('amqplib');
const dotenv = require('dotenv');

dotenv.config();

const amqpUser = process.env.AMQP_USER || 'jeremy';
const amqpPassword = process.env.AMQP_PASSWORD || 'jeremy';
const serverIp = process.env.AMQP_SERVERIP;

const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}`;

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
      ch.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });
})();
