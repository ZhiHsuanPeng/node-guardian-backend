const openSearchClient = require('./openSearch');
const elasticSearchClient = require('./elastiSearch');

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
            size: 100,
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

exports.getErrorTimeStampFilteredByTime = async (accessToken, errorMessage, hours) => {
  const hoursAgoTimeStamp = Date.now() - hours * 60 * 60 * 1000 + 60 * 60 * 1000;
  const response = await elasticSearchClient.search({
    index: accessToken,
    body: {
      size: 100,
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
      size: 100,
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
  const errorDetail = { latest: '', first: '', errTitle: err, all: [], timeStamp: [], latestErr: '' };
  errorDetail.latestErr = result[0]._source;
  errorDetail.latest = result[0]._source.timestamp;
  errorDetail.first = result[result.length - 1]._source.timestamp;
  result.forEach((error) => {
    errorDetail.timeStamp.push(error._source.timestamp);
    errorDetail.all.push(error._source);
  });
  return errorDetail;
};

async function deleteAllDocuments(index) {
  try {
    const response = await elasticSearchClient.deleteByQuery({
      index,
      body: {
        query: {
          match_all: {},
        },
      },
    });
    console.log(response);
  } catch (error) {
    console.error('Error deleting documents:', error);
  }
}
