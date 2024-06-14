const openSearchClient = require('../models_openSearch/openSearch');

const countErrorByErrorMessage = async (accessToken) => {
  const response = await openSearchClient.search({
    index: accessToken,
    body: {
      size: 0,
      aggs: {
        errorMessages: {
          terms: {
            field: 'errMessage.keyword',
            size: 10,
          },
        },
      },
    },
  });

  const buckets = response.body.aggregations.errorMessages.buckets;
  buckets.forEach((bucket) => {
    console.log(`Error Message: ${bucket.key}, Count: ${bucket.doc_count}`);
  });
};

const getErrorDocByErrorMessage = async (accessToken) => {
  const response = await openSearchClient.search({
    index: accessToken,
    body: {
      size: 100,
      query: {
        bool: {
          must: [
            {
              exists: {
                field: 'errMessage',
              },
            },
          ],
        },
      },
      aggs: {
        errorMessages: {
          terms: {
            field: 'errMessage.keyword',
            size: 10,
          },
        },
      },
    },
  });

  const buckets = response.body.aggregations.errorMessages.buckets;
  buckets.forEach((bucket) => {
    console.log(`Error Message: ${bucket.key}, Count: ${bucket.doc_count}`);
    // Access documents for this error message from response.hits.hits
    const errorDocs = response.body.hits.hits.filter((hit) => hit._source.errMessage === bucket.key);
    console.log('Documents:', errorDocs);
  });

  return response.body.hits.hits;
};

getErrorDocByErrorMessage('123');
