const { Client } = require('@elastic/elasticsearch');
const dotenv = require('dotenv');

dotenv.config();

// const client = new Client({
//   node: process.env.ELASTICSEARCH_NODE,
//   auth: {
//     apiKey: process.env.ELASTICSEARCH_APIKEY,
//   },
// });

const client = new Client({
  node: process.env.ELASTIC_IP,
  auth: {
    username: process.env.ELASTIC_USER,
    password: process.env.ELASTIC_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = client;
