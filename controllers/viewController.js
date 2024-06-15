const errorLog = require('../models_openSearch/errorLog');

exports.renderBasicProjectPage = async (req, res) => {
  //   const { query } = req;
  const errorMessageAndCount = await errorLog.countErrorByErrorMessage('123');

  const errorMessageArr = Object.getOwnPropertyNames(errorMessageAndCount);
  const errorsTimeStampPromises = errorMessageArr.map(async (err) => {
    const timeStamp = await errorLog.getErrorTimeStampFilteredByTime('123', err, 24);
    return { err, timeStamp };
  });
  const errorsTimeStampArray = await Promise.all(errorsTimeStampPromises);
  const recentTime = errorsTimeStampArray.map((ts) => {
    const recentTs = new Date(ts.timeStamp.sort((a, b) => a - b)[ts.timeStamp.length - 1]);
    const now = Date.now();
    const timestampDifference = now - recentTs;
    let formattedTimeDifference = '';
    if (timestampDifference < 3600 * 1000) {
      const minutes = Math.floor(timestampDifference / 60000);
      formattedTimeDifference = `${minutes} minutes`;
    } else if (timestampDifference < 86400 * 1000) {
      const hours = Math.floor(timestampDifference / 3600000);
      formattedTimeDifference = `${hours} hours`;
    } else {
      const days = Math.floor(timestampDifference / 86400000);
      formattedTimeDifference = `${days} days`;
    }
    return formattedTimeDifference;
  });
  const errObj = errorsTimeStampArray.map(({ err, timeStamp }, index) => ({
    err,
    count: errorMessageAndCount[err],
    timeStamp,
    recentTime: recentTime[index],
  }));
  return res.status(200).render('projectBase', { errObj, errorMessageArr });
};
