const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.get('/:promiseNum/:matchingNum', reviewController.renderReviewPage);
router.post('/:promiseNum/:matchingNum', reviewController.createReview);

module.exports = router; 