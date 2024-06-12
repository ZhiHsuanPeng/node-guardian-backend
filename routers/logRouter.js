const express = require('express');
const logControllers = require('../controllers/logController');

const router = express.Router();

router.route('/newLogs').post(logControllers.insertNewLogs);

module.exports = router;
