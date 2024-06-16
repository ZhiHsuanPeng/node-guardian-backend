const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

router.route('/a/:accountName/prj/:prjName').get(viewController.renderBasicProjectPage);
router.route('/a/:accountName/prj/:prjName/err/:err').get(viewController.renderErrorDetailPage);

module.exports = router;
