const express = require('express');
const router = express.Router();
const youngProfileController = require('../controllers/youngProfileController');
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

router.get('/create', youngProfileController.createYoungProfile);
router.post('/create', upload.single('profileImage'), youngProfileController.createStudentProfile);

module.exports = router;
