const express = require('express');
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const authenticate = require('../middleware/authenticate');
const validator = require('../middleware/validator');

const router = express.Router();

router
  .route('/')
  .post([
    body('projectName')
      .notEmpty()
      .withMessage('Project name is required')
      .trim(),
    body('accessToken')
      .notEmpty()
      .withMessage('Project should have an accessToken'),
    validator.handleResult,
    authenticate,
    projectController.createProject,
  ]);

router
  .route('/')
  .patch(authenticate, projectController.modifyProjectAlertSettings);

router
  .route('/access')
  .post(authenticate, projectController.modifyProjectMembersSettings);

router.route('/access/:token').get(projectController.grandAccessToMembers);

router.route('/mute').post(projectController.muteErrorAlert);

module.exports = router;
