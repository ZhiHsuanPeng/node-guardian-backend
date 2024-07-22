const express = require('express');
const view = require('../controllers/viewController');
const authenticate = require('../middlewares/authenticate');
const fetchProjectsInfo = require('../middlewares/fetchProjectsInfo');
const validateUser = require('../middlewares/validateUser');
const validateProject = require('../middlewares/validateProject');

const router = express.Router();

router.route('/home').get(view.renderHomePage);
router.route('/signup').get(view.renderSignUpForm);
router.route('/signup/:token').get(view.renderSpecialSignUpForm);
router.route('/signin').get(view.renderSignInForm);

router.use('/a/*', authenticate, fetchProjectsInfo);

// middleware to check url value

router.use('/a/:accountName*', validateUser);
router.route('/a/:accountName/profile').get(view.renderProfilePage);
router.route('/a/:accountName').get(view.renderOverViewPage);

router.use('/a/:accountName/prj/:prjName*', validateProject);
router.route('/a/:accountName/prj/:prjName').get(view.renderBasicProjectPage);
router
  .route('/a/:accountName/prj/:prjName/err/:err')
  .get(view.renderErrorDetailPage);

router.use('/a/:accountName/:prjName*', validateProject);
router
  .route('/a/:accountName/:prjName/settings/members')
  .get(view.renderSettingMemeberPage);
router
  .route('/a/:accountName/:prjName/settings/notifications')
  .get(view.renderSettingNotificationPage);
router
  .route('/a/:accountName/:prjName/settings/notifications/emails')
  .get(view.renderSettingNotificationEmailsPage);
router
  .route('/a/:accountName/:prjName/settings/general')
  .get(view.renderSettingGeneralPage);
router
  .route('/a/:accountName/:prjName/settings/token')
  .get(view.renderSettingTokenPage);

module.exports = router;
