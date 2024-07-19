/* eslint-disable no-unused-vars */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

const errorHandler = (err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') {
    const msg = 'please try again with different input';
    res.status(400).json({ message: msg });
    return;
  }
  if (err instanceof ValidationError) {
    res.status(400).json({ message: err.message });
    return;
  }
  if (err instanceof Error) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { ValidationError, errorHandler };
