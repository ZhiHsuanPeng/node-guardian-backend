const amqplib = require('amqplib');
const dotenv = require('dotenv');
const auto = require('./auto');

dotenv.config();

const amqpUser = process.env.AMQP_USER;
const amqpPassword = process.env.AMQP_PASSWORD;
const serverIp = process.env.AMQP_SERVERIP;
const heartbeatInterval = 60;
const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}?heartbeat=${heartbeatInterval}`;
const instance = { InstanceIds: [process.env.WORKER1_ID] };

(async () => {
  console.log('Checking message numbers in queues...');
  const queue = 'job';
  const conn = await amqplib.connect(rabbitmqServer);
  const ch = await conn.createChannel();
  await ch.assertQueue(queue);

  setInterval(async () => {
    try {
      const stat = await ch.checkQueue(queue);
      const status = await auto.checkInstances(instance);
      console.log(stat);
      if (stat.messageCount >= 100 && status === 'stopped') {
        console.log('Starting groups...');
        auto.startInstances(instance);
      } else if (stat.messageCount < 100 && status === 'running') {
        console.log('Closing groups...');
        auto.stopInstances(instance);
      }
    } catch (err) {
      console.log(err);
    }
  }, 1000);
})();
