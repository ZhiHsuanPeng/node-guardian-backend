const projectModel = require('../models_RDS/project');

const fetchInfo = async (req, res, next) => {
  const userId = res.locals.userId;
  const projectsArr = Object.entries(
    await projectModel.getAllProjectByUserId(userId),
  );
  res.locals.project = projectsArr;
  next();
};

module.exports = fetchInfo;
