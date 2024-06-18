const express = require('express');
const viewController = require('../controllers/viewController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.route('/a/:accountName').get(viewController.renderOverViewPage);
router.route('/a/:accountName/prj/:prjName').get(viewController.renderBasicProjectPage);
router.route('/a/:accountName/prj/:prjName/err/:err').get(viewController.renderErrorDetailPage);

module.exports = router;
