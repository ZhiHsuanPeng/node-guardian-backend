const express = require('express');
const viewController = require('../controllers/viewController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.route('/signup').get(viewController.renderSignUpForm);
router.route('/signin').get(viewController.renderSignInForm);

router
  .route('/a/:accountName')
  .get(authenticate, viewController.renderAccountHomePage);
router
  .route('/a/:accountName/projects')
  .get(authenticate, viewController.renderOverViewPage);
router
  .route('/a/:accountName/prj/:prjName')
  .get(authenticate, viewController.renderBasicProjectPage);
router
  .route('/a/:accountName/prj/:prjName/err/:err')
  .get(authenticate, viewController.renderErrorDetailPage);

module.exports = router;
