const dotenv = require('dotenv');
const crypto = require('crypto');
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

  await Promise.all(matchedKeys.map((key) => redis.set(key, 0)));
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
    const {
      userId,
      accountName,
      projectName,
      notification,
      alertFirst,
      timeWindow,
      quota,
    } = req.body;

    if (quota * 1 !== 0 && timeWindow === 'off') {
      throw Error('You cannot set quota without setting time window!');
    }

    await projectModel.changeProjectSettings(
      notification,
      alertFirst,
      timeWindow,
      quota,
      accountName,
      projectName,
    );

    const token = await projectModel.getProjectToken(userId, projectName);

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
  try {
    const { email, projectOwner, projectName, ownerId } = req.body;
    const url = process.env.DEV_URL || 'http://localhost:3000';

    const user = await userModel.findUserByEmail(email);
    const projectId = await projectModel.getProjectId(ownerId, projectName);

    const token = crypto.randomBytes(16).toString('hex');
    const confirmUrl = `${url}/api/v1/projects/access/${token}`;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if (user) {
      await mail.sendProjectInvitation(
        user.email,
        user.name,
        projectOwner,
        projectName,
        confirmUrl,
      );
      await redis.set(hashedToken, `${projectId},${user.id},${user.name}`);
      return res.status(200).json({ message: 'invitation sent!' });
    }

    // Handle situation when the teammate is not registered yet
    const signUpUrl = `${url}/signup/${token}`;
    console.log(signUpUrl);

    await mail.sendProjectInvitationAndSignUp(
      email,
      projectOwner,
      projectName,
      signUpUrl,
    );
    await redis.set(hashedToken, projectId);
    return res.status(200).json({ message: 'invitation sent!' });
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'modified project failed' });
  }
};

exports.grandAccessToMembers = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const data = await redis.get(hashedToken);
    if (!data) {
      return res.status(400).json({
        message: 'something went wrong, please ask for invitation email again!',
      });
    }
    const projectId = data.split(',')[0];
    const teamMate = data.split(',')[1];
    const userName = data.split(',')[2];
    if (await projectModel.isGrandAccessSuccess(projectId, teamMate)) {
      return res.status(200).redirect(`/a/${userName}`);
    }
    return res.status(500).json({
      message: 'Something went wrong!',
    });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'modified project failed' });
  }
};
