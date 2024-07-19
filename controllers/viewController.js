/* eslint-disable function-paren-newline */
/* eslint-disable guard-for-in */
/* eslint-disable no-useless-escape */
/* eslint-disable no-restricted-syntax */
/* eslint-disable comma-dangle */
const crypto = require('crypto');
const errorLog = require('../models_Search/errorLog');
const projectModel = require('../models_RDS/project');
const userModel = require('../models_RDS/user');
const redis = require('../utils/redis');
const catchAsync = require('../utils/catchAsync');
const { ValidationError } = require('../utils/errorHandler');

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
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Singapore',
    hour12: false,
  });
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
    ipPercent[ip] = Math.round((count / totalDocs) * 100);
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
    let browser = doc.deviceInfo.browser.name;
    if (!browser) {
      browser = 'unknown';
    }
    let os = doc.deviceInfo.os.name;
    if (!os) {
      os = 'unknown';
    }

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
    browserPercentage[browser] = Math.round(
      (browserCounts[browser].length / totalDocs) * 100,
    );
  }

  for (const os in osCounts) {
    osPercentage[os] = Math.round((osCounts[os].length / totalDocs) * 100);
  }

  return { browserPercentage, osPercentage };
};
exports.renderSpecialSignUpForm = catchAsync(async (req, res) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const data = await redis.get(hashedToken);
  if (!data) {
    const redirectUrl = `${
      process.env.DEV_URL || process.env.LOCAL_URL
    }/signin`;
    return res.status(404).render('error', {
      message: 'Url expired or invalid! ask for invitations again!',
      redirectUrl,
    });
  }
  return res.status(200).render('specialSignUp', { token });
});

exports.renderHomePage = catchAsync(async (req, res) => {
  return res.status(200).render('home');
});

exports.renderSignUpForm = catchAsync(async (req, res) => {
  return res.status(200).render('signUp');
});

exports.renderSignInForm = catchAsync(async (req, res) => {
  return res.status(200).render('signIn');
});

exports.renderProfilePage = catchAsync(async (req, res) => {
  const { accountName } = req.params;
  const userId = res.locals.userId;
  const projectsArr = res.locals.project;
  const userInfo = await userModel.getUserInfoById(userId);

  return res
    .status(200)
    .render('profile', { projectsArr, accountName, userInfo });
});

exports.renderSettingTokenPage = catchAsync(async (req, res) => {
  const { accountName, prjName } = req.params;
  const userId = res.locals.userId;
  const projectsArr = res.locals.project;
  const token = await projectModel.getProjectToken(userId, prjName);

  return res.status(200).render('setting_token', {
    accountName,
    prjName,
    userId,
    token,
    projectsArr,
  });
});

exports.renderSettingGeneralPage = catchAsync(async (req, res) => {
  const { accountName, prjName } = req.params;
  const userId = res.locals.userId;
  const projectsArr = res.locals.project;
  const projectInfo = await projectModel.getProjectInfoByUserIdAndPrjName(
    userId,
    prjName,
  );
  const prjId = projectInfo.id;
  return res.status(200).render('setting_general', {
    prjName,
    accountName,
    userId,
    prjId,
    projectsArr,
  });
});

exports.renderSettingNotificationEmailsPage = async (req, res) => {
  try {
    const { accountName, prjName } = req.params;
    const userId = res.locals.userId;
    const projectsArr = res.locals.project;
    const projectRules = await projectModel.getProjectByUserIdAndProjectName(
      userId,
      prjName,
    );
    return res.status(200).render('notification_emails', {
      prjName,
      accountName,
      userId,
      projectRules,
      projectsArr,
    });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res
      .status(500)
      .json({ message: 'something went wrong, please try again!' });
  }
};

exports.renderSettingNotificationPage = async (req, res) => {
  try {
    const { accountName, prjName } = req.params;
    const userId = res.locals.userId;
    const projectsArr = res.locals.project;

    return res.status(200).render('setting_notifications', {
      prjName,
      accountName,
      userId,
      projectsArr,
    });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res
      .status(500)
      .json({ message: 'something went wrong, please try again!' });
  }
};

exports.renderSettingMemeberPage = async (req, res) => {
  try {
    const { accountName, prjName } = req.params;
    const userId = res.locals.userId;
    const projectsArr = res.locals.project;
    const data = await userModel.getOwnerByProjectNameAndAccountName(
      prjName,
      accountName,
    );
    const users = await userModel.getOtherUsers(data[0].projectId);
    return res.status(200).render('setting_members', {
      prjName,
      accountName,
      users,
      userId,
      projectsArr,
    });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res
      .status(500)
      .json({ message: 'something went wrong, please try again!' });
  }
};

exports.renderOverViewPage = async (req, res) => {
  try {
    const { accountName } = req.params;
    const userId = res.locals.userId;
    const user = await userModel.getUserInfoById(userId);

    if (!(user[0].name === accountName)) {
      const url = `/a/${user[0].name}`;
      return res.status(404).render('404', { url });
    }

    const projects = await projectModel.getAllProjectByUserId(userId);
    const projectsArr = Object.entries(projects);
    const projectTimeStamp = {};
    for (const row of projectsArr) {
      const ts = await errorLog.getAllProjectTimeStamp(row[1]);
      projectTimeStamp[row[0]] = ts;
    }
    const timeStamp = Object.entries(projectTimeStamp);
    const userList = {};
    for (const project of projectsArr) {
      userList[project[0]] = await userModel.getAllUserInProject(project[1]);
    }
    Object.values(userList).forEach((user, index) =>
      projectsArr[index].push(user.length),
    );
    const yesterday = new Date().getTime() - 24 * 60 * 60 * 1000;
    const theDayBeforeYesterday = new Date().getTime() - 48 * 60 * 60 * 1000;
    const oneDayBeforeErr = timeStamp.map(([name, ts]) => {
      return [
        name,
        ts.filter((s) => {
          if (s <= yesterday && s >= theDayBeforeYesterday) {
            return true;
          }
          return false;
        }),
      ];
    });
    const past1dayErr = timeStamp.map(([name, ts]) => {
      return [name, ts.filter((s) => s >= yesterday)];
    });
    past1dayErr.forEach((arr, index) => {
      let oneDayBefore = 0;
      if (
        !oneDayBeforeErr[index][1].length ||
        oneDayBeforeErr[index][1].length === 0
      ) {
        oneDayBefore = 0;
      } else {
        oneDayBefore = oneDayBeforeErr[index][1].length;
      }

      const changes1DayBefore = arr[1].length - oneDayBefore;
      arr.push(changes1DayBefore);
    });
    return res
      .status(200)
      .render('overview', { projectsArr, accountName, timeStamp, past1dayErr });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res
      .status(500)
      .json({ message: 'something went wrong, please try again!' });
  }
};

exports.renderBasicProjectPage = async (req, res) => {
  try {
    const { accountName, prjName } = req.params;
    const userId = res.locals.userId;
    const projectsArr = res.locals.project;

    const user = await userModel.getUserInfoById(userId);
    const project = await projectModel.getProjectByUserIdAndProjectName(
      userId,
      prjName,
    );
    if (!project) {
      const url = `/a/${user[0].name}`;
      return res.status(404).render('404', { url });
    }
    if (!(user[0].name === accountName)) {
      const url = `/a/${user[0].name}`;
      return res.status(404).render('404', { url });
    }

    const projectToken = await projectModel.getProjectToken(userId, prjName);
    const errorMessageAndCount = await errorLog.countErrorByErrorMessage(
      projectToken,
    );
    const errorMessageArr = Object.getOwnPropertyNames(errorMessageAndCount);
    const errorsTimeStampPromises = errorMessageArr.map(async (err) => {
      const timeStamp = await errorLog.getErrorTimeStampFilteredByTime(
        projectToken,
        err,
        24,
      );
      const allTimeWithIn30d = await errorLog.getErrorTimeStampFilteredByTime(
        projectToken,
        err,
        720,
      );
      return { err, timeStamp, allTimeWithIn30d };
    });

    const errorsTimeStampArray = await Promise.all(errorsTimeStampPromises);

    const recentTime = errorsTimeStampArray.map((ts) => {
      const recentTs = new Date(
        ts.allTimeWithIn30d.sort((a, b) => a - b)[
          ts.allTimeWithIn30d.length - 1
        ],
      );
      return transformUNIXtoDiff(recentTs);
    });

    const errObj = errorsTimeStampArray.map(({ err, timeStamp }, index) => ({
      err,
      count: errorMessageAndCount[err],
      timeStamp,
      recentTime:
        recentTime[index] === 'NaN days' ? 'gt 30 days' : recentTime[index],
      projectToken,
    }));
    for (const error of errObj) {
      const key = `${error.projectToken}-${error.err}`;
      const muteStatus = await redis.get(key);
      if (!isNaN(Number(muteStatus)) || !muteStatus || muteStatus === '0') {
        error.mute = false;
        error.muteTime = 0;
      } else if (muteStatus === 'resolve') {
        error.mute = false;
        error.muteTime = 0;
        error.resolve = true;
      } else {
        const muteTime = (muteStatus.split('_')[1] * 1) / 3600;
        error.mute = true;
        error.muteTime = muteTime;
      }
    }
    return res.status(200).render('projectBase', {
      errObj,
      errorMessageArr,
      accountName,
      prjName,
      projectToken,
      projectsArr,
    });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res
      .status(500)
      .json({ message: 'something went wrong, please try again!' });
  }
};

exports.renderErrorDetailPage = async (req, res) => {
  try {
    const { err, accountName, prjName } = req.params;
    const userId = res.locals.userId;
    const projectsArr = res.locals.project;
    const user = await userModel.getUserInfoById(userId);
    const project = await projectModel.getProjectByUserIdAndProjectName(
      userId,
      prjName,
    );
    if (!project) {
      const url = `/a/${user[0].name}`;
      return res.status(404).render('404', { url });
    }

    if (!(user[0].name === accountName)) {
      const url = `/a/${user[0].name}`;
      return res.status(404).render('404', { url });
    }

    const projectToken = await projectModel.getProjectToken(userId, prjName);
    const { latest, first, errTitle, all, timeStamp, latestErr } =
      await errorLog.getAllErrors(projectToken, err);

    const latestToTimeDiff = transformUNIXtoDiff(latest);
    const firstToTimeDiff = transformUNIXtoDiff(first);
    const latestDate = transformUNIXtoDate(latest);
    const firstDate = transformUNIXtoDate(first);
    const firstStack = extractPathFromStackTrace(
      latestErr.err.split('\n')[1],
    ).slice(1);
    const otherStack = latestErr.err.split('\n').slice(2);
    const ipPercentage = Object.entries(countIpPercent(all));

    const ipTimeStamp = Object.values(extractIpTimeStamp(all));
    const errCode = formatString(latestErr.code);
    const browserPercentage = Object.entries(
      Object.values(countDevicePercentage(all))[0],
    );
    const osPercentage = Object.entries(
      Object.values(countDevicePercentage(all))[1],
    );
    return res.status(200).render('errorDetail', {
      projectsArr,
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
      const url = '/home';
      return res.status(404).render('404', { url });
    }
    return res
      .status(500)
      .json({ message: 'something went wrong, please try again!' });
  }
};
