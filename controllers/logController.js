const amqplib = require('amqplib');

exports.insertNewLogs = async (req, res) => {
  const amqpUser = process.env.AMQP_USER || 'jeremy';
  const amqpPassword = process.env.AMQP_PASSWORD || 'jeremy';
  const serverIp = process.env.AMQP_SERVERIP;

  const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}`;

  const queue = 'job';
  const conn = await amqplib.connect(rabbitmqServer);
  const ch = await conn.createChannel();
  await ch.assertQueue(queue);

  ch.sendToQueue(queue, Buffer.from(req.body));

  return res.status(200).json({ message: 'OK' });
};
