const { Client } = require('@opensearch-project/opensearch');
const dotenv = require('dotenv');

dotenv.config();

const username = process.env.OPENSEARCH_USER;
const password = process.env.OPENSEARCH_PASS;

const openSearchClient = new Client({
  node: 'https://search-errorlog-sjbarfvt6la3sff7iuqqkov6x4.ap-southeast-2.es.amazonaws.com',
  auth: {
    username,
    password,
  },
});

module.exports = openSearchClient;
