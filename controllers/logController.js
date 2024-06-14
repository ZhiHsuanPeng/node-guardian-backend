const amqplib = require('amqplib');

exports.insertNewLogs = async (req, res) => {
  const amqpUser = process.env.AMQP_USER;
  const amqpPassword = process.env.AMQP_PASSWORD;
  const serverIp = process.env.AMQP_SERVERIP;

  const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}`;

  const queue = 'job';
  const conn = await amqplib.connect(rabbitmqServer);
  const ch = await conn.createChannel();
  await ch.assertQueue(queue);

  const requestBody = JSON.stringify(req.body);
  ch.sendToQueue(queue, Buffer.from(requestBody));

  return res.status(200).json({ message: 'OK' });
};
