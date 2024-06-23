const dotenv = require('dotenv');
const projectModel = require('../models_RDS/project');
const userModel = require('../models_RDS/user');
const mail = require('../utils/mail');
const pool = require('../models_RDS/databasePool');
const elasticSearchClient = require('../models_Search/elasticSearch');
const redis = require('../utils/redis');

dotenv.config();

const resetAlert = async (token) => {
  const keys = await redis.keys('*');

  const regex = new RegExp(`^${token}-`);

  const matchedKeys = keys.filter((key) => regex.test(key));

  const values = await Promise.all(matchedKeys.map((key) => redis.set(key, 0)));
  console.log(values);
};

exports.createProject = async (req, res) => {
  try {
    const { projectName, accessToken } = req.body;
    const userId = res.locals.userId;
    if (await projectModel.isProjectNameExist(userId, projectName)) {
      throw Error('project name already exists!');
    }
    await projectModel.createProject(userId, projectName, accessToken);
    await elasticSearchClient.indices.create({
      index: accessToken,
    });
    res.status(200).json({ message: 'create project success' });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: 'create project failed' });
  }
};

exports.modifyProjectAlertSettings = async (req, res) => {
  try {
    const { accountName, projectName, alertFirst, timeWindow, quota } =
      req.body;

    if (quota * 1 !== 0 && timeWindow === 'off') {
      throw Error('You cannot set quota without setting time window!');
    }

    await pool.query(
      `UPDATE projects p
        INNER JOIN access a ON p.id = a.projectId
        INNER JOIN users u ON u.id = a.userId
        SET p.alertFirst = ?, p.timeWindow = ?, p.quota = ?
        WHERE u.name = ? AND p.name = ?`,
      [alertFirst, timeWindow, quota, accountName, projectName],
    );

    const result = await pool.query(
      'SELECT token FROM projects WHERE name = ?',
      [projectName],
    );
    const token = result[0][0].token;
    await resetAlert(token);

    return res.status(200).json({ message: 'change setting success' });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'modified project failed' });
  }
};

exports.modifyProjectMembersSettings = async (req, res) => {
  const { email, projectOwner, projectName } = req.body;
  const user = await userModel.findUserByEmail(email);
  console.log(user);
  if (user) {
    await mail.sendProjectInvitation(
      user.email,
      user.name,
      projectOwner,
      projectName,
    );
  }
  return res.status(200).json({ message: 'invitation sent!' });
};
