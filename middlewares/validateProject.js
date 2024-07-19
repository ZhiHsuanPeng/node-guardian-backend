const projectModel = require('../models_RDS/project');

const validateProject = async (req, res, next) => {
  const { prjName } = req.params;
  const userId = res.locals.userId;
  // this user is coming from middlewares validateUser
  const user = res.locals.user;
  const project = await projectModel.getProjectByUserIdAndProjectName(
    userId,
    prjName,
  );
  if (!project) {
    const url = `/a/${user[0].name}`;
    return res.status(404).render('404', { url });
  }
  return next();
};

module.exports = validateProject;
