const { Client } = require('@opensearch-project/opensearch');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const openSearchClient = new Client({
  node: 'https://search-errorlog-sjbarfvt6la3sff7iuqqkov6x4.ap-southeast-2.es.amazonaws.com',
  auth: {
    username: process.env.OPENSEARCH_USER,
    password: process.env.OPENSEARCH_PASS,
  },
});

module.exports = openSearchClient;
