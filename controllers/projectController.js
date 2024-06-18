const projectModel = require('../models_RDS/project');

exports.createProject = async (req, res) => {
  try {
    const { projectName, accessToken } = req.body;
    const userId = res.locals.userId;
    await projectModel.createProject(userId, projectName, accessToken);
    res.status(200).json({ message: `create project success` });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: 'create project failed' });
  }
};
