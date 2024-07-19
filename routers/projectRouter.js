const express = require('express');
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const authenticate = require('../middlewares/authenticate');
const validator = require('../middlewares/validator');

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
  ])
  .patch(authenticate, projectController.modifyProjectSettings);

router
  .route('/access')
  .post(authenticate, projectController.modifyProjectMembersSettings);

router.route('/access/:token').get(projectController.grandAccessToMembers);

router.route('/mute').post(projectController.muteErrorAlert);
router.route('/resolve').post(projectController.resolveError);

module.exports = router;
