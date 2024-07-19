const elasticSearchClient = require('./elasticSearch');

exports.countErrorByErrorMessage = async (accessToken) => {
  const response = await elasticSearchClient.search({
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
            size: 10000,
          },
        },
      },
    },
  });
  const buckets = response.aggregations.errorMessages.buckets;
  const errorMessageAndCount = {};
  buckets.forEach((bucket) => {
    if (!errorMessageAndCount[bucket.key]) {
      errorMessageAndCount[bucket.key] = bucket.doc_count;
    }
  });

  return errorMessageAndCount;
};

exports.getErrorTimeStampFilteredByTime = async (
  accessToken,
  errorMessage,
  hours,
) => {
  const hoursAgoTimeStamp =
    Date.now() - hours * 60 * 60 * 1000 + 60 * 60 * 1000;

  const response = await elasticSearchClient.search({
    index: accessToken,
    body: {
      size: 10000,
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
  response.hits.hits.forEach((doc) => {
    timeStamp.push(doc._source.timestamp);
  });
  return timeStamp;
};

exports.getAllErrors = async (accessToken, err) => {
  const response = await elasticSearchClient.search({
    index: accessToken,
    body: {
      size: 10000,
      query: {
        bool: {
          must: [
            {
              term: {
                'errMessage.keyword': err,
              },
            },
          ],
        },
      },
      sort: [{ timestamp: { order: 'desc' } }],
    },
  });

  const result = response.hits.hits;

  const errorDetail = {
    latest: '',
    first: '',
    errTitle: err,
    all: [],
    timeStamp: [],
    latestErr: '',
  };

  errorDetail.latestErr = result[0]._source;
  errorDetail.latest = result[0]._source.timestamp;
  errorDetail.first = result[result.length - 1]._source.timestamp;
  result.forEach((error) => {
    errorDetail.timeStamp.push(error._source.timestamp);
    errorDetail.all.push(error._source);
  });

  return errorDetail;
};

exports.getAllProjectTimeStamp = async (token) => {
  const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
  const response = await elasticSearchClient.search({
    index: token,
    body: {
      size: 10000,
      query: {
        range: {
          timestamp: {
            gte: twentyFourHoursAgo,
          },
        },
      },
    },
    _source: ['timestamp'],
  });
  const timeStamp = [];
  response.hits.hits.forEach((doc) => {
    timeStamp.push(doc._source.timestamp);
  });
  return timeStamp;
};
