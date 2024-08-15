const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.get('/:roomNum', reviewController.showReviewList);
router.get('/:roomNum/:promiseNum', reviewController.renderReviewPage);
router.post('/:roomNum/:promiseNum', reviewController.createReview);

module.exports = router; 