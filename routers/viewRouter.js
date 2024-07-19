const express = require('express');
const viewController = require('../controllers/viewController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.route('/home').get(viewController.renderHomePage);
router.route('/signup').get(viewController.renderSignUpForm);
router.route('/signup/:token').get(viewController.renderSpecialSignUpForm);
router.route('/signin').get(viewController.renderSignInForm);
// router.route('/a/*', authenticate);
router
  .route('/a/:accountName/profile')
  .get(authenticate, viewController.renderProfilePage);
router
  .route('/a/:accountName')
  .get(authenticate, viewController.renderOverViewPage);
router
  .route('/a/:accountName/prj/:prjName')
  .get(authenticate, viewController.renderBasicProjectPage);
router
  .route('/a/:accountName/prj/:prjName/err/:err')
  .get(authenticate, viewController.renderErrorDetailPage);

router
  .route('/a/:accountName/:prjName/settings/members')
  .get(authenticate, viewController.renderSettingMemeberPage);

router
  .route('/a/:accountName/:prjName/settings/notifications')
  .get(authenticate, viewController.renderSettingNotificationPage);

router
  .route('/a/:accountName/:prjName/settings/notifications/emails')
  .get(authenticate, viewController.renderSettingNotificationEmailsPage);

router
  .route('/a/:accountName/:prjName/settings/general')
  .get(authenticate, viewController.renderSettingGeneralPage);

router
  .route('/a/:accountName/:prjName/settings/token')
  .get(authenticate, viewController.renderSettingTokenPage);

module.exports = router;
