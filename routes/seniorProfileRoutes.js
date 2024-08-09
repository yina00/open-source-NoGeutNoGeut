// routes/seniorProfileRoutes.js
const express = require('express');
const router = express.Router();
const oldProfileController = require('../controllers/oldProfileController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/create', oldProfileController.createOldProfile);
router.post('/create', upload.single('profileImage'), oldProfileController.createSeniorProfile);

module.exports = router;
