const { validationResult } = require('express-validator');

exports.handleResult = (req, res, next) => {
  const errorFormatter = ({ msg }) => `error: ${msg} `;

  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(400).json({ message: result.array() });
  }
  return next();
};
