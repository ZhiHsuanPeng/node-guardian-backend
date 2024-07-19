const express = require('express');
const viewController = require('../controllers/viewController');
const authenticate = require('../middlewares/authenticate');
const fetchProjectsInfo = require('../middlewares/fetchProjectsInfo');
const validateUser = require('../middlewares/validateUser');
const validateProject = require('../middlewares/validateProject');

const router = express.Router();

router.route('/home').get(viewController.renderHomePage);
router.route('/signup').get(viewController.renderSignUpForm);
router.route('/signup/:token').get(viewController.renderSpecialSignUpForm);
router.route('/signin').get(viewController.renderSignInForm);

router.use('/a/*', authenticate, fetchProjectsInfo);

// middleware to check url value

router.use('/a/:accountName*', validateUser);
router.route('/a/:accountName/profile').get(viewController.renderProfilePage);
router.route('/a/:accountName').get(viewController.renderOverViewPage);

router.use('/a/:accountName/prj/:prjName*', validateProject);
router
  .route('/a/:accountName/prj/:prjName')
  .get(viewController.renderBasicProjectPage);
router
  .route('/a/:accountName/prj/:prjName/err/:err')
  .get(viewController.renderErrorDetailPage);

router.use('/a/:accountName/:prjName*', validateProject);
router
  .route('/a/:accountName/:prjName/settings/members')
  .get(viewController.renderSettingMemeberPage);
router
  .route('/a/:accountName/:prjName/settings/notifications')
  .get(viewController.renderSettingNotificationPage);
router
  .route('/a/:accountName/:prjName/settings/notifications/emails')
  .get(viewController.renderSettingNotificationEmailsPage);
router
  .route('/a/:accountName/:prjName/settings/general')
  .get(viewController.renderSettingGeneralPage);
router
  .route('/a/:accountName/:prjName/settings/token')
  .get(viewController.renderSettingTokenPage);

module.exports = router;
