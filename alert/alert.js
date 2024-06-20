const amqplib = require('amqplib');
const dotenv = require('dotenv');
const pool = require('../models_RDS/databasePool');
const client = require('../models_Search/elasticSearch');

dotenv.config();

const amqpUser = process.env.AMQP_USER;
const amqpPassword = process.env.AMQP_PASSWORD;
const serverIp = process.env.AMQP_SERVERIP;
const rabbitmqServer = `amqp://${amqpUser}:${amqpPassword}@${serverIp}`;

const checkIsFirstAndSetAlert = async (payLoad) => {
  try {
    // Search for error message in search engine
    const checkIsFirstError = await client.search({
      index: payLoad.accessToken,
      body: {
        size: 100,
        query: {
          bool: {
            must: [
              {
                term: {
                  'errMessage.keyword': payLoad.errMessage,
                },
              },
            ],
          },
        },
      },
    });
    console.log(checkIsFirstError);

    // If the result is not 0, it indicates that this is not the first occurrence

    if (!checkIsFirstError.hits.total.value === 0) {
      // Handle situation when this error is not the first
      // Use redis to increment error count
    }
    const [rows] = await pool.query(`SELECT * FROM projects WHERE token = ?`, [payLoad.accessToken]);
    const project = rows[0];

    if (project.alertFirst === 'on') {
      sendNotification();
    }
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
      await checkIsFirstAndSetAlert(payLoad);
      console.log('Alert worker just process one alert');
      ch.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });
})();
