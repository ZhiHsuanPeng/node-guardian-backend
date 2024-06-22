const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const dotenv = require('dotenv');

dotenv.config();

const authenticate = async (req, res, next) => {
  try {
    const tokenInHeaders = req.get('Authorization');
    const token = tokenInHeaders?.split(' ')[1] || req.cookies.jwt;
    if (!token) {
      throw Error('You are not logged in! Please sign in to proceed!');
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRETS);
    res.locals.userId = decoded.id;
    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status(401).render('error', { msg: err.message });
      return;
    }
    res.status(401).json({ errors: 'authenticate failed' });
  }
};

module.exports = authenticate;
