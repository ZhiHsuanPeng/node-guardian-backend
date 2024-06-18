/* eslint-disable guard-for-in */
/* eslint-disable no-useless-escape */
/* eslint-disable no-restricted-syntax */
/* eslint-disable comma-dangle */
const errorLog = require('../models_Search/errorLog');
const projectModel = require('../models_RDS/project');
const userModel = require('../models_RDS/user');

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
  const indentedLines = lines.map((line) => `  ${line}`);

  return indentedLines;
};

const countIpPercent = (docs) => {
  const ipCount = {};
  const totalDocs = docs.length;

  for (const doc of docs) {
    const ip = doc.filteredReqObj.requestIp;
    if (ipCount[ip]) {
      ipCount[ip] += 1;
    } else {
      ipCount[ip] = 1;
    }
  }

  const ipPercent = {};
  for (const [ip, count] of Object.entries(ipCount)) {
    ipPercent[ip] = (count / totalDocs) * 100;
  }

  return ipPercent;
};

const extractIpTimeStamp = (docs) => {
  const ipTimeStamp = {};

  for (const doc of docs) {
    const ip = doc.filteredReqObj.requestIp;
    if (ipTimeStamp[ip]) {
      ipTimeStamp[ip].push(doc.timestamp);
    } else {
      ipTimeStamp[ip] = [doc.timestamp];
    }
  }

  return ipTimeStamp;
};

const countDevicePercentage = (docs) => {
  const browserCounts = {};
  const osCounts = {};

  for (const doc of docs) {
    const browser = doc.deviceInfo.browser.name;
    const os = doc.deviceInfo.os.name;

    if (browserCounts[browser]) {
      browserCounts[browser].push(doc.timestamp);
    } else {
      browserCounts[browser] = [doc.timestamp];
    }

    if (osCounts[os]) {
      osCounts[os].push(doc.timestamp);
    } else {
      osCounts[os] = [doc.timestamp];
    }
  }

  const totalDocs = docs.length;
  const browserPercentage = {};
  const osPercentage = {};

  for (const browser in browserCounts) {
    browserPercentage[browser] = Math.round((browserCounts[browser].length / totalDocs) * 100);
  }

  for (const os in osCounts) {
    osPercentage[os] = Math.round((osCounts[os].length / totalDocs) * 100);
  }

  return { browserPercentage, osPercentage };
};

exports.renderOverViewPage = async (req, res) => {
  try {
    const { accountName } = req.params;
    const userId = res.locals.userId;
    if (!(await userModel.isUserIdAndNameMatched(accountName, userId))) {
      throw Error('page not found');
    }
    const projects = await projectModel.getAllProjectByUserId(userId);
    return res.status(200).render('overview', { projects });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'something went wrong, please try again!' });
  }
};

exports.renderBasicProjectPage = async (req, res) => {
  try {
    const { accountName, prjName } = req.params;
    const userId = res.locals.userId;

    if (!(await userModel.isUserIdAndNameMatched(accountName, userId))) {
      throw Error('page not found');
    }

    const projectToken = await projectModel.getProjectToken(userId, prjName);
    const errorMessageAndCount = await errorLog.countErrorByErrorMessage(projectToken);
    const errorMessageArr = Object.getOwnPropertyNames(errorMessageAndCount);
    const errorsTimeStampPromises = errorMessageArr.map(async (err) => {
      const timeStamp = await errorLog.getErrorTimeStampFilteredByTime(projectToken, err, 24);
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
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'something went wrong, please try again!' });
  }
};

exports.renderErrorDetailPage = async (req, res) => {
  try {
    const { err, accountName, prjName } = req.params;
    const userId = res.locals.userId;
    if (!(await userModel.isUserIdAndNameMatched(accountName, userId))) {
      throw Error('page not found');
    }

    const projectToken = await projectModel.getProjectToken(userId, prjName);
    const { latest, first, errTitle, all, timeStamp, latestErr } = await errorLog.getAllErrors(projectToken, err);

    const latestToTimeDiff = transformUNIXtoDiff(latest);
    const firstToTimeDiff = transformUNIXtoDiff(first);
    const latestDate = transformUNIXtoDate(latest);
    const firstDate = transformUNIXtoDate(first);
    const firstStack = extractPathFromStackTrace(latestErr.err.split('\n')[1]).slice(1);
    const otherStack = latestErr.err.split('\n').slice(2);
    const ipPercentage = Object.entries(countIpPercent(all));
    const ipTimeStamp = Object.values(extractIpTimeStamp(all));
    const errCode = formatString(latestErr.code);
    const browserPercentage = Object.entries(Object.values(countDevicePercentage(all))[0]);
    const osPercentage = Object.entries(Object.values(countDevicePercentage(all))[1]);
    return res.status(200).render('errorDetail', {
      accountName,
      prjName,
      latest,
      latestToTimeDiff,
      firstToTimeDiff,
      latestDate,
      firstDate,
      all,
      firstStack,
      otherStack,
      latestErr,
      errCode,
      errTitle,
      timeStamp,
      ipPercentage,
      ipTimeStamp,
      browserPercentage,
      osPercentage,
    });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'something went wrong, please try again!' });
  }
};
