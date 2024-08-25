const express = require('express');
const logController = require('../controllers/logController');

const router = express.Router();

router.route('/newLogs').post(logController.insertNewLogs);
router.route('/search').post(logController.searchLogs);

module.exports = router;
