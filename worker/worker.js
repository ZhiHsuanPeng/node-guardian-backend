const amqplib = require('amqplib');
const dotenv = require('dotenv');

dotenv.config();

const amqpUser = process.env.AMQP_USER || 'jeremy';
const amqpPassword = process.env.AMQP_PASSWORD || 'jeremy';
const serverIp = process.env.AMQP_SERVERIP;

console.log(serverIp);

const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}`;

(async () => {
  const queue = 'job';
  const conn = await amqplib.connect(rabbitmqServer);
  const ch = await conn.createChannel();
  await ch.assertQueue(queue);

  ch.consume(queue, (msg) => {
    if (msg !== null) {
      console.log('Received:', msg.content.toString());
      ch.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });
})();
