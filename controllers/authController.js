const jwt = require('jsonwebtoken');
const { truncate } = require('fs');
const crypto = require('crypto');
const argon2 = require('argon2');
const userModel = require('../models_RDS/user');
const projectModel = require('../models_RDS/project');
const redis = require('../utils/redis');
const catchAsync = require('../utils/catchAsync');
const { ValidationError } = require('../utils/errorHandler');

const signTokenAndSendCookie = (res, id, name, email) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRETS, {
    expiresIn: 7 * 24 * 60 * 60,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: true,
  };
  res.cookie('jwt', token, cookieOptions);
  return res
    .status(200)
    .json({ message: 'cookie sent!', data: { user: { name, email } } });
};

exports.signIn = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw new ValidationError('user email does not exist!');
  }
  if (await argon2.verify(user.password, password)) {
    return signTokenAndSendCookie(res, user.id, user.name, user.email);
  }
  throw new ValidationError('incorrect password!');
});

exports.signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userId = await userModel.createUser(name, email, password);
    return signTokenAndSendCookie(res, userId, name, email);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return next(new ValidationError('user email already exists!'));
    }
    return next(Error('sign up fail! please try again later!'));
  }
};

exports.specialSignUp = catchAsync(async (req, res) => {
  const { token, name, email, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const data = await redis.get(hashedToken);
  if (!data) {
    throw new Error(
      'something is wrong with the invitation! please ask for it again!',
    );
  }
  const userId = await userModel.createUser(name, email, password);
  if (await projectModel.isGrandAccessSuccess(data * 1, userId)) {
    await redis.del(hashedToken);
    return signTokenAndSendCookie(res, userId, name, email);
  }
  await redis.del(hashedToken);
  throw new Error(
    'something is wrong with the invitation! please ask for it again!',
  );
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: truncate,
  });
  res.status(200).json({ status: 'success' });
};
