const express = require("express");
const multer = require("multer");
const router = express.Router();

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 파일 업로드 라우트
router.post("/upload", upload.single("image"), (req, res) => {
  res.send("파일 업로드 완료");
});

module.exports = router;
