const express = require('express');
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");

router.get("/test", appointmentController.showPage);

module.exports = router;