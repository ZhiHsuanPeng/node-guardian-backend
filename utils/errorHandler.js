/* eslint-disable no-unused-vars */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err instanceof ValidationError) {
    res.status(400).json({ message: err.message });
    return;
  }
  if (err instanceof Error) {
    res.status(500).json({ errors: err.message });
    return;
  }
  res.status(500).send('Oops, unknown error');
};

module.exports = { ValidationError, errorHandler };
