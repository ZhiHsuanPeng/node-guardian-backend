const amqplib = require('amqplib');
const schema = require('../utils/logSchema');
const projectModel = require('../models_RDS/project');
const { ValidationError } = require('../utils/errorHandler');
const catchAsync = require('../utils/catchAsync');

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
const insertNewLogs = catchAsync(async (req, res, next) => {
  const { accessToken } = req.body;
  // Check if the log data has necessary field
  const validateResult = schema.validate(req.body);
  if (validateResult.error) {
    return next(
      new ValidationError('Invalid error log info, please check again'),
    );
  }

  // Check if the project exists
  if (!(await projectModel.findProject(accessToken))) {
    return next(
      new ValidationError(
        `Unable to send logs data to nodeguardian server because no project 
            is found with that access token, please check again!`,
      ),
    );
  }

  const ch = await getChannel();
  const requestBody = JSON.stringify(req.body);
  ch.sendToQueue('job', Buffer.from(requestBody));

  return res.status(200).json({ message: 'OK' });
});

module.exports = { insertNewLogs };
