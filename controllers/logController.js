const amqplib = require('amqplib');
const projectModel = require('../models_RDS/project');

exports.insertNewLogs = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!(await projectModel.findProject(accessToken))) {
      throw Error(
        ' Unable to send logs data to nodeguardian server because no project is found with that access token, please check again!'
      );
    }
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
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: err.message });
  }
};
