/* eslint-disable comma-dangle */
const errorLog = require('../models_openSearch/errorLog');

const transformUNIXtoDiff = (unix) => {
  const timeStamp = new Date(unix);
  const now = Date.now();
  const timeStampDifference = now - timeStamp;
  let formattedResult = '';
  if (timeStampDifference < 3600 * 1000) {
    const minutes = Math.floor(timeStampDifference / 60000);
    formattedResult = `${minutes} minutes`;
  } else if (timeStampDifference < 86400 * 1000) {
    const hours = Math.floor(timeStampDifference / 3600000);
    if (hours === 1) {
      formattedResult = `${hours} hour`;
    } else {
      formattedResult = `${hours} hours`;
    }
  } else {
    const days = Math.floor(timeStampDifference / 86400000);
    if (days === 1) {
      formattedResult = `${days} day`;
    } else {
      formattedResult = `${days} days`;
    }
  }
  return formattedResult;
};

const transformUNIXtoDate = (unix) => {
  const date = new Date(unix);
  return date.toLocaleString('en-US', { timeZone: 'Asia/Singapore', hour12: false });
};

const extractPathFromStackTrace = (stackTrace) => {
  const regex = /\/(?:[^\/]+\/)+[^\/]+\.[^\/]+/;
  const match = stackTrace.match(regex);
  return match ? match[0] : '';
};

const formatString = (str) => {
  const formattedString = str.replace(/\r?\n|\r/g, '\n');

  const lines = formattedString.split('\n');
  const indentedLines = lines.map((line) => '  ' + line);

  return indentedLines;
};

exports.renderBasicProjectPage = async (req, res) => {
  const { accountName, prjName } = req.params;
  const errorMessageAndCount = await errorLog.countErrorByErrorMessage('123');

  const errorMessageArr = Object.getOwnPropertyNames(errorMessageAndCount);
  const errorsTimeStampPromises = errorMessageArr.map(async (err) => {
    const timeStamp = await errorLog.getErrorTimeStampFilteredByTime('123', err, 24);
    return { err, timeStamp };
  });
  const errorsTimeStampArray = await Promise.all(errorsTimeStampPromises);
  const recentTime = errorsTimeStampArray.map((ts) => {
    const recentTs = new Date(ts.timeStamp.sort((a, b) => a - b)[ts.timeStamp.length - 1]);
    return transformUNIXtoDiff(recentTs);
  });
  const errObj = errorsTimeStampArray.map(({ err, timeStamp }, index) => ({
    err,
    count: errorMessageAndCount[err],
    timeStamp,
    recentTime: recentTime[index],
  }));
  return res.status(200).render('projectBase', { errObj, errorMessageArr, accountName, prjName });
};

exports.renderErrorDetailPage = async (req, res) => {
  const { err } = req.params;
  const { latest, first, errTitle, all, timeStamp, latestErr } = await errorLog.getAllErrors(
    '123',
    'Error: HAHA! Another error!'
  );
  const latestToTimeDiff = transformUNIXtoDiff(latest);
  const firstToTimeDiff = transformUNIXtoDiff(first);
  const latestDate = transformUNIXtoDate(latest);
  const firstDate = transformUNIXtoDate(first);
  const firstStack = extractPathFromStackTrace(latestErr.err.split('\n')[1]).slice(1);
  const errCode = formatString(latestErr.code);
  console.log(errCode);
  return res.status(200).render('errorDetail', {
    latest,
    latestToTimeDiff,
    firstToTimeDiff,
    latestDate,
    firstDate,
    all,
    firstStack,
    latestErr,
    errCode,
    errTitle,
    timeStamp,
  });
};
