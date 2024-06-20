const amqplib = require('amqplib');
const dotenv = require('dotenv');
const pool = require('../models_RDS/databasePool');

dotenv.config();

const amqpUser = process.env.AMQP_USER;
const amqpPassword = process.env.AMQP_PASSWORD;
const serverIp = process.env.AMQP_SERVERIP;
const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}`;

const shouldAlert = async (token) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM projects WHERE token = ?`, [token]);
    const project = rows[0];
    console.log(project);
    return project.alertFirst === 'on';
  } catch (error) {
    console.error('Error querying the database:', error);
    return false;
  }
};

(async () => {
  const queue = 'alert';
  const conn = await amqplib.connect(rabbitmqServer);
  const ch = await conn.createChannel();
  await ch.assertQueue(queue);

  ch.consume(queue, async (msg) => {
    if (msg !== null) {
      const payLoad = JSON.parse(msg.content.toString());

      const projectToken = payLoad.accessToken;
      try {
        if (await shouldAlert(projectToken)) {
          //   sendAlert();
          console.log('Send email!');
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }

      console.log('Alert worker just process one alert');
      ch.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });
})();
