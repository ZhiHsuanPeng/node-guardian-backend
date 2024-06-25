const jwt = require('jsonwebtoken');
const { truncate } = require('fs');
const crypto = require('crypto');
const argon2 = require('argon2');
const userModel = require('../models_RDS/user');
const projectModel = require('../models_RDS/project');
const redis = require('../utils/redis');

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

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      throw Error('user email does not exist!');
    }
    if (await argon2.verify(user.password, password)) {
      return signTokenAndSendCookie(res, user.id, user.name, user.email);
    }
    throw Error('incorrect password');
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ errors: 'log in failed' });
  }
};

exports.signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = await userModel.createUser(name, email, password);
    return signTokenAndSendCookie(res, userId, name, email);
  } catch (err) {
    if (err.sqlState === '23000') {
      return res.status(400).json({ message: 'User email already exits!' });
    }
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ errors: 'sign up failed' });
  }
};
exports.specialSignUp = async (req, res) => {
  try {
    const { token, name, email, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const data = await redis.get(hashedToken);
    if (!data) {
      return res.status(400).json({
        message:
          'something went wrong, please ask for the invitation email again!',
      });
    }

    const userId = await userModel.createUser(name, email, password);
    if (await projectModel.isGrandAccessSuccess(data * 1, userId)) {
      return signTokenAndSendCookie(res, userId, name, email);
    }
    return new Error('Something went wrong! Please try again!');
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ errors: 'sign up failed' });
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: truncate,
  });
  res.status(200).json({ status: 'success' });
};
