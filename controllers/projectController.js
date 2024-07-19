const dotenv = require('dotenv');
const crypto = require('crypto');
const projectModel = require('../models_RDS/project');
const userModel = require('../models_RDS/user');
const mail = require('../utils/mail');
const elasticSearchClient = require('../models_Search/elasticSearch');
const redis = require('../utils/redis');
const catchAsync = require('../utils/catchAsync');
const { ValidationError } = require('../utils/errorHandler');

dotenv.config();

const resetAlert = async (token) => {
  const keys = await redis.keys('*');

  const regex = new RegExp(`^${token}-`);

  const matchedKeys = keys.filter((key) => regex.test(key));

  await Promise.all(matchedKeys.map((key) => redis.set(key, 0)));
};

exports.createProject = catchAsync(async (req, res, next) => {
  const { projectName, accessToken } = req.body;
  const invalidCharacters = /[\s!@#$%^&*()\-+=\[\]{}|\\:;"'<>,.?/~`]/;
  const userId = res.locals.userId;

  if (invalidCharacters.test(projectName)) {
    return next(
      new ValidationError(
        'Project name invalid, the name of the project should not contain any spcial characters.',
      ),
    );
  }

  if (await projectModel.isProjectNameExist(userId, projectName)) {
    return next(new ValidationError('project name already exists!'));
  }
  await projectModel.createProject(userId, projectName, accessToken);
  await elasticSearchClient.indices.create({
    index: accessToken,
  });
  return res.status(200).json({ message: 'create project success' });
});

exports.modifyProjectSettings = catchAsync(async (req, res, next) => {
  const {
    userId,
    prjId,
    newProjectName,
    accountName,
    projectName,
    notification,
    alertFirst,
    timeWindow,
    quota,
    reactivate,
  } = req.body;

  if (newProjectName && prjId) {
    await projectModel.changeProjectName(prjId, newProjectName);
    return res
      .status(200)
      .json({ message: 'Change Project Name Successfully!' });
  }

  if (quota * 1 !== 0 && timeWindow === 'off') {
    return next(
      ValidationError('You cannot set quota without setting the time window!'),
    );
  }

  await projectModel.changeProjectSettings(
    notification,
    alertFirst,
    timeWindow,
    quota,
    accountName,
    projectName,
    reactivate,
  );

  const token = await projectModel.getProjectToken(userId, projectName);

  if (timeWindow === 'off' && quota * 1 === 0) {
    await redis.del(token);
  }

  await resetAlert(token);

  return res.status(200).json({ message: 'change setting success' });
});

exports.modifyProjectMembersSettings = catchAsync(async (req, res) => {
  const { email, projectOwner, projectName, ownerId } = req.body;
  const url = process.env.DEV_URL || 'http://localhost:3000';

  const user = await userModel.findUserByEmail(email);
  const projectId = await projectModel.getProjectId(ownerId, projectName);

  const token = crypto.randomBytes(16).toString('hex');
  const confirmUrl = `${url}/api/v1/projects/access/${token}`;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // For registered user
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

  // For unregistered user
  const signUpUrl = `${url}/signup/${token}`;

  await mail.sendProjectInvitationAndSignUp(
    email,
    projectOwner,
    projectName,
    signUpUrl,
  );
  await redis.set(hashedToken, projectId, 'EX', 3600);
  return res.status(200).json({ message: 'invitation sent!' });
});

exports.grandAccessToMembers = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const data = await redis.get(hashedToken);
  if (!data) {
    return next(new ValidationError('please ask for invitation email again!'));
  }
  const projectId = data.split(',')[0];
  const teamMate = data.split(',')[1];
  const userName = data.split(',')[2];
  if (await projectModel.isGrandAccessSuccess(projectId, teamMate)) {
    return res.status(200).redirect(`/a/${userName}`);
  }
  return next(new Error('something went wrong! please try again later'));
});

exports.muteErrorAlert = catchAsync(async (req, res, next) => {
  const { projecToken, errMessage, mute } = req.body;
  const value = await redis.get(`${projecToken}-${errMessage}`);
  if (value === 'resolve') {
    return next(new ValidationError('cannot mute resolved error'));
  }
  if (mute === '0') {
    await redis.set(`${projecToken}-${errMessage}`, 0);
  } else {
    await redis.set(
      `${projecToken}-${errMessage}`,
      `mute_${mute}`,
      'EX',
      mute * 1,
    );
  }

  return res.status(200).json({ message: 'success' });
});

exports.resolveError = catchAsync(async (req, res) => {
  const { projecToken, errMessage, resolve } = req.body;
  if (resolve === true) {
    await redis.set(`${projecToken}-${errMessage}`, 'resolve');
  } else {
    await redis.set(`${projecToken}-${errMessage}`, 0);
  }
  return res.status(200).json({ message: 'success' });
});
