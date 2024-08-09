const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/reportForm', reportController.showReportForm);
router.post('/submitReport', upload.single('reportMedia'), reportController.submitReport);
router.get('/reportList', reportController.renderReportListPage);
router.get('/report/:reportNum', reportController.viewReport);
router.get('/pendingReports', reportController.pendingReports);
router.post('/confirmReport/:reportNum', reportController.confirmReport);

module.exports = router;
