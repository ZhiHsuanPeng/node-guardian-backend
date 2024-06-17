const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validator = require('../middleware/validator');

const router = express.Router();

router
  .route('/signUp')
  .post([
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('password').notEmpty().withMessage('Password is required'),
    validator.handleResult,
    authController.signUp,
  ]);
router
  .route('/signIn')
  .post([
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validator.handleResult,
    authController.signIn,
  ]);

module.exports = router;
