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
  res.status(200).render('projectBase', { errorMessageAndCount, errorsTimeStampArray });
};
