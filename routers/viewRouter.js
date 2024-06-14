const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

router.route('/a/:accountName/prj/:prjname').get(viewController.renderBasicProjectPage);

module.exports = router;
