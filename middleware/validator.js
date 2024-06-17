const { validationResult } = require('express-validator');

exports.handleResult = (req, res, next) => {
  const errorFormatter = ({ location, msg, param }) => `${location}[${param}]: ${msg}`;

  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  return next();
};
