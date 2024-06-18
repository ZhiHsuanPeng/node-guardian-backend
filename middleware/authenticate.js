const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const dotenv = require('dotenv');

dotenv.config();

const authenticate = async (req, res, next) => {
  try {
    const tokenInHeaders = req.get('Authorization');
    const token = tokenInHeaders?.split(' ')[1] || req.cookies.jwt;

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRETS);
    res.locals.userId = decoded.id;
    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status(401).json({ errors: err.message });
      return;
    }
    res.status(401).json({ errors: 'authenticate failed' });
  }
};

module.exports = authenticate;
