const openSearchClient = require('./openSearch');

exports.countErrorByErrorMessage = async (accessToken) => {
  const response = await openSearchClient.search({
    index: accessToken,
    body: {
      size: 0,
      query: {
        bool: {
          must: [
            {
              term: {
                level: 'error',
              },
            },
          ],
        },
      },
      aggs: {
        errorMessages: {
          terms: {
            field: 'errMessage.keyword',
            size: 20,
          },
        },
      },
    },
  });

  const buckets = response.body.aggregations.errorMessages.buckets;
  const errorMessageAndCount = {};
  buckets.forEach((bucket) => {
    if (!errorMessageAndCount[bucket.key]) {
      errorMessageAndCount[bucket.key] = bucket.doc_count;
    }
  });
  return errorMessageAndCount;
};

exports.getErrorTimeStampFilteredByTime = async (accessToken, errorMessage, hours) => {
  const hoursAgoTimeStamp = Date.now() - hours * 60 * 60 * 1000;
  const response = await openSearchClient.search({
    index: accessToken,
    body: {
      query: {
        bool: {
          must: [
            {
              term: {
                'errMessage.keyword': errorMessage,
              },
            },
            {
              range: {
                timestamp: {
                  gte: hoursAgoTimeStamp,
                },
              },
            },
          ],
        },
      },
      _source: ['errMessage', 'timestamp'],
    },
  });
  const timeStamp = [];
  response.body.hits.hits.forEach((doc) => {
    timeStamp.push(doc._source.timestamp);
  });
  return timeStamp;
};
