const amqplib = require('amqplib');
const projectModel = require('../models_RDS/project');

let connection;
let channel;

const amqpUser = process.env.AMQP_USER;
const amqpPassword = process.env.AMQP_PASSWORD;
const serverIp = process.env.AMQP_SERVERIP;
const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}`;

const getChannel = async () => {
  if (!connection) {
    connection = await amqplib.connect(rabbitmqServer);
  }
  if (!channel) {
    channel = await connection.createChannel();
    await channel.assertQueue('job');
  }
  return channel;
};

exports.insertNewLogs = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!(await projectModel.findProject(accessToken))) {
      throw Error(
        'Unable to send logs data to nodeguardian server because no project is found with that access token, please check again!',
      );
    }
    const ch = await getChannel();
    const requestBody = JSON.stringify(req.body);
    ch.sendToQueue('job', Buffer.from(requestBody));

    return res.status(200).json({ message: 'OK' });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: err.message });
  }
};
