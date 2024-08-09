const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filterController');

router.get('/', filterController.renderFilter);
router.post('/filter', filterController.filterProfiles);

module.exports = router;
