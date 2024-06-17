const express = require('express');
const logController = require('../controllers/logController');

const router = express.Router();

router.route('/newLogs').post(logController.insertNewLogs);

module.exports = router;
