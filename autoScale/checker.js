const amqplib = require('amqplib');
const dotenv = require('dotenv');
const autoStart = require('./startEC2');
const autoCheck = require('./status');
const autoStop = require('./stopEC2');

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
      if (
        stat.messageCount > 100 &&
        autoCheck.checkEC2(instance) === 'stopping'
      ) {
        autoStart(instance);
      } else if (
        stat.messageCount < 100 &&
        autoCheck.checkEC2(instance) === 'running'
      ) {
        autoStop(instance);
      }
    } catch (err) {
      console.log(err);
    }
  }, 1000);
})();
