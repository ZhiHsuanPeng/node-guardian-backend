const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const dotenv = require('dotenv');

dotenv.config();

const authenticate = async (req, res, next) => {
  try {
    const tokenInHeaders = req.get('Authorization');
    const token = tokenInHeaders?.split(' ')[1] || req.cookies.jwt;
    if (!token) {
      throw Error('You are not logged in!');
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRETS);
    res.locals.userId = decoded.id;
    next();
  } catch (err) {
    const redirectUrl = `${
      process.env.DEV_URL || process.env.LOCAL_URL
    }/signin`;
    if (err.name === 'JsonWebTokenError' || err.name === 'SyntaxError') {
      return res.status(401).render('error', {
        message: 'invalid credentials, please sign in again',
        redirectUrl,
      });
    }

    return res.status(401).render('error', {
      message: err.message,
      redirectUrl,
    });
  }
};

module.exports = authenticate;
