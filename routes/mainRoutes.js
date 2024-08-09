const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

router.get('/main', mainController.mainRender);

module.exports = router;
