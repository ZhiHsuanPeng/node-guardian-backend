const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validator = require('../middleware/validator');

const router = express.Router();

router
  .route('/signUp')
  .post([
    body('email').isEmail().normalizeEmail(),
    body('name').exists().notEmpty().trim(),
    body('password').exists().notEmpty(),
    validator.handleResult,
    authController.signUp,
  ]);
router.route('/login').post(authController.login);

module.exports = router;
