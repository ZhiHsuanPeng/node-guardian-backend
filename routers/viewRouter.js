const express = require('express');
const viewController = require('../controllers/viewController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.route('/signUp').get(viewController.renderSignUpForm);
router.route('/signIn').get(viewController.renderSignInForm);

router.route('/a/:accountName').get(authenticate, viewController.renderOverViewPage);
router.route('/a/:accountName/prj/:prjName').get(authenticate, viewController.renderBasicProjectPage);
router.route('/a/:accountName/prj/:prjName/err/:err').get(authenticate, viewController.renderErrorDetailPage);

module.exports = router;
