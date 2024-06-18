const express = require('express');
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const authenticate = require('../middleware/authenticate');
const validator = require('../middleware/validator');

const router = express.Router();

router
  .route('/')
  .post([
    body('projectName').notEmpty().withMessage('Project name is required').trim(),
    body('accessToken').notEmpty().withMessage('Project should have an accessToken'),
    validator.handleResult,
    authenticate,
    projectController.createProject,
  ]);

module.exports = router;
