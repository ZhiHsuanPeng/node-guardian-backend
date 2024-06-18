const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const userModel = require('../models_RDS/user');

const signTokenAndSendCookie = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRETS, { expiresIn: 7 * 24 * 60 * 60 });

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
  };
  res.cookie('jwt', token, cookieOptions);
  return res.status(200).json({ message: 'cookie sent!' });
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      throw Error('user email does not exist!');
    }
    if (await argon2.verify(user.password, password)) {
      return signTokenAndSendCookie(res, user.id);
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
    return signTokenAndSendCookie(res, userId);
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
